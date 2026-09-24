import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "react-bootstrap";

import { FiArrowLeft, FiPhone, } from "react-icons/fi";

import { getPlayerFeesByPlayerId } from "../../services/playerFeeService";
import { initialsFromName } from "../../utils/initialsFromName";

import toast from "react-hot-toast";
import { ThreeDots } from "react-loader-spinner";

import TableToolbar from "../../components/ui/TableToolbar/TableToolbar";
import Table from "../../components/ui/Table/Table";
import TablePagination from "../../components/ui/TablePagination/TablePagination";
import DescriptionCell from "../../components/ui/DescriptionCell/DescriptionCell.jsx";

const FeeProfile = () => {
  const navigate = useNavigate();
  const { playerId } = useParams();

  const [playerProfile, setPlayerProfile] = useState(null);
  const [feeHistory, setFeeHistory] = useState([]);

  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  //loading
  const [isFeeProfileLoading, setIsFeeProfileLoading] = useState(true);

  const pageSize = 5;

  const columns = useMemo(
    () => [
      {
        header: "Month",
        accessor: "month",
      },

      {
        header: "Fee Type",
        accessor: "feeType",
      },

      {
        header: "Regular Fee",
        accessor: "amount",
        cell: (row) => `₹${Number(row.amount).toLocaleString("en-IN")}`,
      },

      {
        header: "Hostel Fee",
        accessor: "hostelFee",
        cell: (row) => `₹${Number(row.hostelFee).toLocaleString("en-IN")}`,
      },

      {
        header: "Payment Type",
        accessor: "paymentType",
      },

      {
        header: "Paid Date",
        accessor: "paidDate",
      },
      {
        header: "Due Date",
        accessor: "dueDate",
      },

      {
        header: "Remarks",
        accessor: "remarks",
        cell: (row) => <DescriptionCell text={row.remarks || "-"} />,
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
    [],
  );

  useEffect(() => {
    const fetchFeeProfile = async () => {
      setIsFeeProfileLoading(true);

      try {
        const response = await getPlayerFeesByPlayerId(playerId);

        if (response.statusCode === 200) {
          setPlayerProfile(response.data.player);

          const formattedFees = (response.data.fees || []).map((fee) => ({
            feeId: fee.fee_id,
            month: new Date(fee.payment_date).toLocaleString("en-IN", {
              month: "long",
              year: "numeric",
            }),
            feeType: fee.fee_type,
            amount: Number(fee.amount),
            hostelFee: Number(fee.hostel_fee) || 0,
            paymentType: fee.payment_type,
            paidDate: fee.payment_date,
            dueDate: fee.due_date || "-",
            remarks: fee.remarks || "-",
            status: fee.status,
          }));

          setFeeHistory(formattedFees);
        } else {
          toast.error(response.message);
        }
      } catch (error) {
        console.error("Get Player Fees Error:", error);

        toast.error(error.response?.data?.message);
      } finally {
        setIsFeeProfileLoading(false);
      }
    };

    fetchFeeProfile();
  }, [playerId]);

  const filteredFeeHistory = useMemo(() => {
    return feeHistory.filter((item) => {
      const searchValue = search.toLowerCase();

      const searchMatch =
        item.month?.toLowerCase().includes(searchValue) ||
        item.paymentType?.toLowerCase().includes(searchValue) ||
        item.feeType?.toLowerCase().includes(searchValue) ||
        item.status?.toLowerCase().includes(searchValue);

      const filterMatch = Object.entries(activeFilters).every(
        ([key, value]) => {
          if (!value || value === "All") return true;

          return item[key] === value;
        },
      );

      return searchMatch && filterMatch;
    });
  }, [feeHistory, search, activeFilters]);

  const monthOptions = useMemo(
    () => [...new Set(feeHistory.map((item) => item.month).filter(Boolean))],
    [feeHistory],
  );

  const totalPages = Math.ceil(filteredFeeHistory.length / pageSize);

  const safeCurrentPage =
    currentPage > totalPages ? totalPages || 1 : currentPage;

  const paginatedFeeHistory = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;

    return filteredFeeHistory.slice(startIndex, startIndex + pageSize);
  }, [filteredFeeHistory, safeCurrentPage]);

  if (isFeeProfileLoading) {
    return (
      <div className="ui-common-loader">
        <ThreeDots height="20" width="50" color="#057DCD" ariaLabel="loading" />
      </div>
    );
  }

  if (!playerProfile) {
    return (
      <div className="common-page-profile-no-data-container">
        <button
          className="common-page-profile-back-button"
          onClick={() => navigate(-1)}
        >
          <FiArrowLeft />
          Back to Fee
        </button>

        <h3>Fee Record Not Found</h3>
      </div>
    );
  }

  return (
    <div className="common-page-profile-container">
      <button
        className="common-page-profile-back-button"
        onClick={() => navigate("/management/fee-renewals")}
      >
        <FiArrowLeft />
        Back to Fee
      </button>

      {/* Header Card */}
      <Card className="common-page-profile-header-card">
        <Card.Body>
          <div className="common-page-profile-header-wrapper">
            {/* Avatar */}
            <div className="common-page-profile-avatar">
              {initialsFromName(playerProfile.full_name)}
            </div>

            {/* Trainer Details */}
            <div className="student-profile-main-details">
              <div className="common-page-profile-name-row">
                <h2 className="common-page-profile-name">
                  {playerProfile.full_name}
                </h2>

                {/* <span className="common-page-status-badge">
                  {playerProfile.status}
                </span> */}
              </div>

              <p className="common-page-profile-sub-title">
                {playerProfile.admission_id}
                {/* {" • "}
                {playerProfile.playingRole} */}
                {" • "}
                {playerProfile.batch}
              </p>

              <div className="common-page-contact-wrapper">
                <div className="common-page-profile-contact-item">
                  <FiPhone />
                  {playerProfile.phone_number}
                </div>

                {/* <div className="common-page-profile-contact-item">
                  <FiMail />
                  {playerProfile.email}
                </div> */}

                <div className="common-page-profile-contact-item">
                  Joined : {playerProfile.admission_date}
                </div>
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
        data={filteredFeeHistory}
        columns={columns}
        exportFileName="fee-history"
      />

      {/* Table */}
      <Table columns={columns} data={paginatedFeeHistory} rowKey="feeId" />

      {/* Pagination */}
      {filteredFeeHistory.length > 0 && (
        <TablePagination
          page={safeCurrentPage}
          totalPages={totalPages}
          totalRecords={filteredFeeHistory.length}
          pageSize={pageSize}
          onPrevious={() => setCurrentPage((prev) => prev - 1)}
          onNext={() => setCurrentPage((prev) => prev + 1)}
        />
      )}
    </div>
  );
};

export default FeeProfile;
