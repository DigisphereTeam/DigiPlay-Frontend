import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Row, Col } from "react-bootstrap";

import {
  FiArrowLeft,
  FiUserCheck,
  FiUserX,
  // FiClock,
  FiTrendingUp,
} from "react-icons/fi";

import {
  getMonthlyAttendance,
  getAttendanceTimeline,
} from "../../services/attendanceService";

import toast from "react-hot-toast";
import { ThreeDots } from "react-loader-spinner";

import StatCard from "../../components/ui/StatCard/StatCard";
import TableToolbar from "../../components/ui/TableToolbar/TableToolbar";
import Table from "../../components/ui/Table/Table";
import TablePagination from "../../components/ui/TablePagination/TablePagination";

const formatDateTime = (dateTime) => {
  if (!dateTime || dateTime === "-") return "-";

  const date = new Date(dateTime);

  return date.toLocaleString("en-IN", {
    timeZone: "UTC",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};

const AttendanceProfile = () => {
  const navigate = useNavigate();
  const { employeeId, employeeType } = useParams();

  const [statistics, setStatistics] = useState({});
  const [employee, setEmployee] = useState(null);
  
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [history, setHistory] = useState([]);

  // Monthly Summary States
  const [summarySearch, setSummarySearch] = useState("");
  const [summaryFilters, setSummaryFilters] = useState({});

  // Timeline States
  const [timelineSearch, setTimelineSearch] = useState("");
  const [timelineFilters, setTimelineFilters] = useState({});

  const [timelineFromDate, setTimelineFromDate] = useState("");
  const [timelineToDate, setTimelineToDate] = useState("");

  //Pagination
  const [timelinePage, setTimelinePage] = useState(1);
  const [summaryPage, setSummaryPage] = useState(1);

  //loading
  const [isAttendanceProfileLoading, setIsAttendanceProfileLoading] =
    useState(true);
  // const [isTimelineLoading, setIsTimelineLoading] = useState(true);

  const timelinePageSize = 5;
  const summaryPageSize = 5;

  // Monthly Attendance Summary
  const monthlySummaryColumns = useMemo(
    () => [
      {
        header: "Month",
        accessor: "month",
      },

      {
        header: "Working Days",
        accessor: "workingDays",
      },

      {
        header: "Present",
        accessor: "present",

        cell: (row) => <span className="text-success">{row.present}</span>,
      },

      {
        header: "Absent",
        accessor: "absent",

        cell: (row) => <span className="text-danger">{row.absent}</span>,
      },

      // {
      //   header: "Leave",
      //   accessor: "leave",

      //   cell: (row) => <span className="text-warning">{row.leave}</span>,
      // },

      // {
      //   header: "Late",
      //   accessor: "late",
      // },

      {
        header: "Attendance %",
        accessor: "percentage",

        cell: (row) => <span>{row.percentage}%</span>,
      },
    ],
    [],
  );

  // Timeline Table Columns
  const timelineColumns = useMemo(
    () => [
      {
        header: "Date",
        accessor: "date",
      },

      // Show Batch + Session only for Player
      ...(employeeType === "Player"
        ? [
            {
              header: "Batch",
              accessor: "batch",
            },
            // {
            //   header: "Session",
            //   accessor: "session",
            // },
          ]
        : []),

      {
        header: "Time In",
        accessor: "timeIn",
      },

      {
        header: "Time Out",
        accessor: "timeOut",
      },

      // {
      //   header: "Marked By",
      //   accessor: "markedBy",
      // },

      // {
      //   header: "Remarks",
      //   accessor: "remarks",
      // },

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
    [employeeType],
  );

  useEffect(() => {
    const fetchMonthlySummary = async () => {
      setIsAttendanceProfileLoading(true);

      try {
        const response = await getMonthlyAttendance({
          employee_type: employeeType,
          employee_id: employeeId,
        });

        if (response.statusCode === 200) {
          setEmployee(response.data.employee || null);
          setStatistics(response.data.statistics || {});

          const formatted = (response.data.monthly_attendance || []).map(
            (item) => ({
              month: item.month,
              workingDays: item.working_days,
              present: item.present,
              absent: item.absent,
              leave: item.leave,
              late: item.late,
              percentage: item.attendance_percentage,
            }),
          );

          setMonthlySummary(formatted);
        } else {
          toast.error(response.message);
        }
      } catch (error) {
        console.error("Get Attendance Error:", error);

        toast.error(error.response?.data?.message);
      } finally {
        setIsAttendanceProfileLoading(false);
      }
    };

    fetchMonthlySummary();
  }, [employeeId, employeeType]);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        // const today = new Date();
        const response = await getAttendanceTimeline({
          employee_type: employeeType,
          employee_id: employeeId,
          from_date: timelineFromDate,
          to_date: timelineToDate,
        });

        if (response.statusCode === 200) {
          const attendance = response.data?.attendance || [];

          const formatted = attendance.map((item) => ({
            attendanceId: item.attendance_id,
            date: item.date,
            batch: item.batch || "-",
            session: item.session,
            status: item.status,
            timeIn: formatDateTime(item.time_in),
            timeOut: formatDateTime(item.time_out),
            markedBy: item.marked_by,
            remarks: item.remarks,
          }));

          setHistory(formatted);
          setTimelinePage(1);
        } else {
          setHistory([]);
          toast.error(response.message);
        }
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message);
      }
    };
    if (
      employeeId &&
      employeeType &&
      ((!timelineFromDate && !timelineToDate) ||
        (timelineFromDate && timelineToDate))
    ) {
      fetchTimeline();
    }
  }, [employeeId, employeeType, timelineFromDate, timelineToDate]);

  // Monthly Summary Search + Filter
  const filteredMonthlySummary = useMemo(() => {
    return monthlySummary.filter((item) => {
      const searchValue = summarySearch.toLowerCase();

      const searchMatch =
        item.month?.toLowerCase().includes(searchValue) ||
        item.percentage?.toString().includes(searchValue);

      const filterMatch = Object.entries(summaryFilters).every(
        ([key, value]) => {
          if (!value || value === "All") {
            return true;
          }

          return item[key]?.toString() === value;
        },
      );

      return searchMatch && filterMatch;
    });
  }, [monthlySummary, summarySearch, summaryFilters]);

  // Timeline Search + Filter
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const searchValue = timelineSearch.toLowerCase();

      const searchMatch =
        item.date?.toLowerCase().includes(searchValue) ||
        item.status?.toLowerCase().includes(searchValue) ||
        item.session?.toLowerCase().includes(searchValue);

      const filterMatch = Object.entries(timelineFilters).every(
        ([key, value]) => {
          if (!value || value === "All") {
            return true;
          }

          return item[key] === value;
        },
      );

      return searchMatch && filterMatch;
    });
  }, [history, timelineSearch, timelineFilters]);

  // Monthly  Pagination
  const monthOptions = useMemo(
    () => [
      ...new Set(monthlySummary.map((item) => item.month).filter(Boolean)),
    ],
    [monthlySummary],
  );

  const percentageOptions = useMemo(
    () => [
      ...new Set(
        monthlySummary
          .map((item) => item.percentage?.toString())
          .filter(Boolean),
      ),
    ],
    [monthlySummary],
  );

  const summaryTotalPages = Math.ceil(
    filteredMonthlySummary.length / summaryPageSize,
  );

  const paginatedMonthlySummary = useMemo(() => {
    const startIndex = (summaryPage - 1) * summaryPageSize;

    return filteredMonthlySummary.slice(
      startIndex,
      startIndex + summaryPageSize,
    );
  }, [filteredMonthlySummary, summaryPage]);

  // Timeline Pagination
  const statusOptions = useMemo(
    () => [...new Set(history.map((item) => item.status).filter(Boolean))],
    [history],
  );

  const timelineTotalPages = Math.ceil(
    filteredHistory.length / timelinePageSize,
  );

  const paginatedHistory = useMemo(() => {
    const startIndex = (timelinePage - 1) * timelinePageSize;

    return filteredHistory.slice(startIndex, startIndex + timelinePageSize);
  }, [filteredHistory, timelinePage]);

  if (isAttendanceProfileLoading) {
    return (
      <div className="ui-common-loader">
        <ThreeDots height="20" width="50" color="#057DCD" ariaLabel="loading" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="common-page-profile-no-data-container">
        <button
          className="common-page-profile-back-button"
          onClick={() => navigate(-1)}
        >
          <FiArrowLeft />
          Back To Attendance
        </button>

        <h3>Attendance Record Not Found</h3>
      </div>
    );
  }

  return (
    <div className="common-page-profile-container">
      {/* Back Button */}
      <button
        className="common-page-profile-back-button"
        onClick={() => navigate(-1)}
      >
        <FiArrowLeft />
        Back To Attendance
      </button>

      {/* Stats Cards */}
      <Row className="g-3 mb-4">
        <Col md={3} xs={6}>
          <StatCard
            title="Present"
            value={statistics.present}
            icon={FiUserCheck}
          />
        </Col>

        <Col md={3} xs={6}>
          <StatCard title="Absent" value={statistics.absent} icon={FiUserX} />
        </Col>

        {/* <Col md={3} xs={6}>
          <StatCard title="Late" value={statistics.late} icon={FiClock} />
        </Col> */}

        <Col md={3} xs={6}>
          <StatCard
            title="Attendance %"
            value={statistics.attendance_percentage}
            icon={FiTrendingUp}
          />
        </Col>
      </Row>

      {/* Monthly Attendance Summary */}
      <h4
        style={{
          margin: 0,
          color: "#0e2b57",
          fontSize: "20px",
          fontWeight: 700,
          fontFamily: '"Space Grotesk", system-ui, sans-serif',
          marginBottom: "16px",
        }}
      >
        Monthly Attendance Summary
      </h4>

      {/* Monthly Toolbar */}
      <TableToolbar
        search={summarySearch}
        setSearch={(value) => {
          setSummarySearch(value);
          setSummaryPage(1);
        }}
        filters={[
          {
            key: "month",
            label: "Month",
            options: monthOptions,
          },

          {
            key: "percentage",
            label: "Attendance %",
            options: percentageOptions,
          },
        ]}
        activeFilters={summaryFilters}
        setActiveFilters={(value) => {
          setSummaryFilters(value);
          setSummaryPage(1);
        }}
        onClear={() => {
          setSummarySearch("");
          setSummaryFilters({});
          setSummaryPage(1);
        }}
        data={monthlySummary}
        columns={monthlySummaryColumns}
        exportFileName="monthly-attendance-summary"
      />

      <Table columns={monthlySummaryColumns} data={paginatedMonthlySummary} />

      {filteredMonthlySummary.length > 0 && (
        <TablePagination
          page={summaryPage}
          totalPages={summaryTotalPages}
          totalRecords={filteredMonthlySummary.length}
          pageSize={summaryPageSize}
          onPrevious={() => setSummaryPage((prev) => prev - 1)}
          onNext={() => setSummaryPage((prev) => prev + 1)}
        />
      )}

      {/* Attendance Timeline */}
      <h4
        style={{
          margin: 0,
          color: "#0e2b57",
          fontSize: "20px",
          fontWeight: 700,
          fontFamily: '"Space Grotesk", system-ui, sans-serif',
          marginBottom: "16px",
          marginTop: "20px",
        }}
      >
        Attendance Timeline
      </h4>

      {/* Timeline Toolbar */}
      <TableToolbar
        search={timelineSearch}
        setSearch={(value) => {
          setTimelineSearch(value);
          setTimelinePage(1);
        }}
        searchColLg={3}
        fromDate={timelineFromDate}
        setFromDate={(value) => {
          setTimelineFromDate(value);
          setTimelinePage(1);
        }}
        toDate={timelineToDate}
        setToDate={(value) => {
          setTimelineToDate(value);
          setTimelinePage(1);
        }}
        filters={[
          {
            key: "status",
            label: "Status",
            options: statusOptions,
          },
        ]}
        activeFilters={timelineFilters}
        setActiveFilters={(value) => {
          setTimelineFilters(value);
          setTimelinePage(1);
        }}
        onClear={() => {
          setTimelineSearch("");
          setTimelineFilters({});
          setTimelineFromDate("");
          setTimelineToDate("");
          setTimelinePage(1);
        }}
        data={history}
        columns={timelineColumns}
        exportFileName="attendance-timeline"
      />

      {/* Timeline Table */}
      <Table columns={timelineColumns} data={paginatedHistory} />

      {/* Pagination */}
      {filteredHistory.length > 0 && (
        <TablePagination
          page={timelinePage}
          totalPages={timelineTotalPages}
          totalRecords={filteredHistory.length}
          pageSize={timelinePageSize}
          onPrevious={() => {
            setTimelinePage((prev) => prev - 1);
          }}
          onNext={() => {
            setTimelinePage((prev) => prev + 1);
          }}
        />
      )}
    </div>
  );
};

export default AttendanceProfile;
