import { useState, useEffect, useMemo } from "react";
import { Nav, Spinner, Row, Col } from "react-bootstrap";

import {
  FiUsers,
  FiUserCheck,
  FiBookOpen,
  FiUserX,
  FiAward,
  // FiDollarSign,
  FiActivity,
} from "react-icons/fi";

import { MdCurrencyRupee } from "react-icons/md";

import Table from "../../components/ui/Table/Table.jsx";
import TablePagination from "../../components/ui/TablePagination/TablePagination.jsx";
import ReportsTableToolbar from "./ReportsTableToolbar";
// import StatCard from "../../components/ui/StatCard/StatCard.jsx";
import StatCard from "../../components/ui/StatCard/StatCard.jsx";
import DescriptionCell from "../../components/ui/DescriptionCell/DescriptionCell.jsx";

import {
  getReportsData,
  getEmployeeStatistics,
} from "../../services/reportsService";

import "./Reports.css";

const Reports = () => {
  const [activeMainTab, setActiveMainTab] = useState("player");
  const [activeSubTab, setActiveSubTab] = useState("playerwise");

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [rawApiData, setRawApiData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [statistics, setStatistics] = useState({});
  const [, setStatisticsLoading] = useState(false);

  const getCurrentMonthStart = () => {
    const date = new Date();

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0",
    )}-01`;
  };

  const getCurrentMonthEnd = () => {
    const date = new Date();

    const lastDay = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0,
    ).getDate();

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0",
    )}-${String(lastDay).padStart(2, "0")}`;
  };

  const [fromDate, setFromDate] = useState(getCurrentMonthStart());
  const [toDate, setToDate] = useState(getCurrentMonthEnd());

  const renderPresentBadge = (row) => (
    <span className="status-badge status-badge-green">
      {row.days_present ?? row.daysPresent ?? 0}
    </span>
  );

  const renderAbsentBadge = (row) => (
    <span className="status-badge status-badge-red">
      {row.days_absent ?? row.daysAbsent ?? 0}
    </span>
  );

  const columns = useMemo(() => {
    // ------------------- PLAYER TABS -------------------
    if (activeMainTab === "player") {
      if (activeSubTab === "playerwise") {
        return [
          {
            header: "Admission ID",
            accessor: "admission_id",
            cell: (row) => row.admission_id || "-",
          },
          {
            header: "Player Name",
            accessor: "full_name",
            cell: (row) => row.full_name || row.player_name || "-",
          },
          {
            header: "Batch",
            accessor: "batch",
            cell: (row) => row.batch || "-",
          },
          {
            header: "Gender",
            accessor: "gender",
            cell: (row) => row.gender || "-",
          },
          { header: "Age", accessor: "age", cell: (row) => row.age || "-" },
          {
            header: "Date of Birth",
            accessor: "date_of_birth",
            cell: (row) => row.date_of_birth || "-",
          },
          {
            header: "Admission Date",
            accessor: "admission_date",
            cell: (row) => row.admission_date || "-",
          },
          {
            header: "Phone",
            accessor: "contact_number",
            cell: (row) => row.contact_number || "-",
          },
          {
            header: "Father Name",
            accessor: "father_name",
            cell: (row) => row.father_name || "-",
          },
          {
            header: "Address",
            accessor: "address",

            cell: (row) => <DescriptionCell text={row.address || "-"} />,
          },
          {
            header: "Status",
            accessor: "status",
            cell: (row) => (
              <span
                className={
                  row.status === "Active"
                    ? "common-management-table-status-success"
                    : "common-management-table-status-danger"
                }
              >
                {row.status}
              </span>
            ),
          },
        ];
      }
      return [
        {
          header: "Admission ID",
          accessor: "admission_id",
        },
        {
          header: "Player Name",
          accessor: "player_name",
          cell: (row) => row.player_name || row.full_name || "-",
        },
        {
          header: "Admission Date",
          accessor: "admission_date",
          cell: (row) => row.admission_date || "-",
        },
        // {
        //   header: "Batch",
        //   accessor: "batch",
        //   cell: (row) => row.batch || "-",
        // },
        {
          header: "Month",
          accessor: "month",
          cell: (row) => row.month?.trim() || "-",
        },
        {
          header: "Year",
          accessor: "year",
        },
        {
          header: "Present",
          accessor: "present",
          cell: (row) => (
            <span className="status-badge status-badge-green">
              {row.present ?? 0}
            </span>
          ),
        },
        {
          header: "Absent",
          accessor: "absent",
          cell: (row) => (
            <span className="status-badge status-badge-red">
              {row.absent ?? 0}
            </span>
          ),
        },
        {
          header: "Fee Paid",
          accessor: "fee_paid",
          cell: (row) =>
            row.fee_paid != null
              ? `₹${Number(row.fee_paid).toLocaleString("en-IN")}`
              : "-",
        },
        {
          header: "Admission Fee",
          accessor: "admission_fee",
          cell: (row) =>
            `₹${Number(row.admission_fee || 0).toLocaleString("en-IN")}`,
        },
        {
          header: "Admission Payment Date",
          accessor: "admission_date",
          cell: (row) => row.admission_date || "-",
        },
        {
          header: "Regular Fee",
          accessor: "regular_fee",
          cell: (row) =>
            `₹${Number(row.regular_fee || 0).toLocaleString("en-IN")}`,
        },
        {
          header: "Regular Payment Date",
          accessor: "regular_payment_date",
          cell: (row) => row.regular_payment_date || "-",
        },
        {
          header: "One-on-One",
          accessor: "one_on_one_fee",
          cell: (row) =>
            `₹${Number(row.one_on_one_fee || 0).toLocaleString("en-IN")}`,
        },
        {
          header: "One-on-One Payment Date",
          accessor: "one_on_one_payment_date",
          cell: (row) => row.one_on_one_payment_date || "-",
        },
      ];
    }

    // ------------------- TRAINER TABS -------------------
    if (activeMainTab === "trainer") {
      if (activeSubTab === "playerwise") {
        return [
          { header: "Trainer ID", accessor: "trainer_id" },
          {
            header: "Trainer Name",
            accessor: "trainer_name",
            cell: (row) => row.trainer_name || row.full_name || "-",
          },
          { header: "Specialization", accessor: "specialization" },
          {
            header: "Experience",
            accessor: "experience",
            cell: (row) => `${row.experience ?? 0} yrs`,
          },
          {
            header: "Joining Date",
            accessor: "join_date",
            cell: (row) => row.join_date || row.joining_date || "-",
          },
          { header: "Phone", accessor: "contact_number" },
          {
            header: "Status",
            accessor: "status",
            cell: (row) => (
              <span
                className={
                  row.status === "Active"
                    ? "common-management-table-status-success"
                    : "common-management-table-status-danger"
                }
              >
                {row.status}
              </span>
            ),
          },
        ];
      }
      return [
        {
          header: "Trainer ID",
          accessor: "trainer_id",
        },
        {
          header: "Trainer Name",
          accessor: "trainer_name",
          cell: (row) => row.trainer_name || row.full_name || "-",
        },
        {
          header: "Specialization",
          accessor: "specialization",
        },
        {
          header: "Month",
          accessor: "month",
          cell: (row) => row.month?.trim() || "-",
        },
        {
          header: "Year",
          accessor: "year",
        },
        {
          header: "Present",
          accessor: "days_present",
          cell: (row) => (
            <span className="status-badge status-badge-green">
              {row.present ?? row.days_present ?? 0}
            </span>
          ),
        },
        {
          header: "Absent",
          accessor: "days_absent",
          cell: (row) => (
            <span className="status-badge status-badge-red">
              {row.absent ?? row.days_absent ?? 0}
            </span>
          ),
        },
        {
          header: "Salary Paid",
          accessor: "salary_paid",
          cell: (row) =>
            row.salary_paid != null
              ? `₹${Number(row.salary_paid).toLocaleString("en-IN")}`
              : "-",
        },
        {
          header: "Incentive 1",
          accessor: "incentive_1",
          cell: (row) =>
            row.incentive_1 != null
              ? `₹${Number(row.incentive_1).toLocaleString("en-IN")}`
              : "-",
        },
        {
          header: "Incentive 2",
          accessor: "incentive_2",
          cell: (row) =>
            row.incentive_2 != null
              ? `₹${Number(row.incentive_2).toLocaleString("en-IN")}`
              : "-",
        },
        {
          header: "Incentive 3",
          accessor: "incentive_3",
          cell: (row) =>
            row.incentive_3 != null
              ? `₹${Number(row.incentive_3).toLocaleString("en-IN")}`
              : "-",
        },
        {
          header: "Salary Paid Date",
          accessor: "salary_paid_date",
          cell: (row) => row.salary_paid_date || "-",
        },
      ];
    }

    // ------------------- STAFF TABS -------------------
    if (activeMainTab === "staff") {
      if (activeSubTab === "playerwise") {
        return [
          { header: "Staff ID", accessor: "staff_code" },
          {
            header: "Staff Name",
            accessor: "staff_name",
            cell: (row) => row.staff_name || row.full_name || row.name || "-",
          },
          { header: "Role", accessor: "designation" },
          {
            header: "Joining Date",
            accessor: "join_date",
            cell: (row) => row.join_date || row.joining_date || "-",
          },
          { header: "Phone", accessor: "contact_number" },
          {
            header: "Status",
            accessor: "status",
            cell: (row) => (
              <span
                className={
                  row.status === "Active"
                    ? "common-management-table-status-success"
                    : "common-management-table-status-danger"
                }
              >
                {row.status}
              </span>
            ),
          },
        ];
      }
      return [
        { header: "Staff ID", accessor: "staff_code" },
        {
          header: "Staff Name",
          accessor: "staff_name",
          cell: (row) => row.staff_name || row.full_name || row.name || "-",
        },
        { header: "Role", accessor: "designation" },
        {
          header: "Month",
          accessor: "month",
          cell: (row) => row.month?.trim() || "-",
        },
        { header: "Year", accessor: "year" },
        {
          header: "Present",
          accessor: "days_present",
          cell: renderPresentBadge,
        },
        { header: "Absent", accessor: "days_absent", cell: renderAbsentBadge },
        {
          header: "Salary Paid",
          accessor: "salary_paid",
          cell: (row) =>
            `₹${Number(row.salary_paid || row.salaryPaid || 0).toLocaleString("en-IN")}`,
        },
        {
          header: "Salary Paid Date",
          accessor: "salary_paid_date",
          cell: (row) => row.salary_paid_date || row.salaryPaidDate || "-",
        },
      ];
    }

    return [];
  }, [activeMainTab, activeSubTab]);

  // Fetch Reports Data
  useEffect(() => {
    let ignore = false;

    const fetchReports = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getReportsData(activeMainTab, activeSubTab, {
          from_date: fromDate,
          to_date: toDate,
        });

        if (!ignore) {
          if (response?.success) {
            const reportData = Array.isArray(response.data)
              ? response.data
              : response.data?.data || [];

            setRawApiData(reportData);
          } else {
            setRawApiData([]);
            setError(response?.message || "Failed to fetch data");
          }
        }
      } catch (err) {
        console.error("Error fetching reports:", err);

        if (!ignore) {
          setError(
            err.response?.data?.message ||
              "Failed to fetch reports. Please check your backend network call.",
          );

          setRawApiData([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchReports();

    return () => {
      ignore = true;
    };
  }, [activeMainTab, activeSubTab, fromDate, toDate]);

  useEffect(() => {
    let ignore = false;

    const fetchStatistics = async () => {
      setStatisticsLoading(true);

      const employeeTypeMap = {
        player: "Player",
        trainer: "Coach",
        staff: "Staff",
      };

      const employeeType = employeeTypeMap[activeMainTab];

      if (!employeeType) {
        return;
      }

      try {
        const response = await getEmployeeStatistics(
          employeeType,
          fromDate,
          toDate,
        );

        if (!ignore) {
          if (response?.success) {
            setStatistics(response.data?.statistics || {});
          } else {
            setStatistics({});
          }
        }
      } catch (err) {
        console.error("Error fetching report statistics:", err);

        if (!ignore) {
          setStatistics({});
        }
      } finally {
        if (!ignore) {
          setStatisticsLoading(false);
        }
      }
    };

    fetchStatistics();

    return () => {
      ignore = true;
    };
  }, [activeMainTab, fromDate, toDate]);

  // Client-side filter (filters table data in real-time)
  const filteredData = useMemo(() => {
    let dataset = [...rawApiData];

    if (search.trim()) {
      const query = search.toLowerCase();
      dataset = dataset.filter((row) =>
        Object.values(row).some((val) =>
          String(val ?? "")
            .toLowerCase()
            .includes(query),
        ),
      );
    }

    return dataset;
  }, [rawApiData, search]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const handleClear = () => {
    setSearch("");
    setFromDate(getCurrentMonthStart());
    setToDate(getCurrentMonthEnd());
    setCurrentPage(1);
  };

  const handleMainTabChange = (key) => {
    if (!key) return;
    setActiveMainTab(key);
    setActiveSubTab("playerwise");
    handleClear();
  };

  const handleSubTabChange = (key) => {
    if (!key) return;
    setActiveSubTab(key);
    setCurrentPage(1);
  };

  return (
    <div className="common-management-main-section">
      <div className="dashboard-action-page-header mb-4">
        <div>
          <h2 className="all-dash-page-title">Reports & Exports</h2>
          <p className="all-dash-page-subtitle">
            {/* KK Global Cricket Academy · Player, Trainer & Staff Reports */}
            View and export detailed player, trainer, staff, player-wise, and monthly reports.
          </p>
        </div>
      </div>

      <Nav
        variant="tabs"
        activeKey={activeMainTab}
        onSelect={handleMainTabChange}
        className="salary-bootstrap-tabs mb-3"
      >
        <Nav.Item>
          <Nav.Link eventKey="player">
            <FiBookOpen className="me-2" />
            Player Reports
          </Nav.Link>
        </Nav.Item>

        <Nav.Item>
          <Nav.Link eventKey="trainer">
            <FiUserCheck className="me-2" />
            Trainer Reports
          </Nav.Link>
        </Nav.Item>

        <Nav.Item>
          <Nav.Link eventKey="staff">
            <FiUsers className="me-2" />
            Staff Reports
          </Nav.Link>
        </Nav.Item>
      </Nav>

      <Nav
        variant="pills"
        activeKey={activeSubTab}
        onSelect={handleSubTabChange}
        className="mb-4 sub-tabs-container"
      >
        <Nav.Item>
          <Nav.Link eventKey="playerwise">
            {activeMainTab === "player"
              ? "Playerwise Report"
              : activeMainTab === "trainer"
                ? "Trainerwise Report"
                : "Staffwise Report"}
          </Nav.Link>
        </Nav.Item>

        <Nav.Item>
          <Nav.Link eventKey="monthly">Monthly Report</Nav.Link>
        </Nav.Item>
      </Nav>

      {/* Statistics */}
      <Row className="g-3 mb-4">
        {activeMainTab === "player" && (
          <>
            <Col md={3} xs={6}>
              <StatCard
                title="Admission Fee"
                value={`₹${Number(statistics.admission_fee || 0).toLocaleString(
                  "en-IN",
                )}`}
                icon={MdCurrencyRupee}
              />
            </Col>

            <Col md={3} xs={6}>
              <StatCard
                title="Regular Fee"
                value={`₹${Number(statistics.regular_fee || 0).toLocaleString(
                  "en-IN",
                )}`}
                icon={MdCurrencyRupee}
              />
            </Col>

            <Col md={3} xs={6}>
              <StatCard
                title="One-on-One Fee"
                value={`₹${Number(
                  statistics.one_on_one_fee || 0,
                ).toLocaleString("en-IN")}`}
                icon={MdCurrencyRupee}
              />
            </Col>

            <Col md={3} xs={6}>
              <StatCard
                title="Only One-on-One Fee"
                value={`₹${Number(
                  statistics.only_one_on_one_fee || 0,
                ).toLocaleString("en-IN")}`}
                icon={MdCurrencyRupee}
              />
            </Col>
          </>
        )}

        {activeMainTab === "trainer" && (
          <>
            <Col md={3} xs={6}>
              <StatCard
                title="Total Trainers"
                value={statistics.total_trainers || 0}
                icon={FiUsers}
              />
            </Col>

            <Col md={3} xs={6}>
              <StatCard
                title="Active Trainers"
                value={statistics.active_trainers || 0}
                icon={FiUserCheck}
              />
            </Col>

            <Col md={3} xs={6}>
              <StatCard
                title="Inactive Trainers"
                value={statistics.inactive_trainers || 0}
                icon={FiUserX}
              />
            </Col>

            <Col md={3} xs={6}>
              <StatCard
                title="Average Experience"
                value={`${statistics.average_experience || 0} yrs`}
                icon={FiAward}
              />
            </Col>
          </>
        )}

        {activeMainTab === "staff" && (
          <>
            <Col md={3} xs={6}>
              <StatCard
                title="Total Staff"
                value={statistics.total_staff || 0}
                icon={FiUsers}
              />
            </Col>

            <Col md={3} xs={6}>
              <StatCard
                title="Active Staff"
                value={statistics.active_staff || 0}
                icon={FiUserCheck}
              />
            </Col>

            <Col md={3} xs={6}>
              <StatCard
                title="Inactive Staff"
                value={statistics.inactive_staff || 0}
                icon={FiUserX}
              />
            </Col>

            <Col md={3} xs={6}>
              <StatCard
                title="Total Departments"
                value={statistics.total_departments || 0}
                icon={FiActivity}
              />
            </Col>
          </>
        )}
      </Row>

      <ReportsTableToolbar
        search={search}
        setSearch={(val) => {
          setSearch(val);
          setCurrentPage(1);
        }}
        fromDate={fromDate}
        setFromDate={(val) => {
          setFromDate(val);
          setCurrentPage(1);
        }}
        toDate={toDate}
        setToDate={(val) => {
          setToDate(val);
          setCurrentPage(1);
        }}
        onClear={handleClear}
        data={filteredData}
        columns={columns}
        exportFileName={`${activeMainTab}-${activeSubTab}-report`}
      />

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Loading reports...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger my-3">{error}</div>
      ) : (
        <Table
          key={`${activeMainTab}-${activeSubTab}`}
          columns={columns}
          data={paginatedData}
        />
      )}

      {!loading && filteredData.length > 0 && (
        <TablePagination
          page={currentPage}
          totalPages={totalPages}
          totalRecords={filteredData.length}
          pageSize={pageSize}
          onPrevious={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          onNext={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
        />
      )}
    </div>
  );
};

export default Reports;
