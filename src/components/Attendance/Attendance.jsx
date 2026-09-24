import { useMemo, useState, useEffect, useCallback } from "react";
import { Row, Col, Tabs, Tab } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import {
  FiUserCheck,
  FiUserX,
  // FiClock,
  // FiClipboard,
  FiEye,
} from "react-icons/fi";

import { getAttendanceByType } from "../../services/attendanceService";

import { initialsFromName } from "../../utils/initialsFromName";

import toast from "react-hot-toast";
import { ThreeDots } from "react-loader-spinner";

import StatCard from "../../components/ui/StatCard/StatCard";
import TableToolbar from "../../components/ui/TableToolbar/TableToolbar";
import Table from "../../components/ui/Table/Table";
import TablePagination from "../../components/ui/TablePagination/TablePagination";

const Attendance = () => {
  const [records, setRecords] = useState([]);
  const [statistics, setStatistics] = useState({});

  const [activeTab, setActiveTab] = useState("student");

  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  const [isAttendanceLoading, setIsAttendanceLoading] = useState(true);

  const pageSize = 5;

  const navigate = useNavigate();

  const columns = useMemo(
    () => [
      {
        header: "Name",
        accessor:
          activeTab === "student"
            ? "studentName"
            : activeTab === "trainer"
              ? "trainerName"
              : "staffName",

        cell: (row) => (
          <div className="common-management-name-cell">
            <div className="common-management-avatar">
              {initialsFromName(
                row.studentName || row.trainerName || row.staffName,
              )}
            </div>

            <div>
              <h6
                className="common-management-table-name"
                title={
                  row.studentName || row.trainerName || row.staffName || "-"
                }
              >
                {row.studentName || row.trainerName || row.staffName || "-"}
              </h6>
              <span>{row.attendanceNo || "-"}</span>
            </div>
          </div>
        ),
      },

      ...(activeTab === "student"
        ? [
            {
              header: "Batch",
              accessor: "batch",
            },
          ]
        : []),

      {
        header: "Date",
        accessor: "date",
      },

      // Session only for Player
      // ...(activeTab === "student"
      //   ? [
      //       {
      //         header: "Session",
      //         accessor: "session",
      //       },
      //     ]
      //   : []),

      {
        header: "Status",
        accessor: "status",

        cell: (row) => (
          <span
            className={
              row.status === "Present"
                ? "common-management-table-status-success"
                : row.status === "Absent"
                  ? "common-management-table-status-danger"
                  : "common-management-table-status-warning"
            }
          >
            {row.status}
          </span>
        ),
      },
    ],
    [activeTab],
  ); 

  const fetchAttendance = useCallback(async () => {
    try {
      const employeeType =
        activeTab === "student"
          ? "Player"
          : activeTab === "trainer"
            ? "Coach"
            : "Staff";

      const response = await getAttendanceByType({
        employee_type: employeeType,
      });

      if (response.statusCode === 200) {
        const attendanceList = response.data.attendance || [];

        const formattedRecords = attendanceList.map((item) => ({
          employeeId: item.attendance_id,
          employeeType: item.employee_type,
          attendanceNo: item.code,

          studentName: activeTab === "student" ? item.name : "",
          trainerName: activeTab === "trainer" ? item.name : "",
          staffName: activeTab === "staff" ? item.name : "",

          batch: item.batch,
          date: item.date,
          session: item.session,
          status: item.attendance_status,
        }));

        setRecords(formattedRecords);
        setStatistics(response.data.statistics || {});
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Get Attendance Error:", error);

      toast.error(error.response?.data?.message);
    }
  }, [activeTab]);

  useEffect(() => {
    const loadAttendacne = async () => {
      setIsAttendanceLoading(true);

      try {
        await fetchAttendance();
      } finally {
        setIsAttendanceLoading(false);
      }
    };

    loadAttendacne();
  }, [fetchAttendance]);

  const handleClearFilters = () => {
    setSearch("");
    setActiveFilters({});
    setCurrentPage(1);
  };

  const currentRecords = records;

  const filteredRecords = useMemo(() => {
    return currentRecords.filter((item) => {
      const searchValue = search.toLowerCase();

      const name = item.studentName || item.trainerName || item.staffName;
      const attendanceNo = item.attendanceNo || "";

      const searchMatch =
        name.toLowerCase().includes(searchValue) ||
        attendanceNo.toLowerCase().includes(searchValue);

      const filterMatch = Object.entries(activeFilters).every(
        ([key, value]) => {
          if (!value || value === "All") return true;

          return item[key] === value;
        },
      );

      return searchMatch && filterMatch;
    });
  }, [currentRecords, search, activeFilters]);

  const statusOptions = useMemo(() => {
    return [
      ...new Set(currentRecords.map((item) => item.status).filter(Boolean)),
    ];
  }, [currentRecords]);

  //pagination
  const totalPages = Math.ceil(filteredRecords.length / pageSize);

  const safeCurrentPage =
    currentPage > totalPages ? totalPages || 1 : currentPage;

  const paginatedRecords = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;

    return filteredRecords.slice(startIndex, startIndex + pageSize);
  }, [filteredRecords, safeCurrentPage]);

  return (
    <div className="common-management-main-section">
      <div className="dashboard-action-page-header">
        <div>
          <h2 className="all-dash-page-title">Attendance Management</h2>

          <p className="all-dash-page-subtitle">
            {/* Track student, trainer and staff attendance. */}
            Track daily attendance for players, trainers, and staff.
          </p>
        </div>
      </div>

      {/* Loader */}
      {isAttendanceLoading ? (
        <div className="ui-common-loader">
          <ThreeDots
            height="20"
            width="50"
            color="#057DCD"
            ariaLabel="loading"
          />
        </div>
      ) : (
        <>
          {/* Statistics */}
          <Row className="g-3 mb-4">
            <Col md={3} xs={6}>
              <StatCard
                title="Present Today"
                value={statistics.present_today || 0}
                icon={FiUserCheck}
              />
            </Col>

            <Col md={3} xs={6}>
              <StatCard
                title="Absent Today"
                value={statistics.absent_today || 0}
                icon={FiUserX}
              />
            </Col>

            {/* <Col md={3} xs={6}>
              <StatCard
                title="Late Today"
                value={statistics.late_today || 0}
                icon={FiClock}
              />
            </Col>

            <Col md={3} xs={6}>
              <StatCard
                title="On Leave"
                value={statistics.on_leave || 0}
                icon={FiClipboard}
              />
            </Col> */}
          </Row>

          {/* Tabs */}
          <Tabs
            activeKey={activeTab}
            onSelect={(key) => {
              setIsAttendanceLoading(true);
              setActiveTab(key);
              setCurrentPage(1);
              setSearch("");
              setActiveFilters({});
            }}
            className="salary-bootstrap-tabs mb-3"
          >
            <Tab eventKey="student" title="Player Attendance" />
            <Tab eventKey="trainer" title="Trainer Attendance" />
            <Tab eventKey="staff" title="Staff Attendance" />
          </Tabs>

          {/* Toolbar */}
          <TableToolbar
            search={search}
            setSearch={(value) => {
              setSearch(value);
              setCurrentPage(1);
            }}
            filters={[
              {
                key: "status",
                label: "Status",
                options: statusOptions,
              },
            ]}
            activeFilters={activeFilters}
            setActiveFilters={(value) => {
              setActiveFilters(value);
              setCurrentPage(1);
            }}
            onClear={handleClearFilters}
            data={currentRecords}
            columns={columns}
            exportFileName={
              activeTab === "student"
                ? "student-attendance"
                : activeTab === "trainer"
                  ? "trainer-attendance"
                  : "staff-attendance"
            }
          />

          {/* Table */}
          <Table
            columns={columns}
            data={paginatedRecords}
            rowKey="employeeId"
            actions={(row) => (
              <div className="common-management-action-buttons">
                <button
                  title="View Attendance"
                  onClick={() =>
                    navigate(
                      `/management/attendance-profile/${row.employeeId}/${row.employeeType}`,
                    )
                  }
                >
                  <FiEye />
                </button>
              </div>
            )}
          />
        </>
      )}

      {/* Pagination */}
      {!isAttendanceLoading && filteredRecords.length > 0 && (
        <TablePagination
          page={safeCurrentPage}
          totalPages={totalPages}
          totalRecords={filteredRecords.length}
          pageSize={pageSize}
          onPrevious={() => setCurrentPage((prev) => prev - 1)}
          onNext={() => setCurrentPage((prev) => prev + 1)}
        />
      )}
    </div>
  );
};

export default Attendance;
