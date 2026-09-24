import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "react-bootstrap";

import { FiArrowLeft, FiPhone } from "react-icons/fi";

import { getSalaryHistory } from "../../services/employeeSalaryService";
import { initialsFromName } from "../../utils/initialsFromName";

import toast from "react-hot-toast";
import { ThreeDots } from "react-loader-spinner";

import TableToolbar from "../../components/ui/TableToolbar/TableToolbar";
import Table from "../../components/ui/Table/Table";
import TablePagination from "../../components/ui/TablePagination/TablePagination";
import DescriptionCell from "../../components/ui/DescriptionCell/DescriptionCell.jsx";

import "./SalaryProfile.css";

const SalaryProfile = () => {
  const navigate = useNavigate();
  const { employeeId, employeeType } = useParams();

  const [salaryProfile, setSalaryProfile] = useState(null);
  const [salaryHistory, setSalaryHistory] = useState([]);

  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  //loading
  const [isSalaryProfileLoading, setIsSalaryProfileLoading] = useState(true);

  const pageSize = 5;

  const columns = useMemo(
    () => [
      {
        header: "Year",
        accessor: "year",
      },
      {
        header: "Month",
        accessor: "month",
      },

      {
        header: "Payment Date",
        accessor: "paymentDate",
      },
      {
        header: "Base Salary",
        accessor: "grossSalary",
        cell: (row) =>
          row.grossSalary
            ? `₹${Number(row.grossSalary).toLocaleString("en-IN")}`
            : "-",
      },

      // {
      //   header: "Bonus",
      //   accessor: "bonus",
      //   cell: (row) => `₹${row.bonus.toLocaleString("en-IN")}`,
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

      // Show incentives ONLY for Coach
      ...(salaryProfile?.employee_type === "Coach"
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
    [salaryProfile?.employee_type],
  );

  useEffect(() => {
    const fetchHistory = async () => {
      setIsSalaryProfileLoading(true);

      try {
        const params =
          employeeType === "Coach"
            ? { coach_id: employeeId }
            : { staff_id: employeeId };

        const response = await getSalaryHistory(params);

        if (response.statusCode === 200) {
          setSalaryProfile(response.data.profile);

          const formattedHistory = (response.data.salary_history || []).map(
            (item) => ({
              salaryId: item.salary_id,
              year: String(item.salary_year),
              month: new Date(
                item.salary_year,
                item.salary_month - 1,
              ).toLocaleString("en-US", { month: "long" }),
              paymentDate: item.payment_date || "-",
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
            }),
          );

          setSalaryHistory(formattedHistory);
        } else {
          toast.error(response.message);
        }
      } catch (error) {
        console.error("Get Salary Error:", error);

        toast.error(error.response?.data?.message);
      } finally {
        setIsSalaryProfileLoading(false);
      }
    };

    fetchHistory();
  }, [employeeId, employeeType]);

  const filteredSalaryHistory = useMemo(() => {
    return salaryHistory.filter((item) => {
      const searchValue = search.toLowerCase();

      const searchMatch =
        item.month?.toLowerCase().includes(searchValue) ||
        item.year?.toLowerCase().includes(searchValue) ||
        item.paymentDate?.toLowerCase().includes(searchValue) ||
        item.status?.toLowerCase().includes(searchValue) ||
        item.grossSalary?.toString().includes(searchValue);

      const filterMatch = Object.entries(activeFilters).every(
        ([key, value]) => {
          if (!value || value === "All") return true;

          return item[key] === value;
        },
      );

      return searchMatch && filterMatch;
    });
  }, [salaryHistory, search, activeFilters]);

  const yearOptions = useMemo(() => {
    return [...new Set(salaryHistory.map((item) => item.year).filter(Boolean))];
  }, [salaryHistory]);

  const monthOptions = useMemo(() => {
    return [
      ...new Set(salaryHistory.map((item) => item.month).filter(Boolean)),
    ];
  }, [salaryHistory]);

  const totalPages = Math.ceil(filteredSalaryHistory.length / pageSize);

  const safeCurrentPage =
    currentPage > totalPages ? totalPages || 1 : currentPage;

  const paginatedSalary = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;

    return filteredSalaryHistory.slice(startIndex, startIndex + pageSize);
  }, [filteredSalaryHistory, safeCurrentPage]);

  if (isSalaryProfileLoading) {
    return (
      <div className="ui-common-loader">
        <ThreeDots height="20" width="50" color="#057DCD" ariaLabel="loading" />
      </div>
    );
  }

  // Return AFTER all hooks
  if (!salaryProfile) {
    return (
      <div className="common-page-profile-no-data-container">
        <button
          className="common-page-profile-back-button"
          onClick={() => navigate(-1)}
        >
          <FiArrowLeft />
          Back to Salary
        </button>

        <h3>Salary Record Not Found</h3>
      </div>
    );
  }

  return (
    <div className="common-page-profile-container">
      {/* Back Button */}
      <button
        className="common-page-profile-back-button"
        onClick={() => navigate("/management/salary-management")}
      >
        <FiArrowLeft />
        Back to Salary
      </button>

      {/* Header Card */}
      <Card className="common-page-profile-header-card">
        <Card.Body className="common-page-profile-header-card-body">
          <div className="common-page-profile-header-wrapper">
            {/* Avatar */}
            <div className="common-page-profile-avatar">
              {initialsFromName(salaryProfile.full_name)}
            </div>

            {/* Trainer Details */}
            <div className="student-profile-main-details">
              <div className="common-page-profile-name-row">
                <h2 className="common-page-profile-name">
                  {salaryProfile.full_name}
                </h2>

                {salaryProfile.is_active !== undefined && (
                  <span
                    className={
                      salaryProfile.is_active
                        ? "common-page-status-badge common-page-status-active"
                        : "common-page-status-badge common-page-status-inactive"
                    }
                  >
                    {salaryProfile.is_active ? "Active" : "Inactive"}
                  </span>
                )}
              </div>

              <p className="common-page-profile-sub-title">
                {salaryProfile.employee_type === "Coach"
                  ? salaryProfile.coach_code
                  : salaryProfile.staff_code}
                {" • "}
                {salaryProfile.employee_type}
                {" • "}
                {salaryProfile.employee_type === "Coach"
                  ? salaryProfile.specialization
                  : salaryProfile.designation}
              </p>

              <div className="common-page-contact-wrapper">
                <div className="common-page-profile-contact-item">
                  <FiPhone />
                  {salaryProfile.phone_number}
                </div>

                {salaryProfile.employee_type === "Coach" && (
                  <div className="common-page-profile-contact-item">
                    Experience: {salaryProfile.experience} Years
                  </div>
                )}

                <div className="common-page-profile-contact-item">
                  Join Date: {salaryProfile.join_date}
                </div>

                {/* <div className="common-page-profile-contact-item">
                  <FiStar />
                  {employee?.rating}
                </div> */}
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Toolbar */}
      <TableToolbar
        search={search}
        setSearch={(value) => {
          setSearch(value);
          setCurrentPage(1);
        }}
        filters={[
          {
            key: "year",
            label: "Year",
            options: yearOptions,
          },
          {
            key: "month",
            label: "Month",
            options: monthOptions,
          },
        ]}
        activeFilters={activeFilters}
        setActiveFilters={(value) => {
          setActiveFilters(value);
          setCurrentPage(1);
        }}
        onClear={() => {
          setSearch("");
          setActiveFilters({});
          setCurrentPage(1);
        }}
        data={filteredSalaryHistory}
        columns={columns}
        exportFileName="salary-history"
      />

      {/* Table */}
      <Table columns={columns} data={paginatedSalary} rowKey="salaryId" />

      {/* Pagination */}
      {filteredSalaryHistory.length > 0 && (
        <TablePagination
          page={safeCurrentPage}
          totalPages={totalPages}
          totalRecords={filteredSalaryHistory.length}
          pageSize={pageSize}
          onPrevious={() => setCurrentPage((prev) => prev - 1)}
          onNext={() => setCurrentPage((prev) => prev + 1)}
        />
      )}
    </div>
  );
};

export default SalaryProfile;
