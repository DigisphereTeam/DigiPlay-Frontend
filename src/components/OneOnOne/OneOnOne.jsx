import { useEffect, useCallback, useMemo, useState, useRef } from "react";
import { Row, Col, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

import {
  FiUserCheck,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiPlus,
  FiRefreshCw,
  // FiXCircle,
  FiEye,
  FiUserX,
  FiPrinter,
  FiEdit2,
} from "react-icons/fi";

import {
  createOneOnOne,
  getOneOnOne,
  renewOneOnOne,
  // cancelOneOnOne,
  updateOneOnOne,
  updateOneOnOneStatus,
} from "../../services/oneOnOneService";
import { getPlayersWithTrainers } from "../../services/playerService";

import { initialsFromName } from "../../utils/initialsFromName";
import { canCreate, canView, canEdit } from "../../utils/permissions";

import toast from "react-hot-toast";
import { ThreeDots } from "react-loader-spinner";

// img
import logoImg from "../../assets/images/kk-logo.png";

import StatCard from "../../components/ui/StatCard/StatCard";
import CommonDrawer from "../../components/ui/CommonDrawer/CommonDrawer";
import ConfirmDialog from "../../components/ui/ConfirmDialog/ConfirmDialog";
import FormField from "../../components/ui/FormField/FormField";
import TableToolbar from "../../components/ui/TableToolbar/TableToolbar";
import Table from "../../components/ui/Table/Table";
import TablePagination from "../../components/ui/TablePagination/TablePagination";
import DescriptionCell from "../ui/DescriptionCell/DescriptionCell.jsx";

// const PREFERRED_SLOTS = [
//   "05:00 AM - 05:30 AM",
//   "05:30 AM - 06:00 AM",
//   "06:00 AM - 06:30 AM",
//   "08:00 AM - 08:30 AM",
//   "08:30 AM - 09:00 AM",
//   "09:00 AM - 09:30 AM",
//   "09:30 AM - 10:00 AM",
//   "10:00 AM - 10:30 AM",
//   "10:30 AM - 11:00 AM",
//   "11:00 AM - 11:30 AM",
//   "11:30 AM - 12:00 PM",
//   "12:00 PM - 12:30 PM",
//   "02:30 PM - 03:00 PM",
//   "03:00 PM - 03:30 PM",
//   "03:30 PM - 04:00 PM",
//   "04:00 PM - 04:30 PM",
//   "06:00 PM - 06:30 PM",
//   "06:30 PM - 07:00 PM",
//   "07:00 PM - 07:30 PM",
//   "07:30 PM - 08:00 PM",
//   "08:00 PM - 08:30 PM",
// ];

const OneOnOne = () => {
  const [oneOnOnes, setOneOnOnes] = useState([]);
  const [statistics, setStatistics] = useState({});

  const emptyApplication = {
    playerId: "",
    coachId: "",
    focusArea: "",
    paymentType: "",
    amount: "",
    preferredSlot: "",
    remarks: "",
  };

  const [oneOnOneForm, setOneOnOneForm] = useState(emptyApplication);

  // dropdown api state
  const [players, setPlayers] = useState([]);
  const [coaches, setCoaches] = useState([]);

  const [showDrawer, setShowDrawer] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // const [editMode, setEditMode] = useState(false);
  const [formMode, setFormMode] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);

  // Print// download ReceiptDrawer
  const [showReceiptDrawer, setShowReceiptDrawer] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const oneOnOneReceiptRef = useRef(null);

  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  //loading
  const [isOneOnOneLoading, setIsOneOnOneLoading] = useState(true);
  const [isCreatingOneOnOne, setIsCreatingOneOnOne] = useState(false);
  const [isRenewOneOnOne, setIsRenewOneOnOne] = useState(false);
  const [isEditingOneOnOne, setIsEditingOneOnOne] = useState(false);
  // const [isCancelOneOnOne, setIsCancelOneOnOne] = useState(false);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);

  const pageSize = 5;

  const navigate = useNavigate();

  const handleApplicationChange = (e) => {
    const { name, value } = e.target;

    setOneOnOneForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const columns = useMemo(
    () => [
      {
        header: "Player",
        accessor: "studentName",
        cell: (row) => (
          <div className="common-management-name-cell">
            <div className="common-management-avatar">
              {initialsFromName(row.studentName)}
            </div>

            <div>
              <h6
                className="common-management-table-name"
                title={row.studentName || "-"}
              >
                {row.studentName || "-"}
              </h6>
              <span>{row.applicationNo || "-"}</span>
            </div>
          </div>
        ),
      },
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
        cell: (row) =>
          row.amount ? `₹${Number(row.amount).toLocaleString("en-IN")}` : "-",
      },
      {
        header: "Payment Type",
        accessor: "paymentType",
      },

      // {
      //   header: "Sessions",
      //   accessor: "sessionsCompleted",
      //   cell: (row) =>
      //     row.sessionsCompleted != null ? `${row.sessionsCompleted} Done` : "-",
      // },

      {
        header: "	Remarks",
        accessor: "remarks",

        cell: (row) => <DescriptionCell text={row.remarks?.trim() || "-"} />,
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

  // Open Add Drawer
  const handleAddApplication = () => {
    setOneOnOneForm({ ...emptyApplication });
    setSelectedApplication(null);
    setFormMode("create");
    setShowDrawer(true);
  };

  // Open Renew Drawer
  const handleRenewApplication = (row) => {
    setOneOnOneForm({
      playerId: row.playerId,
      coachId: row.coachId,
      focusArea: row.focusArea,
      amount: row.amount,
      paymentType: "",
      preferredSlot: row.preferredSlot,
      remarks: row.remarks || "",
    });

    setSelectedApplication(row);
    setFormMode("renew");
    setShowDrawer(true);
  };

  //Open Edit Application
  const handleEditOneOnOne = (row) => {
    setOneOnOneForm({
      playerId: row.playerId || "",
      coachId: row.coachId || "",
      focusArea: row.focusArea || "",
      paymentType: row.paymentType || "",
      amount: row.amount || "",
      preferredSlot: row.preferredSlot || "",
      remarks: row.remarks || "",
    });

    setSelectedApplication(row);
    setFormMode("edit");
    setShowDrawer(true);
  };

  // Close Drawer
  const handleCloseDrawer = () => {
    setShowDrawer(false);
    setFormMode(null);
    setSelectedApplication(null);
    setOneOnOneForm({ ...emptyApplication });
  };

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const response = await getPlayersWithTrainers();

        if (response.statusCode === 200) {
          setPlayers(response.data.players);
          setCoaches(response.data.coaches);
        } else {
          toast.error(response.message);
        }
      } catch (error) {
        console.error("Players Coaches Error:", error);
        toast.error("Failed to load players and coaches");
      }
    };

    fetchDropdownData();
  }, []);

  const playerOptions = useMemo(
    () => [
      {
        label: "Select Player",
        value: "",
      },
      ...players.map((player) => ({
        label: player.full_name,
        value: player.id,
      })),
    ],
    [players],
  );

  const coachOptions = useMemo(
    () => [
      {
        label: "Select Trainer",
        value: "",
      },
      ...coaches.map((coach) => ({
        label: coach.full_name,
        value: coach.id,
      })),
    ],
    [coaches],
  );

  const fetchOneOnOnes = useCallback(async () => {
    try {
      const response = await getOneOnOne();

      if (response.statusCode === 200) {
        const formattedOneOnOnes = (response.data.applications || []).map(
          (item) => ({
            applicationId: item.application_id,
            applicationNo: item.admission_id || "-",
            playerId: item.player_id,
            studentName: item.student_name || "-",
            coachId: item.coach_id,
            trainerName: item.coach_name || "-",
            focusArea: item.focus_area || "-",
            date: item.application_date || "-",
            amount: item.fee_amount || 0,
            paymentStatus: item.payment_status || "-",
            paymentType: item.payment_type || "-",
            preferredSlot: item.preferred_slot || "-",
            remarks: item.remarks || "-",
            sessionsCompleted: item.sessions ?? 0,
            // ADD THIS
            isActive: item.is_active,
            status: item.status || "-",
          }),
        );

        setOneOnOnes(formattedOneOnOnes);
        setStatistics(response.data.statistics || {});
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Get One On One Error:", error);

      toast.error(error.response?.data?.message);
    }
  }, []);

  useEffect(() => {
    const loadOneOnOnes = async () => {
      setIsOneOnOneLoading(true);

      try {
        await fetchOneOnOnes();
      } finally {
        setIsOneOnOneLoading(false);
      }
    };

    loadOneOnOnes();
  }, [fetchOneOnOnes]);

  const handleSubmitApplication = async (e) => {
    e.preventDefault();

    const isCreate = formMode === "create";
    const isEdit = formMode === "edit";
    const isRenew = formMode === "renew";

    if (
      !oneOnOneForm.coachId ||
      !oneOnOneForm.focusArea ||
      !oneOnOneForm.amount ||
      !oneOnOneForm.preferredSlot ||
      !oneOnOneForm.paymentType ||
      (isCreate && !oneOnOneForm.playerId)
    ) {
      toast.error("Please fill required details");
      return;
    }

    const amount = Number(String(oneOnOneForm.amount).replace(/[^0-9.]/g, ""));

    const payload = {
      coach_id: Number(oneOnOneForm.coachId),
      focus_area: oneOnOneForm.focusArea,
      payment_type: oneOnOneForm.paymentType,
      fee_amount: amount,
      preferred_slot: oneOnOneForm.preferredSlot,
      remarks: oneOnOneForm.remarks || "",
    };

    // CREATE
    if (isCreate) {
      await handleCreateApplication({
        player_id: Number(oneOnOneForm.playerId),
        ...payload,
      });
      return;
    }

    // EDIT
    if (isEdit) {
      await handleEditPlayer(payload);
      return;
    }

    // RENEW
    if (isRenew) {
      await handleRenewApplicationSubmit(payload);
      return;
    }
  };

  const handleCreateApplication = async (payload) => {
    setIsCreatingOneOnOne(true);

    try {
      const response = await createOneOnOne(payload);

      if (response.statusCode === 201) {
        toast.success(response.message);

        await fetchOneOnOnes();
        handleCloseDrawer();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Create OneOnOne Error:", error);

      toast.error(error.response?.data?.message);
    } finally {
      setIsCreatingOneOnOne(false);
    }
  };

  const handleEditPlayer = async (payload) => {
    if (!selectedApplication) return;

    setIsEditingOneOnOne(true);

    try {
      const response = await updateOneOnOne(
        selectedApplication.applicationId,
        payload,
      );

      if (response.statusCode === 200) {
        toast.success(response.message);

        await fetchOneOnOnes();
        handleCloseDrawer();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Update OneOnOne Error:", error);

      toast.error(error.response?.data?.message);
    } finally {
      setIsEditingOneOnOne(false);
    }
  };

  // Renew Application API
  const handleRenewApplicationSubmit = async (payload) => {
    if (!selectedApplication) return;

    setIsRenewOneOnOne(true);
    try {
      const response = await renewOneOnOne(
        selectedApplication.applicationId,
        payload,
      );

      if (response.statusCode === 201) {
        toast.success(response.message);

        await fetchOneOnOnes();
        handleCloseDrawer();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Renew Error:", error);
      toast.error(error.response?.data?.message);
    } finally {
      setIsRenewOneOnOne(false);
    }
  };

  // Open Cancel Confirmation
  // const handleCancelApplication = (row) => {
  //   setSelectedApplication(row);
  //   setShowConfirm(true);
  // };

  const handleChangeStautsApplication = (row) => {
    setSelectedApplication(row);
    setShowConfirm(true);
  };

  // const handleConfirmAction = async () => {
  //   if (!selectedApplication) return;

  //   setIsCancelOneOnOne(true);
  //   try {
  //     const response = await cancelOneOnOne(selectedApplication.applicationId);

  //     if (response.statusCode === 200) {
  //       toast.success(response.message);
  //       await fetchOneOnOnes();

  //       setShowConfirm(false);
  //       setSelectedApplication(null);
  //     } else {
  //       toast.error(response.message);
  //     }
  //   } catch (error) {
  //     console.error("Cancel Error:", error);

  //     toast.error(error.response?.data?.message || "Cancel failed");
  //   } finally {
  //     setIsCancelOneOnOne(false);
  //   }
  // };

  const handleStatusUpdate = async () => {
    if (!selectedApplication) return;
    setIsStatusUpdating(true);

    try {
      const response = await updateOneOnOneStatus(
        selectedApplication.applicationId,
        {
          is_active: !selectedApplication.isActive,
        },
      );

      if (response.statusCode === 200) {
        toast.success(response.message);

        await fetchOneOnOnes();
        setShowConfirm(false);
        setSelectedApplication(null);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Status Update Error:", error);

      toast.error(error.response?.data?.message);
    } finally {
      setIsStatusUpdating(false);
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setActiveFilters({});
    setCurrentPage(1);
  };

  const handleViewReceipt = (row) => {
    setSelectedReceipt(row);
    setShowReceiptDrawer(true);
  };

  const handleCloseReceipt = () => {
    setShowReceiptDrawer(false);
    setSelectedReceipt(null);
  };

  const handlePrint = useReactToPrint({
    contentRef: oneOnOneReceiptRef,
    documentTitle: `Personal_Training_${selectedReceipt?.applicationNo || "Receipt"}`,
  });

  const handleDownloadPDF = async () => {
    if (!oneOnOneReceiptRef.current || !selectedReceipt) return;

    try {
      const canvas = await html2canvas(oneOnOneReceiptRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#fff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");

      const pageWidth = 210;
      const pageHeight = 297;

      const receiptWidth = 160;

      const imageRatio = canvas.width / canvas.height;
      const receiptHeight = receiptWidth / imageRatio;

      const x = (pageWidth - receiptWidth) / 2;
      const y = (pageHeight - receiptHeight) / 2;

      pdf.addImage(
        imgData,
        "PNG",
        x,
        y,
        receiptWidth,
        receiptHeight,
        undefined,
        "FAST",
      );

      pdf.save(
        `Personal_Training_${selectedReceipt?.applicationNo || "Receipt"}.pdf`,
      );
    } catch (error) {
      console.error("Download PDF Error:", error);
      toast.error("Failed to download receipt");
    }
  };

  const filteredApplications = useMemo(() => {
    return oneOnOnes.filter((item) => {
      const searchValue = search.toLowerCase();

      const searchMatch =
        item.studentName?.toLowerCase().includes(searchValue) ||
        item.trainerName?.toLowerCase().includes(searchValue) ||
        item.applicationNo?.toLowerCase().includes(searchValue) ||
        item.focusArea?.toLowerCase().includes(searchValue);

      const filterMatch = Object.entries(activeFilters).every(([key, val]) => {
        if (!val || val === "All") return true;

        return item[key] === val;
      });

      return searchMatch && filterMatch;
    });
  }, [oneOnOnes, search, activeFilters]);

  const statusOptions = useMemo(
    () => [...new Set(oneOnOnes.map((x) => x.status).filter(Boolean))],
    [oneOnOnes],
  );

  const focusOptions = useMemo(
    () => [...new Set(oneOnOnes.map((x) => x.focusArea).filter(Boolean))],
    [oneOnOnes],
  );

  //pagination
  const totalPages = Math.ceil(filteredApplications.length / pageSize);

  const safeCurrentPage =
    currentPage > totalPages ? totalPages || 1 : currentPage;

  const paginatedApplications = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;

    return filteredApplications.slice(startIndex, startIndex + pageSize);
  }, [filteredApplications, safeCurrentPage]);

  return (
    <div className="common-management-main-section">
      <div className="dashboard-action-page-header">
        <div>
          <h2 className="all-dash-page-title">Personal Training</h2>

          <p className="all-dash-page-subtitle">
            {/* Manage personal coaching sessions and monthly applications. */}
            Manage player applications, trainer sessions, preferred slots,
            dates, payments, and renewals.
          </p>
        </div>

        {canCreate() && (
          <Button
            className="dashboard-action-primary-btn"
            onClick={handleAddApplication}
          >
            <FiPlus className="dashboard-action-primary-btn-icon" />
            New Application
          </Button>
        )}
      </div>

      {/* Loader */}
      {isOneOnOneLoading ? (
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
                title="Total Applications"
                value={statistics.total_applications}
                icon={FiUserCheck}
              />
            </Col>

            <Col md={3} xs={6}>
              <StatCard
                title="Active"
                value={statistics.active_sessions}
                icon={FiCheckCircle}
              />
            </Col>

            <Col md={3} xs={6}>
              <StatCard
                title="Pending Renewal"
                value={statistics.pending_renewal}
                icon={FiClock}
              />
            </Col>

            <Col md={3} xs={6}>
              <StatCard
                title="This Month"
                value={statistics.this_month}
                icon={FiCalendar}
              />
            </Col>
          </Row>

          {/* Toolbar */}
          <TableToolbar
            search={search}
            setSearch={(value) => {
              setSearch(value);
              setCurrentPage(1);
            }}
            filters={[
              {
                key: "focusArea",
                label: "Focus Area",
                options: focusOptions,
              },

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
            data={filteredApplications}
            columns={columns}
            exportFileName="personal-training"
          />

          {/* Table */}
          <Table
            columns={columns}
            data={paginatedApplications}
            rowKey="applicationId"
            actions={(row) => (
              <div className="common-management-action-buttons">
                {/* View */}
                {canView() && (
                  <button
                    title="View Application"
                    onClick={() =>
                      navigate(`/management/one-on-one-profile/${row.playerId}`)
                    }
                  >
                    <FiEye />
                  </button>
                )}

                {canEdit() && (
                  <button
                    title="Edit Application"
                    onClick={() => handleEditOneOnOne(row)}
                  >
                    <FiEdit2 />
                  </button>
                )}

                {row.paymentStatus === "Pending" && (
                  <>
                    <button
                      className={`common-management-action-button ${
                        !row.isActive
                          ? "common-management-action-button-disabled"
                          : ""
                      }`}
                      title={
                        row.isActive
                          ? "Renew Application"
                          : "Application Inactive"
                      }
                      disabled={!row.isActive}
                      onClick={() => handleRenewApplication(row)}
                    >
                      <FiRefreshCw />
                    </button>

                    {/* <button
                      title="Cancel Application"
                      onClick={() => handleCancelApplication(row)}
                    >
                      <FiXCircle />
                    </button> */}

                    <button
                      title={
                        row.isActive
                          ? "Deactivate Application"
                          : "Activate Application"
                      }
                      onClick={() => handleChangeStautsApplication(row)}
                    >
                      {row.isActive ? <FiUserX /> : <FiUserCheck />}
                    </button>
                  </>
                )}

                {row.paymentStatus === "Paid" && (
                  <button
                    title={
                      row.isActive
                        ? "Deactivate Application"
                        : "Activate Application"
                    }
                    onClick={() => handleChangeStautsApplication(row)}
                  >
                    {row.isActive ? <FiUserX /> : <FiUserCheck />}
                  </button>
                )}

                <button
                  title="View Receipt"
                  onClick={() => handleViewReceipt(row)}
                >
                  <FiPrinter />
                </button>
              </div>
            )}
          />
        </>
      )}

      {/* Pagination */}
      {filteredApplications.length > 0 && (
        <TablePagination
          page={safeCurrentPage}
          totalPages={totalPages}
          totalRecords={filteredApplications.length}
          pageSize={pageSize}
          onPrevious={() => setCurrentPage((prev) => prev - 1)}
          onNext={() => setCurrentPage((prev) => prev + 1)}
        />
      )}

      {/* Drawer */}
      <CommonDrawer
        show={showDrawer}
        onClose={handleCloseDrawer}
        title={
          formMode === "create"
            ? "New Monthly Application"
            : formMode === "edit"
              ? "Edit Application"
              : "Renew Application"
        }
        saveText={
          isCreatingOneOnOne || isEditingOneOnOne || isRenewOneOnOne
            ? formMode === "edit"
              ? "Updating..."
              : formMode === "renew"
                ? "Renewing..."
                : "Submitting..."
            : formMode === "edit"
              ? "Update Application"
              : formMode === "renew"
                ? "Renew Application"
                : "Submit Application"
        }
        onSave={handleSubmitApplication}
        disabled={isCreatingOneOnOne || isEditingOneOnOne || isRenewOneOnOne}
      >
        <h6 className="ui-common-drawer-section-title">
          Personal Training Details
        </h6>

        <FormField
          label="Player"
          name="playerId"
          type="search-select"
          value={oneOnOneForm.playerId}
          onChange={handleApplicationChange}
          options={playerOptions}
          placeholder="Search player..."
          required
          disabled={formMode === "edit" || formMode === "renew"}
        />

        <FormField
          label="Trainer"
          name="coachId"
          type="search-select"
          value={oneOnOneForm.coachId}
          onChange={handleApplicationChange}
          options={coachOptions}
          placeholder="Search trainer..."
          required
        />

        <FormField
          label="Focus Area"
          name="focusArea"
          type="textarea"
          rows={3}
          value={oneOnOneForm.focusArea}
          onChange={handleApplicationChange}
          placeholder="Enter focus area for this month's coaching"
          required
        />

        <Row>
          <Col md={6}>
            <FormField
              label="Payment Type"
              name="paymentType"
              type="select"
              value={oneOnOneForm.paymentType}
              onChange={handleApplicationChange}
              options={[
                {
                  label: "Select Payment Type",
                  value: "",
                },
                {
                  label: "Cash",
                  value: "Cash",
                },
                {
                  label: "UPI",
                  value: "UPI",
                },

                {
                  label: "Card",
                  value: "Card",
                },
              ]}
              required
            />
          </Col>

          <Col md={6}>
            <FormField
              label="Amount (₹)"
              name="amount"
              // type="number"
              value={oneOnOneForm.amount}
              onChange={handleApplicationChange}
              placeholder="Enter coaching amount"
              required
            />
          </Col>
        </Row>

        {/* <FormField
          label="Preferred Slot"
          name="preferredSlot"
          type="select"
          value={oneOnOneForm.preferredSlot}
          onChange={handleApplicationChange}
          options={[
            {
              label: "Select Preferred Slot",
              value: "",
            },
            ...PREFERRED_SLOTS.map((slot) => ({
              label: slot,
              value: slot,
            })),
          ]}
          required
        /> */}

        <FormField
          label="Preferred Slot"
          name="preferredSlot"
          value={oneOnOneForm.preferredSlot}
          onChange={handleApplicationChange}
          placeholder="e.g. 05:00 AM - 05:30 AM, 06:00 PM - 06:30 PM"
          required
        />

        <FormField
          label="Remarks"
          name="remarks"
          type="textarea"
          rows={3}
          value={oneOnOneForm.remarks}
          onChange={handleApplicationChange}
          placeholder="Enter remarks (if any)"
        />
      </CommonDrawer>

      <CommonDrawer
        show={showReceiptDrawer}
        onClose={handleCloseReceipt}
        title="Personal Training Receipt"
        onPrint={handlePrint}
        printText="Print"
        onDownload={handleDownloadPDF}
        downloadText="Download"
      >
        <div className="fee-receipt" ref={oneOnOneReceiptRef}>
          {/* Header */}
          <div className="fee-receipt-header-brand">
            <img src={logoImg} alt="KK Global Logo" className="receipt-logo" />

            <div className="fee-receipt-brand-info">
              <h5 className="fee-receipt-title">
                <span className="fee-brand-primary">KK Global</span>{" "}
                <span className="fee-brand-secondary">Cricket Academy</span>
              </h5>

              <p className="fee-receipt-location">Vijayawada, Andhra Pradesh</p>
            </div>
          </div>

          <div className="fee-receipt-details-card">
            <div className="fee-receipt-row">
              <span className="fee-receipt-row-span">Application No</span>
              <span className="fee-receipt-row-no">
                {selectedReceipt?.applicationNo || "-"}
              </span>
            </div>

            <div className="fee-receipt-row">
              <span className="fee-receipt-row-span">Player</span>
              <span className="fee-receipt-row-no">
                {selectedReceipt?.studentName || "-"}
              </span>
            </div>

            <div className="fee-receipt-row">
              <span className="fee-receipt-row-span">Trainer</span>
              <span className="fee-receipt-row-no">
                {selectedReceipt?.trainerName || "-"}
              </span>
            </div>

            <div className="fee-receipt-row">
              <span className="fee-receipt-row-span">Focus Area</span>
              <span className="fee-receipt-row-no">
                {selectedReceipt?.focusArea || "-"}
              </span>
            </div>

            <div className="fee-receipt-row">
              <span className="fee-receipt-row-span">Preferred Slot</span>
              <span className="fee-receipt-row-no">
                {selectedReceipt?.preferredSlot || "-"}
              </span>
            </div>

            <div className="fee-receipt-row">
              <span className="fee-receipt-row-span">Date</span>
              <span className="fee-receipt-row-no">
                {selectedReceipt?.date || "-"}
              </span>
            </div>

            <div className="fee-receipt-row">
              <span className="fee-receipt-row-span">Payment Type</span>
              <span className="fee-receipt-row-no">
                {selectedReceipt?.paymentType || "-"}
              </span>
            </div>

            <div className="fee-receipt-row">
              <span className="fee-receipt-row-span">Payment Status</span>
              <span className="fee-receipt-row-no">
                {selectedReceipt?.paymentStatus || "-"}
              </span>
            </div>
          </div>

          <div className="fee-receipt-amount-box">
            <span>
              {selectedReceipt?.paymentStatus === "Paid"
                ? "Amount Paid"
                : "Amount Due"}
            </span>
            <h3>
              ₹{Number(selectedReceipt?.amount || 0).toLocaleString("en-IN")}
            </h3>
          </div>

          <div className="fee-receipt-footer">
            <p>Thank you for choosing KK Global Cricket Academy.</p>
            <small>This is a computer generated receipt.</small>
          </div>
        </div>
      </CommonDrawer>

      <ConfirmDialog
        show={showConfirm}
        onClose={() => setShowConfirm(false)}
        // onConfirm={handleConfirmAction}
        onConfirm={handleStatusUpdate}
        title={
          selectedApplication?.isActive
            ? "Deactivate Application"
            : "Activate Application"
        }
        message={
          selectedApplication?.isActive
            ? "Are you sure you want to deactivate this personal training application?"
            : "Are you sure you want to activate this personal training application?"
        }
        confirmText={
          isStatusUpdating
            ? "Updating..."
            : selectedApplication?.isActive
              ? "Deactivate"
              : "Activate"
        }
        disabled={isStatusUpdating}
      />
    </div>
  );
};

export default OneOnOne;
