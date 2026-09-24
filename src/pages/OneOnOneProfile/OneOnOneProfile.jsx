import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "react-bootstrap";

import { FiArrowLeft, FiPhone } from "react-icons/fi";

import { getOneOnOneByPlayerId } from "../../services/oneOnOneService";
import { initialsFromName } from "../../utils/initialsFromName";

import toast from "react-hot-toast";
import { ThreeDots } from "react-loader-spinner";

import TableToolbar from "../../components/ui/TableToolbar/TableToolbar";
import Table from "../../components/ui/Table/Table";
import TablePagination from "../../components/ui/TablePagination/TablePagination";
import DescriptionCell from "../../components/ui/DescriptionCell/DescriptionCell.jsx";

const OneOnOneProfile = () => {
  const navigate = useNavigate();
  const { playerId } = useParams();

  const [playerProfile, setPlayerProfile] = useState(null);
  const [applications, setApplications] = useState([]);

  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  //loading
  const [isPlayersLoading, setIsPlayersLoading] = useState(true);

  const pageSize = 5;

  const columns = useMemo(
    () => [
      {
        header: "Trainer",
        accessor: "trainerName",
        cell: (row) => (
          <span
            className="common-management-trainerName-name"
            title={row.trainerName || "-"}
          >
            {row.trainerName || "-"}
          </span>
        ),
      },

      {
        header: "Focus Area",
        accessor: "focusArea",
      },

      {
        header: "Preferred Slot",
        accessor: "preferredSlot",
      },

      {
        header: "Date",
        accessor: "date",
      },
      {
        header: "Amount",
        accessor: "amount",
        cell: ({ amount }) =>
          amount ? `₹${Number(amount).toLocaleString("en-IN")}` : "-",
      },

      {
        header: "Payment Type",
        accessor: "paymentType",
      },

      // {
      //   header: "Sessions",
      //   accessor: "sessions",
      //   cell: (row) =>
      //     row.sessions !== null && row.sessions !== undefined
      //       ? `${row.sessions} Done`
      //       : "0 Done",
      // },

      {
        header: "	Remarks",
        accessor: "remarks",

        cell: (row) => <DescriptionCell text={row.remarks?.trim() || "-"} />,
        // cell: (row) => <div>{row.remarks}</div>,
      },

      {
        header: "Payment",
        accessor: "paymentStatus",

        cell: (row) => (
          <span
            className={
              row.paymentStatus === "Paid"
                ? "common-management-table-status-success"
                : "common-management-table-status-warning"
            }
          >
            {row.paymentStatus}
          </span>
        ),
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
    ],
    [],
  );

  useEffect(() => {
    const fetchPlayerApplications = async () => {
      setIsPlayersLoading(true);
      try {
        const response = await getOneOnOneByPlayerId(playerId);

        if (response.statusCode === 200) {
          setPlayerProfile(response.data.player);

          const formatted = (response.data.applications || []).map((item) => ({
            applicationId: item.application_id,
            trainerName: item.coach_name || "-",
            focusArea: item.focus_area || "-",
            preferredSlot: item.preferred_slot || "-",
            date: item.application_date || "-",
            amount: item.fee_amount || 0,
            paymentStatus: item.payment_status || "-",
            paymentType: item.payment_type,
            remarks: item.remarks || "-",
            sessions: item.sessions ?? 0,
            status: item.status || "-",
          }));

          setApplications(formatted);
        } else {
          toast.error(response.message);
        }
      } catch (error) {
        console.error("Get Player Profile Error:", error);
        toast.error(error.response?.data?.message);
      } finally {
        setIsPlayersLoading(false);
      }
    };

    fetchPlayerApplications();
  }, [playerId]);

  const filteredHistory = useMemo(() => {
    return applications.filter((item) => {
      const searchValue = search.toLowerCase();

      const searchMatch =
        item.trainerName?.toLowerCase().includes(searchValue) ||
        item.focusArea?.toLowerCase().includes(searchValue) ||
        item.date?.toLowerCase().includes(searchValue) ||
        item.paymentType?.toLowerCase().includes(searchValue) ||
        item.status?.toLowerCase().includes(searchValue);

      const filterMatch = Object.entries(activeFilters).every(
        ([key, value]) => {
          if (!value || value === "All") return true;

          return item[key] === value;
        },
      );

      return searchMatch && filterMatch;
    });
  }, [applications, search, activeFilters]);

  const statusOptions = useMemo(
    () => [...new Set(applications.map((item) => item.status).filter(Boolean))],
    [applications],
  );

  const paymentOptions = useMemo(
    () => [
      ...new Set(
        applications.map((item) => item.paymentStatus).filter(Boolean),
      ),
    ],
    [applications],
  );

  const totalPages = Math.ceil(filteredHistory.length / pageSize);

  const safeCurrentPage =
    currentPage > totalPages ? totalPages || 1 : currentPage;

  const paginatedHistory = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;

    return filteredHistory.slice(startIndex, startIndex + pageSize);
  }, [filteredHistory, safeCurrentPage]);

  if (isPlayersLoading) {
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
          Back to Coaching
        </button>

        <h3>Application Not Found</h3>
      </div>
    );
  }

  return (
    <div className="common-page-profile-container">
      <button
        className="common-page-profile-back-button"
        onClick={() => navigate("/management/personal-training")}
      >
        <FiArrowLeft />
        Back To Coaching
      </button>

      <Card className="common-page-profile-header-card">
        <Card.Body>
          <div className="common-page-profile-header-wrapper">
            <div className="common-page-profile-avatar">
              {initialsFromName(playerProfile.full_name)}
            </div>

            <div className="student-profile-main-details">
              <div className="common-page-profile-name-row">
                <h2 className="common-page-profile-name">
                  {playerProfile.full_name}
                </h2>

                {/* <span className="common-page-status-badge">
                  {application.status}
                </span> */}
              </div>

              <p className="common-page-profile-sub-title">
                {playerProfile.admission_id}
                {" • "}
                {playerProfile.focus_area}
                {/* {" • "}
                {application.trainerName} */}
              </p>

              <div className="common-page-contact-wrapper">
                <div className="common-page-profile-contact-item">
                  <FiPhone />

                  {playerProfile.phone_number}
                </div>

                {/* <div className="common-page-profile-contact-item">
                  <FiMail />

                  {playerProfile.email || "-"}
                </div> */}

                {/* <div className="common-page-profile-contact-item">
                  Focus:
                  {application.focusArea}
                </div>

                <div className="common-page-profile-contact-item">
                  Slot:
                  {application.preferredSlot}
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
            key: "status",
            label: "Status",
            options: statusOptions,
          },

          {
            key: "paymentStatus",
            label: "Payment",
            options: paymentOptions,
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
        data={filteredHistory}
        columns={columns}
        exportFileName="one-on-one-sessions"
      />

      {/* Table */}
      <Table columns={columns} data={paginatedHistory} rowKey="applicationId" />

      {/* Pagination */}
      {filteredHistory.length > 0 && (
        <TablePagination
          page={safeCurrentPage}
          totalPages={totalPages}
          totalRecords={filteredHistory.length}
          pageSize={pageSize}
          onPrevious={() => setCurrentPage((prev) => prev - 1)}
          onNext={() => setCurrentPage((prev) => prev + 1)}
        />
      )}
    </div>
  );
};

export default OneOnOneProfile;
