import { useMemo, useState, useEffect, useCallback } from "react";
import { Row, Col, Button, Tabs, Tab } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import {
  // FiDollarSign,
  FiUsers,
  FiClock,
  FiTrendingUp,
  FiPlus,
  FiEye,
  FiEdit2,
  FiRefreshCw,
} from "react-icons/fi";

import { MdCurrencyRupee } from "react-icons/md";

import {
  getEligibleEmployees,
  createEmployeeSalary,
  getEmployeeSalariesByType,
  updateEmployeeSalary,
  creditEmployeeSalary,
} from "../../services/employeeSalaryService";

import { initialsFromName } from "../../utils/initialsFromName";

import toast from "react-hot-toast";
import { ThreeDots } from "react-loader-spinner";

import StatCard from "../../components/ui/StatCard/StatCard";
import CommonDrawer from "../../components/ui/CommonDrawer/CommonDrawer";
import FormField from "../../components/ui/FormField/FormField";
import TableToolbar from "../../components/ui/TableToolbar/TableToolbar";
import Table from "../../components/ui/Table/Table";
import TablePagination from "../../components/ui/TablePagination/TablePagination";
import DescriptionCell from "../ui/DescriptionCell/DescriptionCell.jsx";

import "./Salary.css";

const parseAmount = (value) => {
  return Number(String(value).replace(/[^0-9.]/g, "")) || 0;
};

const Salary = () => {
  const [eligibleEmployees, setEligibleEmployees] = useState([]);
  const [records, setRecords] = useState([]);
  const [statistics, setStatistics] = useState({});

  const [activeTab, setActiveTab] = useState("trainer");

  const emptySalary = {
    salaryType: "",
    employeeId: "",
    date: "",
    grossSalary: "",
    incentive1: "",
    incentive2: "",
    incentive3: "",
    paymentType: "",
    remarks: "",
  };

  const [salaryData, setSalaryData] = useState(emptySalary);

  const [showDrawer, setShowDrawer] = useState(false);

  const [isEdit, setIsEdit] = useState(false);
  const [isPaymentUpdate, setIsPaymentUpdate] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState(null);

  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  //loading
  const [isEligibleLoading, setIsEligibleLoading] = useState(false);
  const [isSalaryLoading, setIsSalaryLoading] = useState(true);
  const [isCreatingSalary, setIsCreatingSalary] = useState(false);
  const [isUpdatingSalary, setIsUpdatingSalary] = useState(false);
  const [isCreditingSalary, setIsCreditingSalary] = useState(false);

  const pageSize = 5;

  const navigate = useNavigate();

  const handleSalaryChange = (e) => {
    const { name, value } = e.target;

    setSalaryData((prev) => ({
      ...prev,
      [name]: value,

      ...(name === "salaryType" && {
        employeeId: "",
        grossSalary: "",
        incentive1: "",
        incentive2: "",
        incentive3: "",
        paymentType: "",
        remarks: "",
      }),
    }));

    if (name === "salaryType") {
      const selectedDate = salaryData.date;

      if (selectedDate) {
        fetchEligibleEmployees(value, selectedDate);
      }
    }

    if (name === "date") {
      const selectedSalaryType = salaryData.salaryType;

      if (selectedSalaryType) {
        fetchEligibleEmployees(selectedSalaryType, value);
      }
    }
  };

  const columns = useMemo(
    () => [
      {
        header: "Employee",
        accessor: "employeeName",
        cell: (row) => (
          <div className="common-management-name-cell">
            <div className="common-management-avatar">
              {initialsFromName(row.employeeName)}
            </div>

            <div>
              <h6
                className="common-management-table-name"
                title={row.employeeName || "-"}
              >
                {row.employeeName || "-"}
              </h6>
              <span>{row.employeeAdmissionId || "-"}</span>
            </div>
          </div>
        ),
      },

      {
        header: "Date",
        accessor: "date",
      },

      {
        header: "Base Salary",
        accessor: "grossSalary",
        cell: (row) => `₹${Number(row.grossSalary).toLocaleString("en-IN")}`,
      },

      // Incentives only for Trainer
      ...(activeTab === "trainer"
        ? [
            {
              header: "Incentive 1",
              accessor: "incentive1",
              cell: (row) =>
                row.incentive1
                  ? `₹${Number(row.incentive1).toLocaleString("en-IN")}`
                  : "-",
            },
            {
              header: "Incentive 2",
              accessor: "incentive2",
              cell: (row) =>
                row.incentive2
                  ? `₹${Number(row.incentive2).toLocaleString("en-IN")}`
                  : "-",
            },
            {
              header: "Incentive 3",
              accessor: "incentive3",
              cell: (row) =>
                row.incentive3
                  ? `₹${Number(row.incentive3).toLocaleString("en-IN")}`
                  : "-",
            },
          ]
        : []),

      // {
      //   header: "Bonus",
      //   accessor: "bonus",
      //   cell: (row) => `₹${Number(row.bonus).toLocaleString("en-IN")}`,
      // },

      // {
      //   header: "Deduction",
      //   accessor: "deduction",
      //   cell: (row) => `₹${row.deduction.toLocaleString("en-IN")}`,
      // },

      // {
      //   header: "Net Salary",
      //   accessor: "netSalary",
      //   cell: (row) => `₹${row.netSalary.toLocaleString("en-IN")}`,
      // },

      {
        header: "Payment Type",
        accessor: "paymentType",

        cell: (row) => <span>{row.paymentType || "-"}</span>,
      },

      {
        header: "Remarks",
        accessor: "remarks",
        cell: (row) => <DescriptionCell text={row.remarks?.trim() || "-"} />,
      },

      {
        header: "Status",
        accessor: "status",

        cell: (row) => (
          <span
            className={
              row.status === "Paid"
                ? "common-management-table-status-success"
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

  // Open Add Drawer
  const handleAddSalary = () => {
    setSalaryData({
      ...emptySalary,
    });

    setIsEdit(false);
    setIsPaymentUpdate(false);
    setSelectedSalary(null);
    setShowDrawer(true);
  };

  // Open Edit Drawer
  const handleEditSalary = (row) => {
    setIsEdit(true);
    setSelectedSalary(row);

    setEligibleEmployees([
      {
        employee_id: row.employeeId,
        employee_name: row.employeeName,
      },
    ]);

    setSalaryData({
      salaryType: row.salaryType,
      employeeId: row.employeeId,
      date: row.date,
      grossSalary: row.grossSalary,

      incentive1: row.incentive1 || "",
      incentive2: row.incentive2 || "",
      incentive3: row.incentive3 || "",

      paymentType: row.paymentType || "",
      remarks: row.remarks || "",
    });

    setShowDrawer(true);
  };

  const handlePaymentUpdate = (row) => {
    setIsPaymentUpdate(true);
    setSelectedSalary(row);

    setEligibleEmployees([
      {
        employee_id: row.employeeId,
        employee_name: row.employeeName,
      },
    ]);

    setSalaryData({
      salaryType: row.salaryType,
      employeeId: row.employeeId,
      date: row.date === "-" ? "" : row.date,
      grossSalary: row.grossSalary,

      incentive1: row.incentive1 || "",
      incentive2: row.incentive2 || "",
      incentive3: row.incentive3 || "",

      paymentType: row.paymentType || "",
      remarks: row.remarks || "",
    });

    setShowDrawer(true);
  };

  // Close Drawer
  const handleCloseDrawer = () => {
    setShowDrawer(false);
    setIsEdit(false);
    setIsPaymentUpdate(false);
    setSelectedSalary(null);
    setSalaryData({ ...emptySalary });
  };

  const fetchEligibleEmployees = async (salaryType, date) => {
    if (!salaryType || !date) return;

    setIsEligibleLoading(true);

    try {
      const employeeType = salaryType === "Trainer Salary" ? "Coach" : "Staff";

      const response = await getEligibleEmployees({
        employee_type: employeeType,
        payment_date: date,
      });

      if (response.statusCode === 200) {
        setEligibleEmployees(response.data || []);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Eligible Employees Error:", error);

      toast.error(error.response?.data?.message);
    } finally {
      setIsEligibleLoading(false);
    }
  };

  const fetchSalaries = useCallback(async () => {
    try {
      const employeeType = activeTab === "trainer" ? "Coach" : "Staff";

      const response = await getEmployeeSalariesByType({
        employee_type: employeeType,
      });

      if (response.statusCode === 200) {
        const salaryList = response.data.salaries || [];

        const formattedRecords = salaryList.map((item) => ({
          salaryId: item.salary_id,
          employeeId: item.employee_id,
          employeeAdmissionId: item.employee_code,
          employeeName: item.employee_name,

          salaryType:
            item.employee_type === "Coach" ? "Trainer Salary" : "Staff Salary",

          date: item.payment_date || "-",
          grossSalary: Number(item.basic_salary),

          // bonus: Number(item.bonus),
          // deduction: Number(item.deduction),

          incentive1: Number(item.incentive_1 || 0),
          incentive2: Number(item.incentive_2 || 0),
          incentive3: Number(item.incentive_3 || 0),

          // netSalary: Number(item.net_salary),
          paymentType: item.payment_type,
          remarks: item.remarks || "",
          status: item.payment_status,
        }));

        setRecords(formattedRecords);
        setStatistics(response.data.statistics || {});
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Get Salary Error:", error);

      toast.error(error.response?.data?.message);
    }
  }, [activeTab]);

  useEffect(() => {
    const loadSalaries = async () => {
      setIsSalaryLoading(true);

      try {
        await fetchSalaries();
      } finally {
        setIsSalaryLoading(false);
      }
    };

    loadSalaries();
  }, [fetchSalaries]);

  const handleCreateSalary = async () => {
    if (
      !salaryData.salaryType ||
      !salaryData.employeeId ||
      !salaryData.date ||
      !salaryData.grossSalary ||
      !salaryData.paymentType
    ) {
      toast.error("Please fill required details");
      return;
    }

    const payload = {
      payment_date: salaryData.date,
      basic_salary: parseAmount(salaryData.grossSalary),
      payment_type: salaryData.paymentType,
      remarks: salaryData.remarks || "",
    };

    if (salaryData.salaryType === "Trainer Salary") {
      payload.coach_id = salaryData.employeeId;

      payload.incentive_1 = parseAmount(salaryData.incentive1 || 0);
      payload.incentive_2 = parseAmount(salaryData.incentive2 || 0);
      payload.incentive_3 = parseAmount(salaryData.incentive3 || 0);
    }

    if (salaryData.salaryType === "Staff Salary") {
      payload.staff_id = salaryData.employeeId;
    }

    setIsCreatingSalary(true);
    try {
      const response = await createEmployeeSalary(payload);

      if (response.statusCode === 201) {
        toast.success(response.message);

        await fetchSalaries();
        handleCloseDrawer();
      }
    } catch (error) {
      console.error("Create Salary Error:", error);

      toast.error(error.response?.data?.message);
    } finally {
      setIsCreatingSalary(false);
    }
  };

  const handleUpdateSalary = async () => {
    if (!selectedSalary) return;

    // const payload = {
    //   basic_salary: Number(salaryData.grossSalary),
    //   bonus: Number(salaryData.bonus || 0),
    //   deduction: Number(salaryData.deduction || 0),
    //   payment_type: salaryData.paymentType,
    // };

    const payload = {
      basic_salary: parseAmount(salaryData.grossSalary),
      payment_type: salaryData.paymentType,
      remarks: salaryData.remarks || "",
    };

    if (selectedSalary.salaryType === "Trainer Salary") {
      payload.incentive_1 = parseAmount(salaryData.incentive1 || 0);
      payload.incentive_2 = parseAmount(salaryData.incentive2 || 0);
      payload.incentive_3 = parseAmount(salaryData.incentive3 || 0);
    }

    setIsUpdatingSalary(true);

    try {
      const response = await updateEmployeeSalary(
        selectedSalary.salaryId,
        payload,
      );

      if (response.statusCode === 200) {
        toast.success(response.message);

        await fetchSalaries();

        handleCloseDrawer();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Update Salary Error:", error);

      toast.error(error.response?.data?.message);
    } finally {
      setIsUpdatingSalary(false);
    }
  };

  const handlePaySalary = async () => {
    if (!selectedSalary) return;

    // const payload = {
    //   basic_salary: Number(salaryData.grossSalary),
    //   bonus: Number(salaryData.bonus || 0),
    //   deduction: Number(salaryData.deduction || 0),
    //   payment_date: salaryData.date,
    //   payment_type: salaryData.paymentType,
    // };

    const payload = {
      basic_salary: parseAmount(salaryData.grossSalary),
      payment_date: salaryData.date,
      payment_type: salaryData.paymentType,
      remarks: salaryData.remarks || "",
    };

    if (selectedSalary.salaryType === "Trainer Salary") {
      payload.incentive_1 = parseAmount(salaryData.incentive1 || 0);
      payload.incentive_2 = parseAmount(salaryData.incentive2 || 0);
      payload.incentive_3 = parseAmount(salaryData.incentive3 || 0);
    }

    setIsCreditingSalary(true);
    try {
      const response = await creditEmployeeSalary(
        selectedSalary.salaryId,
        payload,
      );

      if (response.statusCode === 201) {
        toast.success(response.message);

        await fetchSalaries();
        handleCloseDrawer();
      }
    } catch (error) {
      toast.error(error.response?.data?.message);
    } finally {
      setIsCreditingSalary(false);
    }
  };

  const handleSalarySubmit = (e) => {
    e?.preventDefault();

    if (isCreatingSalary || isUpdatingSalary || isCreditingSalary) {
      return;
    }

    if (isPaymentUpdate) {
      handlePaySalary();
      return;
    }

    if (isEdit) {
      handleUpdateSalary();
      return;
    }

    handleCreateSalary();
  };

  const handleClearFilters = () => {
    setSearch("");
    setActiveFilters({});
    setCurrentPage(1);
  };

  const filteredRecords = useMemo(() => {
    return records.filter((item) => {
      const searchValue = search.toLowerCase();

      const searchMatch =
        item.employeeName?.toLowerCase().includes(searchValue) ||
        item.employeeAdmissionId?.toLowerCase().includes(searchValue);

      const filterMatch = Object.entries(activeFilters).every(
        ([key, value]) => {
          if (!value || value === "All") return true;

          return item[key] === value;
        },
      );

      return searchMatch && filterMatch;
    });
  }, [records, search, activeFilters]);

  const trainerRecords = filteredRecords.filter(
    (item) => item.salaryType === "Trainer Salary",
  );

  const staffRecords = filteredRecords.filter(
    (item) => item.salaryType === "Staff Salary",
  );

  const statusOptions = useMemo(() => {
    return [...new Set(records.map((item) => item.status).filter(Boolean))];
  }, [records]);

  const currentData = useMemo(() => {
    return activeTab === "trainer" ? trainerRecords : staffRecords;
  }, [activeTab, trainerRecords, staffRecords]);

  //pagination
  const totalPages = Math.ceil(currentData.length / pageSize);

  const safeCurrentPage =
    currentPage > totalPages ? totalPages || 1 : currentPage;

  const paginatedRecords = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;

    return currentData.slice(startIndex, startIndex + pageSize);
  }, [currentData, safeCurrentPage]);

  return (
    <div className="common-management-main-section">
      <div className="dashboard-action-page-header">
        <div>
          <h2 className="all-dash-page-title">Salary Management</h2>

          <p className="all-dash-page-subtitle">
            {/* Manage trainer and staff salary payments. */}
            Manage trainer and staff salaries, payments, dues, renewals, and
            payment history
          </p>
        </div>

        <Button
          className="dashboard-action-primary-btn"
          onClick={handleAddSalary}
        >
          <FiPlus className="dashboard-action-primary-btn-icon" />
          Add Salary
        </Button>
      </div>

      {/* Loader */}
      {isSalaryLoading ? (
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
                title="Total Salary"
                value={statistics.total_salary}
                icon={MdCurrencyRupee}
              />
            </Col>

            <Col md={3} xs={6}>
              <StatCard
                title="Paid Salary"
                value={statistics.paid_salary}
                icon={FiTrendingUp}
              />
            </Col>

            <Col md={3} xs={6}>
              <StatCard
                title="Pending Salary"
                value={statistics.pending_salary}
                icon={FiClock}
              />
            </Col>

            <Col md={3} xs={6}>
              <StatCard
                title="Employees"
                value={statistics.employees}
                icon={FiUsers}
              />
            </Col>
          </Row>

          {/* Tabs */}
          <Tabs
            activeKey={activeTab}
            onSelect={(key) => {
              setActiveTab(key);
              setCurrentPage(1);
              setSearch("");
              setActiveFilters({});
            }}
            className="salary-bootstrap-tabs mb-3"
          >
            <Tab eventKey="trainer" title="Trainer Salary" />
            <Tab eventKey="staff" title="Staff Salary" />
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
            data={currentData}
            columns={columns}
            exportFileName={
              activeTab === "trainer" ? "trainer-salary" : "staff-salary"
            }
          />

          {/* Table */}
          <Table
            columns={columns}
            data={paginatedRecords}
            rowKey="salaryId"
            actions={(row) => (
              <div className="common-management-action-buttons">
                <button
                  title="View Salary"
                  onClick={() =>
                    navigate(
                      `/management/salary-profile/${row.employeeId}/${row.salaryType === "Trainer Salary" ? "Coach" : "Staff"}`,
                    )
                  }
                >
                  <FiEye />
                </button>

                {row.status === "Paid" && (
                  <button
                    title="Edit Salary"
                    onClick={() => {
                      handleEditSalary(row);
                    }}
                  >
                    <FiEdit2 />
                  </button>
                )}

                {row.status === "Pending" && (
                  <button
                    title="Pay Salary"
                    onClick={() => handlePaymentUpdate(row)}
                  >
                    <FiRefreshCw />
                  </button>
                )}
              </div>
            )}
          />
        </>
      )}

      {/* Pagination */}
      {currentData.length > 0 && (
        <TablePagination
          page={safeCurrentPage}
          totalPages={totalPages}
          totalRecords={currentData.length}
          pageSize={pageSize}
          onPrevious={() => setCurrentPage((prev) => prev - 1)}
          onNext={() => setCurrentPage((prev) => prev + 1)}
        />
      )}

      {/* Salary Drawer */}
      <CommonDrawer
        show={showDrawer}
        onClose={handleCloseDrawer}
        title={
          isPaymentUpdate
            ? "Update Pending Salary"
            : isEdit
              ? "Edit Salary"
              : "Add Salary"
        }
        saveText={
          isPaymentUpdate
            ? "Update Payment"
            : isEdit
              ? "Update Salary"
              : "Save Salary"
        }
        onSave={handleSalarySubmit}
        disabled={isCreatingSalary || isUpdatingSalary || isCreditingSalary}
      >
        <h6 className="ui-common-drawer-section-title">Salary Details</h6>

        <FormField
          label="Salary Type"
          name="salaryType"
          type="select"
          value={salaryData.salaryType}
          disabled={isEdit || isPaymentUpdate}
          onChange={handleSalaryChange}
          options={[
            {
              label: "Select Salary Type",
              value: "",
            },
            {
              label: "Trainer Salary",
              value: "Trainer Salary",
            },

            {
              label: "Staff Salary",
              value: "Staff Salary",
            },
          ]}
          required
        />

        <FormField
          label="Date"
          name="date"
          type="date"
          value={salaryData.date}
          disabled={isEdit}
          onChange={handleSalaryChange}
          required
        />

        <FormField
          label="Employee Name"
          name="employeeId"
          type="search-select"
          value={salaryData.employeeId}
          onChange={handleSalaryChange}
          placeholder="Search player..."
          options={
            isEligibleLoading
              ? [
                  {
                    label: "Loading employees...",
                    value: "",
                  },
                ]
              : [
                  {
                    label: "Select Name",
                    value: "",
                  },

                  ...eligibleEmployees.map((employee) => ({
                    label: employee.employee_name,
                    value: employee.employee_id,
                  })),
                ]
          }
          disabled={
            isEdit ||
            isPaymentUpdate ||
            !salaryData.salaryType ||
            isEligibleLoading
          }
          required
        />

        <FormField
          label="Gross Salary"
          name="grossSalary"
          // type="number"
          value={salaryData.grossSalary}
          onChange={handleSalaryChange}
          disabled={!salaryData.salaryType}
          required
        />

        {salaryData.salaryType === "Trainer Salary" && (
          <>
            <FormField
              label="Incentive 1"
              name="incentive1"
              value={salaryData.incentive1}
              onChange={handleSalaryChange}
            />

            <FormField
              label="Incentive 2"
              name="incentive2"
              value={salaryData.incentive2}
              onChange={handleSalaryChange}
            />

            <FormField
              label="Incentive 3"
              name="incentive3"
              value={salaryData.incentive3}
              onChange={handleSalaryChange}
            />
          </>
        )}

        {/* <FormField
          label="Bonus"
          name="bonus"
          type="number"
          value={salaryData.bonus}
          onChange={handleSalaryChange}
        /> */}

        {/* <FormField
          label="Deduction"
          name="deduction"
          type="number"
          value={salaryData.deduction}
          onChange={handleSalaryChange}
        /> */}

        <FormField
          label="Payment Type"
          name="paymentType"
          type="select"
          value={salaryData.paymentType}
          onChange={handleSalaryChange}
          options={[
            {
              label: "Select Payment",
              value: "",
            },

            {
              label: "UPI",
              value: "UPI",
            },

            {
              label: "Cash",
              value: "Cash",
            },

            {
              label: "Bank Transfer",
              value: "Bank Transfer",
            },
          ]}
          required
        />

        <FormField
          label="Remarks"
          name="remarks"
          type="textarea"
          rows={3}
          value={salaryData.remarks}
          onChange={handleSalaryChange}
          placeholder="Enter remarks (if any)"
        />
      </CommonDrawer>
    </div>
  );
};

export default Salary;
