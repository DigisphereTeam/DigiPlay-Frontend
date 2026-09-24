import { useEffect, useCallback, useMemo, useState, useRef } from "react";
import { Row, Col, Button } from "react-bootstrap";
import { useReactToPrint } from "react-to-print";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

import {
  FiMapPin,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiPlus,
  //   FiEye,
  FiPrinter,
  FiXCircle,
  FiEdit2,
} from "react-icons/fi";

import {
  createGroundBooking,
  getGroundBookings,
  updateGroundBookingStatus,
  updateGroundBooking,
} from "../../services/groundBookingService";
import { initialsFromName } from "../../utils/initialsFromName";

import {
  canCreate,
  canEdit,
  canApproveBooking,
  canCancelBooking,
} from "../../utils/permissions";

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
import DescriptionCell from "../../components/ui/DescriptionCell/DescriptionCell.jsx";
import GroundBookingCalendar from "../../components/ui/GroundBookingCalendar/GroundBookingCalendar";

const GroundBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [statistics, setStatistics] = useState({});

  const emptyBooking = {
    customerName: "",
    customerPhone: "",
    // ground: "Ground A",
    matchType: "",
    date: "",
    timeSlot: "",
    paymentType: "",
    totalAmount: "",
    advancePaid: "",
    remainingAmount: "",
    remarks: "",
  };

  const [booking, setBooking] = useState(emptyBooking);

  const [editId, setEditId] = useState(null);
  // const [isEditMode, setIsEditMode] = useState(false);

  const [showDrawer, setShowDrawer] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [selectedBooking, setSelectedBooking] = useState(null);

  const [showCancelDrawer, setShowCancelDrawer] = useState(false);
  const [cancelRemarks, setCancelRemarks] = useState("");

  // Print// download ReceiptDrawer
  const [showReceiptDrawer, setShowReceiptDrawer] = useState(false);
  const bookingReceiptRef = useRef(null);

  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  //loading
  const [isBookingsLoading, setIsBookingsLoading] = useState(true);
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const [isUpdatingBooking, setIsUpdatingBooking] = useState(false);
  const [isCancellingBooking, setIsCancellingBooking] = useState(false);
  const [isConfirmingBooking, setIsConfirmingBooking] = useState(false);

  const pageSize = 5;

  const handleBookingChange = (e) => {
    const { name, value } = e.target;

    setBooking((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const columns = useMemo(
    () => [
      {
        header: "Customer",
        accessor: "customerName",

        cell: (row) => (
          <div className="common-management-name-cell">
            <div className="common-management-avatar">
              {initialsFromName(row.customerName)}
            </div>

            <div>
              <h6
                className="common-management-table-name"
                title={row.customerName || "-"}
              >
                {row.customerName || "-"}
              </h6>
              <span>{row.bookingNo || "-"}</span>
            </div>
          </div>
        ),
      },

      {
        header: "Phone",
        accessor: "customerPhone",
      },

      {
        header: "Date",
        accessor: "date",
      },

      {
        header: "Match Type",
        accessor: "matchType",
      },

      {
        header: "Slot",
        accessor: "timeSlot",
      },

      {
        header: "Payment Type",
        accessor: "paymentType",
      },

      {
        header: "Total",
        accessor: "totalAmount",

        cell: (row) => `₹${row.totalAmount}`,
      },

      {
        header: "Advance",
        accessor: "advancePaid",

        cell: (row) => `₹${row.advancePaid}`,
      },

      {
        header: "Remaining",
        accessor: "remainingAmount",

        cell: (row) => `₹${row.remainingAmount}`,
      },

      {
        header: "Remarks",
        accessor: "remarks",
        // cell: (row) => row.remarks?.trim() || "-",
        cell: (row) => <DescriptionCell text={row.remarks?.trim() || "-"} />,
      },

      {
        header: "Status",
        accessor: "status",

        cell: (row) => (
          <span
            className={
              row.status === "Confirmed"
                ? "common-management-table-status-success"
                : row.status === "Pending"
                  ? "common-management-table-status-warning"
                  : row.status === "Cancelled"
                    ? "common-management-table-status-danger"
                    : "common-management-table-status-success"
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
  const handleAddBooking = () => {
    setBooking({ ...emptyBooking });

    setEditId(null);
    // setIsEditMode(false);
    setSelectedBooking(null);
    setShowDrawer(true);
  };

  const handleEditBooking = (row) => {
    setSelectedBooking(row);

    setBooking({
      customerName: row.customerName || "",
      customerPhone: row.customerPhone || "",
      matchType: row.matchType || "",
      date: row.date || "",
      timeSlot: row.timeSlot || "",
      paymentType: row.paymentType || "",
      totalAmount: row.totalAmount || "",
      advancePaid: row.advancePaid || "",
      remainingAmount: row.remainingAmount || 0,
      remarks: row.remarks || "",
    });

    setEditId(row.bookingId);
    // setIsEditMode(true);
    setShowDrawer(true);
  };

  // Close Drawer
  const handleCloseDrawer = () => {
    setShowDrawer(false);

    setEditId(null);
    // setIsEditMode(false);
    setSelectedBooking(null);
    setBooking({ ...emptyBooking });
  };

  const fetchBookings = useCallback(async () => {
    try {
      const response = await getGroundBookings();

      if (response.statusCode === 200) {
        setStatistics(response.data.statistics || {});

        const formattedBookings = (response.data.bookings || []).map(
          (booking) => ({
            bookingId: booking.booking_id,
            bookingNo: booking.booking_code,
            customerName: booking.customer_name || "-",
            customerPhone: booking.customer_phone || "-",
            matchType: booking.purpose || "-",
            date: booking.booking_date || "-",
            timeSlot: booking.time_slot || "-",
            paymentType: booking.payment_type || "-",
            totalAmount: Number(booking.total_amount) || 0,
            advancePaid: Number(booking.advance_paid) || 0,
            remainingAmount: Number(booking.remaining_amount) || 0,
            status: booking.status || "-",
            remarks: booking.remarks || "-",
          }),
        );
        setBookings(formattedBookings);
      } else {
        // This will handle any 2xx response that is not 201
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Ground Booking Error:", error);
      toast.error(error.response?.data?.message);
    }
  }, []);

  useEffect(() => {
    const loadBookings = async () => {
      setIsBookingsLoading(true);

      try {
        await fetchBookings();
      } finally {
        setIsBookingsLoading(false);
      }
    };

    loadBookings();
  }, [fetchBookings]);

  const handleSaveGroundBooking = async (e) => {
    e.preventDefault();

    if (
      !booking.customerName ||
      !booking.customerPhone ||
      !booking.matchType ||
      !booking.date ||
      !booking.timeSlot ||
      !booking.paymentType ||
      !booking.totalAmount ||
      !booking.advancePaid
    ) {
      toast.error("Please fill required details");
      return;
    }

    const totalAmount = Number(
      String(booking.totalAmount).replace(/[^0-9.]/g, ""),
    );

    const advancePaid = Number(
      String(booking.advancePaid).replace(/[^0-9.]/g, ""),
    );

    const payload = {
      customer_name: booking.customerName,
      customer_phone: booking.customerPhone,
      booking_date: booking.date,
      time_slot: booking.timeSlot,
      payment_type: booking.paymentType,
      total_amount: totalAmount,
      advance_paid: advancePaid,
      purpose: booking.matchType,
      remarks: booking.remarks || "",
    };

    if (editId) {
      payload.remaining_amount = Number(
        String(booking.remainingAmount).replace(/[^0-9.]/g, ""),
      );
      await handleUpdateGroundBooking(payload);
    } else {
      await handleCreateGroundBooking(payload);
    }
  };

  const handleCreateGroundBooking = async (payload) => {
    setIsCreatingBooking(true);

    try {
      const response = await createGroundBooking(payload);

      if (response.statusCode === 201) {
        toast.success(response.message);

        await fetchBookings();
        handleCloseDrawer();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Create Ground Booking Error:", error);

      toast.error(error.response?.data?.message);
    } finally {
      setIsCreatingBooking(false);
    }
  };

  const handleUpdateGroundBooking = async (payload) => {
    if (!editId) return;

    setIsUpdatingBooking(true);
    try {
      const response = await updateGroundBooking(editId, payload);

      if (response.statusCode === 200) {
        toast.success(response.message);

        await fetchBookings();
        handleCloseDrawer();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Update Ground Booking Error:", error);

      toast.error(error.response?.data?.message);
    } finally {
      setIsUpdatingBooking(false);
    }
  };

  const handleCancelBooking = async (e) => {
    e.preventDefault();

    if (!cancelRemarks.trim()) {
      toast.error("Please enter cancellation remarks");
      return;
    }

    setIsCancellingBooking(true);

    try {
      const response = await updateGroundBookingStatus(
        selectedBooking.bookingId,
        {
          status: "Cancelled",
          remarks: cancelRemarks,
        },
      );

      if (response.statusCode === 200) {
        toast.success(response.message);

        await fetchBookings();

        setShowCancelDrawer(false);
        setSelectedBooking(null);
        setCancelRemarks("");
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Cancel Booking Error:", error);
      toast.error(error.response?.data?.message);
    } finally {
      setIsCancellingBooking(false);
    }
  };

  const handleUpdateStatus = async (bookingId, status) => {
    setIsConfirmingBooking(true);

    try {
      const response = await updateGroundBookingStatus(bookingId, {
        status,
      });

      if (response.statusCode === 200) {
        toast.success(response.message);

        await fetchBookings();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Update Status Error:", error);
      toast.error(error.response?.data?.message);
    } finally {
      setIsConfirmingBooking(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!selectedBooking) return;

    await handleUpdateStatus(selectedBooking.bookingId, "Confirmed");

    setShowConfirm(false);
    setSelectedBooking(null);
  };

  const handleClearFilters = () => {
    setSearch("");
    setActiveFilters({});
    setCurrentPage(1);
  };

  const handleViewReceipt = (booking) => {
    setSelectedBooking(booking);
    setShowReceiptDrawer(true);
  };

  const handlePrint = useReactToPrint({
    contentRef: bookingReceiptRef,
    documentTitle: `Ground_Booking_${selectedBooking?.bookingNo || "Receipt"}`,
  });

  // const handleDownloadPDF = async () => {
  //   if (!bookingReceiptRef.current || !selectedBooking) return;

  //   try {
  //     const canvas = await html2canvas(bookingReceiptRef.current, {
  //       scale: 4, // better quality
  //       useCORS: true,
  //       backgroundColor: "#fff",
  //       logging: false,
  //     });

  //     const imgData = canvas.toDataURL("image/png");

  //     const pdf = new jsPDF("p", "mm", "a4");

  //     const pageWidth = 210;
  //     const pageHeight = 297;

  //     const marginX = 15;
  //     const marginY = 15;

  //     const availableWidth = pageWidth - marginX * 2;
  //     const availableHeight = pageHeight - marginY * 2;

  //     const imageRatio = canvas.width / canvas.height;

  //     let imgWidth = availableWidth;
  //     let imgHeight = imgWidth / imageRatio;

  //     if (imgHeight > availableHeight) {
  //       imgHeight = availableHeight;
  //       imgWidth = imgHeight * imageRatio;
  //     }

  //     const x = (pageWidth - imgWidth) / 2;
  //     const y = (pageHeight - imgHeight) / 2;

  //     pdf.addImage(
  //       imgData,
  //       "PNG",
  //       x,
  //       y,
  //       imgWidth,
  //       imgHeight,
  //       undefined,
  //       "FAST",
  //     );

  //     pdf.save(`Ground_Booking_${selectedBooking?.bookingNo || "Receipt"}.pdf`);
  //   } catch (error) {
  //     console.error("Download PDF Error:", error);
  //     toast.error("Failed to download receipt");
  //   }
  // };

  const handleDownloadPDF = async () => {
    if (!bookingReceiptRef.current || !selectedBooking) return;

    try {
      const canvas = await html2canvas(bookingReceiptRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#fff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");

      const pageWidth = 210;
      const pageHeight = 297;

      // Receipt width on A4
      const receiptWidth = 160;

      const imageRatio = canvas.width / canvas.height;

      const receiptHeight = receiptWidth / imageRatio;

      // Center horizontally and vertically
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

      pdf.save(`Ground_Booking_${selectedBooking?.bookingNo || "Receipt"}.pdf`);
    } catch (error) {
      console.error("Download PDF Error:", error);
      toast.error("Failed to download receipt");
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((item) => {
      const searchValue = search.toLowerCase();

      const searchMatch =
        item.customerName?.toLowerCase().includes(searchValue) ||
        item.customerPhone?.includes(searchValue) ||
        item.bookingNo?.toLowerCase().includes(searchValue);

      const filterMatch = Object.entries(activeFilters).every(([key, val]) => {
        if (!val || val === "All") return true;

        return item[key] === val;
      });

      return searchMatch && filterMatch;
    });
  }, [bookings, search, activeFilters]);

  const statusOptions = useMemo(
    () => [...new Set(bookings.map((x) => x.status).filter(Boolean))],
    [bookings],
  );

  //pagination
  const totalPages = Math.ceil(filteredBookings.length / pageSize);

  const safeCurrentPage =
    currentPage > totalPages ? totalPages || 1 : currentPage;

  const paginatedBookings = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;

    return filteredBookings.slice(startIndex, startIndex + pageSize);
  }, [filteredBookings, safeCurrentPage]);

  return (
    <div className="common-management-main-section">
      <div className="dashboard-action-page-header">
        <div>
          <h2 className="all-dash-page-title">Ground Bookings</h2>
          <p className="all-dash-page-subtitle">
            {/* Manage ground availability, bookings and payments. */}
            Manage bookings, payments, availability, and upcoming reservations.
          </p>
        </div>

        {canCreate() && (
          <Button
            className="dashboard-action-primary-btn"
            onClick={handleAddBooking}
          >
            <FiPlus className="dashboard-action-primary-btn-icon" />
            New Booking
          </Button>
        )}
      </div>

      {/* Loader */}
      {isBookingsLoading ? (
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
                title="Total Bookings"
                value={statistics.total_bookings}
                icon={FiMapPin}
              />
            </Col>

            <Col md={3} xs={6}>
              <StatCard
                title="Confirmed"
                value={statistics.confirmed_bookings}
                icon={FiCheckCircle}
              />
            </Col>

            <Col md={3} xs={6}>
              <StatCard
                title="Pending Approval"
                value={statistics.pending_bookings}
                icon={FiClock}
              />
            </Col>

            <Col md={3} xs={6}>
              <StatCard
                title="Upcoming"
                value={statistics.upcoming_bookings}
                icon={FiCalendar}
              />
            </Col>
          </Row>

          {/* Booking Calendar */}
          <GroundBookingCalendar />

          {/* Toolbar */}
          <TableToolbar
            search={search}
            setSearch={(value) => {
              setSearch(value);
              setCurrentPage(1);
            }}
            filters={[
              // {
              //   key: "ground",
              //   label: "Ground",
              //   options: groundOptions,
              // },
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
            data={filteredBookings}
            columns={columns}
            exportFileName="ground-bookings"
          />

          {/* Table */}
          <Table
            columns={columns}
            data={paginatedBookings}
            rowKey="bookingId"
            actions={(row) => (
              <div className="common-management-action-buttons">
                <button
                  title="View Receipt"
                  onClick={() => handleViewReceipt(row)}
                >
                  <FiPrinter />
                </button>

                {canEdit() && (
                  <button
                    title="Edit Booking"
                    onClick={() => handleEditBooking(row)}
                  >
                    <FiEdit2 />
                  </button>
                )}

                {/* Approve / Cancel - Admin only */}
                {(canApproveBooking() || canCancelBooking()) && (
                  <>
                    {/* Pending Approval */}
                    {/* {row.status === "Pending" && ( */}
                    <>
                      {row.status === "Pending" && canApproveBooking() && (
                        <button
                          title="Approve Booking"
                          onClick={() => {
                            setSelectedBooking(row);
                            setShowConfirm(true);
                          }}
                        >
                          <FiCheckCircle />
                        </button>
                      )}

                      {/* Cancel - Hidden for Completed & Cancelled */}
                      {!["Completed", "Cancelled"].includes(row.status) &&
                        canCancelBooking() && (
                          <button
                            title="Cancel Booking"
                            onClick={() => {
                              setSelectedBooking(row);
                              setCancelRemarks("");
                              setShowCancelDrawer(true);
                            }}
                          >
                            <FiXCircle />
                          </button>
                        )}
                    </>
                    {/* )} */}

                    {/* {["Confirmed", "Cancelled"].includes(row.status) && (
                      <span>-</span>
                    )} */}
                  </>
                )}
              </div>
            )}
          />
        </>
      )}

      {/* Pagination */}
      {filteredBookings.length > 0 && (
        <TablePagination
          page={safeCurrentPage}
          totalPages={totalPages}
          totalRecords={filteredBookings.length}
          pageSize={pageSize}
          onPrevious={() => setCurrentPage((prev) => prev - 1)}
          onNext={() => setCurrentPage((prev) => prev + 1)}
        />
      )}

      {/* Drawer */}
      <CommonDrawer
        show={showDrawer}
        onClose={handleCloseDrawer}
        onSave={handleSaveGroundBooking}
        title={editId ? "Edit Ground Booking" : "New Ground Booking"}
        saveText={
          isCreatingBooking || isUpdatingBooking
            ? editId
              ? "Updating..."
              : "Saving..."
            : editId
              ? "Update Booking"
              : "Submit Booking"
        }
        disabled={isCreatingBooking || isUpdatingBooking}
      >
        <h6 className="ui-common-drawer-section-title">
          Ground Booking Details
        </h6>

        <FormField
          label="Customer Name"
          name="customerName"
          value={booking.customerName}
          onChange={handleBookingChange}
          required
        />

        <FormField
          label="Customer Phone"
          name="customerPhone"
          value={booking.customerPhone}
          onChange={handleBookingChange}
          required
        />

        {/* <FormField
          label="Ground"
          name="ground"
          type="select"
          value={booking.ground}
          onChange={handleBookingChange}
          options={GROUNDS.map((item) => ({
            label: item,
            value: item,
          }))}
          required
        /> */}

        <FormField
          label="Date"
          name="date"
          type="date"
          value={booking.date}
          onChange={handleBookingChange}
          required
          disabled={selectedBooking?.status === "Completed"}
        />

        <FormField
          label="Match Type"
          name="matchType"
          type="select"
          value={booking.matchType}
          onChange={handleBookingChange}
          options={[
            {
              label: "Select Match Type",
              value: "",
            },
            {
              label: "Regular",
              value: "Regular",
            },
            {
              label: "Corporate",
              value: "Corporate",
            },
          ]}
          required
          disabled={selectedBooking?.status === "Completed"}
        />

        <FormField
          label="Time Slot"
          name="timeSlot"
          type="select"
          value={booking.timeSlot}
          onChange={handleBookingChange}
          options={[
            {
              label: "Select Time Slot",
              value: "",
            },
            {
              label: "08:30 AM - 12:00 PM",
              value: "08:30 AM - 12:00 PM",
            },
            {
              label: "12:30 PM - 04:00 PM",
              value: "12:30 PM - 04:00 PM",
            },
            {
              label: "08:30 AM - 04:00 PM",
              value: "08:30 AM - 04:00 PM",
            },
          ]}
          required
          disabled={selectedBooking?.status === "Completed"}
        />

        <FormField
          label="Payment Type"
          name="paymentType"
          type="select"
          value={booking.paymentType}
          onChange={handleBookingChange}
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
          ]}
          required
        />

        <FormField
          label="Total Amount (₹)"
          name="totalAmount"
          // type="number"
          value={booking.totalAmount}
          onChange={handleBookingChange}
          required
        />

        <FormField
          label="Advance Paid (₹)"
          name="advancePaid"
          // type="number"
          value={booking.advancePaid}
          onChange={handleBookingChange}
          required
        />

        {editId && (
          <FormField
            label="Remaining Amount (₹)"
            name="remainingAmount"
            // type="number"
            value={booking.remainingAmount}
            onChange={handleBookingChange}
            required
          />
        )}

        <FormField
          label="Remarks"
          name="remarks"
          type="textarea"
          rows={3}
          value={booking.remarks}
          onChange={handleBookingChange}
          placeholder="Enter remarks (if any)"
        />
      </CommonDrawer>

      <CommonDrawer
        show={showCancelDrawer}
        onClose={() => {
          setShowCancelDrawer(false);
          setSelectedBooking(null);
          setCancelRemarks("");
        }}
        title="Cancel Ground Booking"
        saveText={isCancellingBooking ? "Cancelling..." : "Cancel Booking"}
        disabled={isCancellingBooking}
        onSave={handleCancelBooking}
      >
        <h6 className="ui-common-drawer-section-title">Booking Details</h6>

        <FormField
          label="Customer Name"
          value={selectedBooking?.customerName || ""}
          disabled
        />

        <FormField
          label="Customer Phone"
          value={selectedBooking?.customerPhone || ""}
          disabled
        />

        <FormField label="Date" value={selectedBooking?.date || ""} disabled />

        <FormField
          label="Time Slot"
          value={selectedBooking?.timeSlot || ""}
          disabled
        />

        <FormField
          label="Total Amount (₹)"
          value={`₹${selectedBooking?.totalAmount || 0}`}
          disabled
        />

        <FormField
          label="Advance Paid (₹)"
          value={`₹${selectedBooking?.advancePaid || 0}`}
          disabled
        />

        <FormField
          label="Remaining Amount (₹)"
          value={`₹${selectedBooking?.remainingAmount || 0}`}
          disabled
        />

        <FormField
          label="Cancellation Remarks"
          name="cancelRemarks"
          type="textarea"
          rows={4}
          value={cancelRemarks}
          onChange={(e) => setCancelRemarks(e.target.value)}
          placeholder="Enter cancellation reason"
          required
        />
      </CommonDrawer>

      <CommonDrawer
        show={showReceiptDrawer}
        onClose={() => {
          setShowReceiptDrawer(false);
          setSelectedBooking(null);
        }}
        title="Ground Booking Receipt"
        onPrint={handlePrint}
        printText="Print"
        onDownload={handleDownloadPDF}
        downloadText="Download"
      >
        <div className="ground-booking-receipt" ref={bookingReceiptRef}>
          {/* Header */}
          <div className="fee-receipt-header-brand">
            <img
              src={logoImg}
              alt="KK Global Cricket Academy"
              className="receipt-logo"
            />

            <div className="fee-receipt-brand-info">
              <h5 className="fee-receipt-title">
                <span className="fee-brand-primary">KK Global</span>{" "}
                <span className="fee-brand-secondary">Cricket Academy</span>
              </h5>

              <p className="fee-receipt-location">Vijayawada, Andhra Pradesh</p>
            </div>
          </div>

          {/* Receipt Title */}
          <div className="fee-receipt-amount-box">
            <span>Ground Booking Receipt</span>
            <h3>{selectedBooking?.bookingNo}</h3>
          </div>

          {/* Booking Details */}
          <div className="fee-receipt-details-card">
            <div className="fee-receipt-row">
              <span className="fee-receipt-row-span">Customer Name</span>
              <span className="fee-receipt-row-no">
                {selectedBooking?.customerName}
              </span>
            </div>

            <div className="fee-receipt-row">
              <span className="fee-receipt-row-span">Phone Number</span>
              <span className="fee-receipt-row-no">
                {selectedBooking?.customerPhone}
              </span>
            </div>

            <div className="fee-receipt-row">
              <span className="fee-receipt-row-span">Booking Date</span>
              <span className="fee-receipt-row-no">
                {selectedBooking?.date}
              </span>
            </div>

            <div className="fee-receipt-row">
              <span className="fee-receipt-row-span">Match Type</span>
              <span className="fee-receipt-row-no">
                {selectedBooking?.matchType || "-"}
              </span>
            </div>

            <div className="fee-receipt-row">
              <span className="fee-receipt-row-span">Time Slot</span>
              <span className="fee-receipt-row-no">
                {selectedBooking?.timeSlot}
              </span>
            </div>

            <div className="fee-receipt-row">
              <span className="fee-receipt-row-span">Payment Type</span>
              <span className="fee-receipt-row-no">
                {selectedBooking?.paymentType}
              </span>
            </div>

            <div className="fee-receipt-row">
              <span className="fee-receipt-row-span">Booking Status</span>
              <span className="fee-receipt-row-no">
                {selectedBooking?.status}
              </span>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="fee-receipt-details-card">
            <div className="fee-receipt-row">
              <span className="fee-receipt-row-span">Total Amount</span>
              <span className="fee-receipt-row-no">
                ₹
                {Number(selectedBooking?.totalAmount || 0).toLocaleString(
                  "en-IN",
                )}
              </span>
            </div>

            <div className="fee-receipt-row">
              <span className="fee-receipt-row-span">Advance Paid</span>
              <span className="fee-receipt-row-no">
                ₹
                {Number(selectedBooking?.advancePaid || 0).toLocaleString(
                  "en-IN",
                )}
              </span>
            </div>

            <div className="fee-receipt-row">
              <span className="fee-receipt-row-span">Remaining Amount</span>
              <span className="fee-receipt-row-no">
                ₹
                {Number(selectedBooking?.remainingAmount || 0).toLocaleString(
                  "en-IN",
                )}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="fee-receipt-footer">
            <p>Thank you for choosing KK Global Cricket Academy.</p>
            <small>This is a computer generated booking receipt.</small>
          </div>
        </div>
      </CommonDrawer>

      {/* Confirm */}
      <ConfirmDialog
        show={showConfirm}
        onClose={() => {
          setShowConfirm(false);
          setSelectedBooking(null);
        }}
        onConfirm={handleConfirmAction}
        title="Approve Booking"
        message="Are you sure you want to approve this ground booking?"
        confirmText={isConfirmingBooking ? "Approving..." : "Approve Booking"}
        disabled={isConfirmingBooking}
      />
    </div>
  );
};

export default GroundBooking;
