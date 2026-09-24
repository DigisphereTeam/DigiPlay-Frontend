import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

import logoImg from "../../assets/images/kk-logo.png";

import {
  // FiDollarSign,
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
  FiPlus,
  FiEye,
  // FiFileText,
  FiPrinter,
  FiEdit2,
} from "react-icons/fi";

import { MdCurrencyRupee } from "react-icons/md";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  createPlayerFee,
  getPlayerFees,
  getPlayerFeeStatistics,
  getPlayerFeeById,
  updatePlayerFee,
} from "../../services/playerFeeService";
import { getPlayersWithTrainers } from "../../services/playerService";

import { initialsFromName } from "../../utils/initialsFromName";
import { canCreate, canView, canEdit } from "../../utils/permissions";

import toast from "react-hot-toast";
import { ThreeDots } from "react-loader-spinner";

import StatCard from "../../components/ui/StatCard/StatCard";
import CommonDrawer from "../../components/ui/CommonDrawer/CommonDrawer";
import FormField from "../../components/ui/FormField/FormField";
import TableToolbar from "../../components/ui/TableToolbar/TableToolbar";
import Table from "../../components/ui/Table/Table";
import TablePagination from "../../components/ui/TablePagination/TablePagination";
import DescriptionCell from "../ui/DescriptionCell/DescriptionCell.jsx";

import "./Fees.css";

//styles for charts
const chartAxisStyle = {
  fontSize: 12,
  fill: "#64748B",
  fontWeight: 400,
};

const chartTooltipStyle = {
  backgroundColor: "#fff",
  border: "none",
  borderRadius: "12px",
  boxShadow: "0 8px 25px rgba(15,23,42,0.12)",
  padding: "10px 14px",
  fontSize: "12px",
  color: "#0E2B57",
};

const formatINR = (value) => {
  return `₹${value.toLocaleString("en-IN")}`;
};

const Fees = () => {
  const [records, setRecords] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [monthlyTrend, setMonthlyTrend] = useState([]);

  const emptyFee = {
    playerId: "",
    feeType: "",
    amount: "",
    hostelFee: "",
    paymentType: "",
    remarks: "",
  };

  const [feeForm, setFeeForm] = useState(emptyFee);

  // dropdown api state
  const [players, setPlayers] = useState([]);

  const [formMode, setFormMode] = useState(null);
  const [selectedFee, setSelectedFee] = useState(null);

  const [showDrawer, setShowDrawer] = useState(false);

  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const receiptRef = useRef(null);

  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  //loading
  const [isFeeLoading, setIsFeeLoading] = useState(true);
  const [isCreatingFee, setIsCreatingFee] = useState(false);
  const [isUpdatingFee, setIsUpdatingFee] = useState(false);
  const [isReceiptLoading, setIsReceiptLoading] = useState(false);

  const pageSize = 5;

  const navigate = useNavigate();

  const handleFeeChange = (e) => {
    const { name, value } = e.target;

    setFeeForm((prev) => ({
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
              <span>{row.admissionId || "-"}</span>
            </div>
          </div>
        ),
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

  // Open Add Drawer
  const handleAddFee = () => {
    setFeeForm({ ...emptyFee });
    setSelectedFee(null);
    setFormMode("create");
    setShowDrawer(true);
  };

  const handleEditFee = (row) => {
    setSelectedFee(row);

    setFeeForm({
      playerId: row.playerId || "",
      feeType: row.feeType || "",
      amount: row.amount || "",
      hostelFee: row.hostelFee || "",
      paymentType: row.paymentType || "",
      remarks: row.remarks || "",
    });

    setFormMode("edit");
    setShowDrawer(true);
  };

  // Close Drawer
  const handleCloseDrawer = () => {
    setShowDrawer(false);
    setFeeForm({ ...emptyFee });
    setSelectedFee(null);
    setFormMode(null);
  };

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const response = await getPlayersWithTrainers();

        if (response.statusCode === 200) {
          setPlayers(response.data.players);
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

  const fetchStatistics = useCallback(async () => {
    try {
      const response = await getPlayerFeeStatistics();

      if (response.statusCode === 200) {
        setStatistics(response.data.statistics || {});
        setMonthlyTrend(response.data.collection_summary || []);
      }
    } catch (error) {
      console.error("Fee Statistics Error:", error);
      toast.error(error.response?.data?.message);
    }
  }, []);

  const fetchFees = useCallback(async () => {
    try {
      const response = await getPlayerFees();

      if (response.statusCode === 200) {
        const formattedFees = (response.data || []).map((item) => ({
          feeId: item.fee_id,
          playerId: item.player_id,
          admissionId: item.admission_id,
          studentName: item.full_name || "-",
          feeType: item.fee_type || "-",
          amount: Number(item.amount) || 0,
          hostelFee: Number(item.hostel_fee) || 0,
          paymentType: item.payment_type || "-",
          paidDate: item.payment_date || "-",
          dueDate: item.due_date || "-",
          remarks: item.remarks || "-",
          status: item.status,
        }));

        setRecords(formattedFees);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Get Player Fees Error:", error);

      toast.error(error.response?.data?.message);
    }
  }, []);

  useEffect(() => {
    const loadFeesData = async () => {
      setIsFeeLoading(true);

      try {
        await Promise.all([fetchFees(), fetchStatistics()]);
      } finally {
        setIsFeeLoading(false);
      }
    };

    loadFeesData();
  }, [fetchFees, fetchStatistics]);

  const handleViewReceipt = async (feeId) => {
    if (!feeId) {
      toast.error("Invalid fee ID");
      return;
    }

    setIsReceiptLoading(true);
    try {
      const response = await getPlayerFeeById(feeId);

      if (response.statusCode === 200) {
        const feeData = response.data;

        setSelectedReceipt({
          feeId: feeData.fee_id,
          playerId: feeData.player_id,
          admissionId: feeData.admission_id,
          studentName: feeData.full_name,
          feeType: feeData.fee_type,
          amount: Number(feeData.amount),
          hostelFee: Number(feeData.hostel_fee) || 0,
          paymentType: feeData.payment_type,
          dueDate: feeData.due_date,
          paidDate: feeData.payment_date,
          remarks: feeData.remarks || "-",
          status: feeData.status,
        });
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Get Fee Detail Error:", error);

      toast.error(error.response?.data?.message);
    } finally {
      setIsReceiptLoading(false);
    }
  };

  const handleSubmitFee = async (e) => {
    e.preventDefault();

    const isCreate = formMode === "create";
    const isEdit = formMode === "edit";

    // Validation
    if (
      !feeForm.playerId ||
      !feeForm.feeType ||
      !feeForm.amount ||
      !feeForm.paymentType
    ) {
      toast.error("Please fill required details");
      return;
    }

    // Convert amount values
    const amount = Number(String(feeForm.amount).replace(/[^0-9.]/g, ""));

    const hostelFee =
      Number(String(feeForm.hostelFee || "").replace(/[^0-9.]/g, "")) || 0;

    // Common payload
    const payload = {
      fee_type: feeForm.feeType,
      amount: amount,
      hostel_fee: hostelFee,
      payment_type: feeForm.paymentType,
      remarks: feeForm.remarks || "",
    };

    // CREATE
    if (isCreate) {
      await handleCreateFee({
        player_id: Number(feeForm.playerId),
        ...payload,
      });

      return;
    }

    // EDIT
    if (isEdit) {
      await handleUpdateFee(payload);
      return;
    }
  };

  const handleCreateFee = async (payload) => {
    setIsCreatingFee(true);

    try {
      const response = await createPlayerFee(payload);

      if (response.statusCode === 201) {
        toast.success(response.message);

        await Promise.all([fetchFees(), fetchStatistics()]);

        handleCloseDrawer();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Create Fee Error:", error);

      toast.error(error.response?.data?.message || "Failed to create fee");
    } finally {
      setIsCreatingFee(false);
    }
  };

  const handleUpdateFee = async (payload) => {
    if (!selectedFee) return;

    setIsUpdatingFee(true);

    try {
      const response = await updatePlayerFee(selectedFee.feeId, payload);

      if (response.statusCode === 200) {
        toast.success(response.message);

        await Promise.all([fetchFees(), fetchStatistics()]);

        handleCloseDrawer();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Update Fee Error:", error);

      toast.error(error.response?.data?.message || "Failed to update fee");
    } finally {
      setIsUpdatingFee(false);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `Receipt_${selectedReceipt?.admissionId || "download"}`,
  });

  // const handleDownloadPDF = async () => {
  //   if (!receiptRef.current || !selectedReceipt) return;

  //   try {
  //     const canvas = await html2canvas(receiptRef.current, {
  //       scale: 3, // better quality
  //       useCORS: true,
  //       backgroundColor: "#fff",
  //       logging: false,
  //     });

  //     const imgData = canvas.toDataURL("image/png");

  //     const pdf = new jsPDF("p", "mm", "a4");

  //     // A4 size
  //     const pageWidth = 210;
  //     const pageHeight = 297;

  //     // PDF margins

  //     const marginX = 15;
  //     const marginY = 15;

  //     const availableWidth = pageWidth - marginX * 2;
  //     const availableHeight = pageHeight - marginY * 2;

  //     // Keep original receipt ratio
  //     const imageRatio = canvas.width / canvas.height;

  //     let imgWidth = availableWidth;
  //     let imgHeight = imgWidth / imageRatio;

  //     // If receipt is too tall, reduce it to fit one page
  //     if (imgHeight > availableHeight) {
  //       imgHeight = availableHeight;
  //       imgWidth = imgHeight * imageRatio;
  //     }

  //     // Center receipt on A4
  //     const x = (pageWidth - imgWidth) / 2;
  //     const y = (pageHeight - imgHeight) / 2;

  //     // Add receipt to PDF
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

  //     pdf.save(`Receipt_${selectedReceipt?.admissionId || "download"}.pdf`);
  //   } catch (error) {
  //     console.error("Download PDF Error:", error);
  //     toast.error("Failed to download receipt");
  //   }
  // };

  const handleDownloadPDF = async () => {
    if (!receiptRef.current || !selectedReceipt) return;

    try {
      const canvas = await html2canvas(receiptRef.current, {
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

      pdf.save(`Receipt_${selectedReceipt?.admissionId || "download"}.pdf`);
    } catch (error) {
      console.error("Download PDF Error:", error);
      toast.error("Failed to download receipt");
    }
  };

  const handleCloseReceipt = () => {
    setSelectedReceipt(null);
    setIsReceiptLoading(false);
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
        item.studentName?.toLowerCase().includes(searchValue) ||
        item.admissionId?.toLowerCase().includes(searchValue);
      //  ||
      // item.feeType?.toLowerCase().includes(searchValue);

      const filterMatch = Object.entries(activeFilters).every(([key, val]) => {
        if (!val || val === "All") return true;

        return item[key] === val;
      });

      return searchMatch && filterMatch;
    });
  }, [records, search, activeFilters]);

  const statusOptions = useMemo(
    () => [...new Set(records.map((x) => x.status).filter(Boolean))],
    [records],
  );

  const feeTypeOptions = useMemo(
    () => [...new Set(records.map((x) => x.feeType).filter(Boolean))],
    [records],
  );

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
          <h2 className="all-dash-page-title">Fee Renewals</h2>

          <p className="all-dash-page-subtitle">
            {/* Manage player fee, payments and receipts. */}
            Manage player fee collections, payments, pending amounts, and
            payment history.
          </p>
        </div>

        {canCreate() && (
          <Button
            className="dashboard-action-primary-btn"
            onClick={handleAddFee}
          >
            <FiPlus className="dashboard-action-primary-btn-icon" />
            Collect Fee
          </Button>
        )}
      </div>

      {isFeeLoading ? (
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
            {canEdit() && (
              <Col md={3} xs={6}>
                <StatCard
                  title="Total Collection"
                  value={statistics.total_collection}
                  icon={MdCurrencyRupee}
                />
              </Col>
            )}

            <Col md={3} xs={6}>
              <StatCard
                title="Paid Fee"
                value={statistics.paid_fees}
                icon={FiCheckCircle}
              />
            </Col>

            <Col md={3} xs={6}>
              <StatCard
                title="Pending Fee"
                value={statistics.pending_fees}
                icon={FiClock}
              />
            </Col>

            {canEdit() && (
              <Col md={3} xs={6}>
                <StatCard
                  title="This Month"
                  value={statistics.this_month_collection}
                  icon={FiTrendingUp}
                />
              </Col>
            )}
          </Row>

          {/* Collection Summary Chart */}
          {canEdit() && (
            <Row className="mt-2 mb-4">
              <Col>
                <Card className="dashboard-chart-card">
                  <Card.Body>
                    <h4 className="dashboard-chart-title">
                      Collection Summary
                    </h4>

                    <p className="dashboard-chart-subtitle">
                      Monthly fee collection trend
                    </p>

                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={monthlyTrend}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#E2E8F0"
                          vertical={false}
                        />

                        <XAxis
                          dataKey="month"
                          axisLine={false}
                          tickLine={false}
                          tick={chartAxisStyle}
                        />

                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={chartAxisStyle}
                          tickFormatter={(value) => `${value / 1000}k`}
                        />

                        <Tooltip
                          formatter={(value) => formatINR(value)}
                          contentStyle={chartTooltipStyle}
                        />

                        <Bar
                          dataKey="collected"
                          fill="#0E2B57"
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          {/* Toolbar */}
          <TableToolbar
            search={search}
            setSearch={(value) => {
              setSearch(value);
              setCurrentPage(1);
            }}
            filters={[
              {
                key: "feeType",
                label: "Fee Type",
                options: feeTypeOptions,
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
            data={filteredRecords}
            columns={columns}
            exportFileName="fee-records"
          />

          {/* Table */}
          <Table
            columns={columns}
            data={paginatedRecords}
            rowKey="feeId"
            actions={(row) => (
              <div className="common-management-action-buttons">
                {canView() && (
                  <>
                    <button
                      title="View Player"
                      onClick={() =>
                        navigate(`/management/fee-profile/${row.playerId}`)
                      }
                    >
                      <FiEye />
                    </button>

                    {canEdit() && (
                      <button
                        title="Edit Fee"
                        onClick={() => handleEditFee(row)}
                      >
                        <FiEdit2 />
                      </button>
                    )}

                    <button
                      title="View Receipt"
                      onClick={() => handleViewReceipt(row.feeId)}
                    >
                      <FiPrinter />
                    </button>
                  </>
                )}
              </div>
            )}
          />
        </>
      )}

      {/* Pagination */}
      {filteredRecords.length > 0 && (
        <TablePagination
          page={safeCurrentPage}
          totalPages={totalPages}
          totalRecords={filteredRecords.length}
          pageSize={pageSize}
          onPrevious={() => setCurrentPage((prev) => prev - 1)}
          onNext={() => setCurrentPage((prev) => prev + 1)}
        />
      )}

      {/* Collect Fee Drawer */}
      <CommonDrawer
        show={showDrawer}
        onClose={handleCloseDrawer}
        title={formMode === "edit" ? "Edit Fee Payment" : "Collect Fee Payment"}
        saveText={
          isCreatingFee || isUpdatingFee
            ? formMode === "edit"
              ? "Updating..."
              : "Collecting..."
            : formMode === "edit"
              ? "Update Payment"
              : "Collect Payment"
        }
        onSave={handleSubmitFee}
        disabled={isCreatingFee || isUpdatingFee}
      >
        <h6 className="ui-common-drawer-section-title">Fee Payment Details</h6>
        <FormField
          label="Player"
          name="playerId"
          type="search-select"
          value={feeForm.playerId}
          onChange={handleFeeChange}
          options={playerOptions}
          placeholder="Search player..."
          required
          disabled={formMode === "edit"}
        />

        <FormField
          label="Fee Type"
          name="feeType"
          type="select"
          value={feeForm.feeType}
          onChange={handleFeeChange}
          options={[
            {
              label: "Select Fee Type",
              value: "",
            },
            {
              label: "Regular Fee",
              value: "Regular Fee",
            },
          ]}
          required
        />

        <Row>
          <Col md={6}>
            <FormField
              label="Regular Fee (₹)"
              name="amount"
              // type="number"
              value={feeForm.amount}
              onChange={handleFeeChange}
              placeholder="Enter regular fee"
              required
            />
          </Col>

          <Col md={6}>
            <FormField
              label="Hostel Fee (₹)"
              name="hostelFee"
              value={feeForm.hostelFee}
              onChange={handleFeeChange}
              placeholder="Enter hostel fee"
            />
          </Col>
        </Row>

        <FormField
          label="Payment Type"
          name="paymentType"
          type="select"
          value={feeForm.paymentType}
          onChange={handleFeeChange}
          options={[
            {
              label: "Select Payment Type",
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

            // {
            //   label: "Card",
            //   value: "Card",
            // },

            // {
            //   label: "Bank Transfer",
            //   value: "Bank Transfer",
            // },
          ]}
          required
        />

        <FormField
          label="Remarks"
          name="remarks"
          type="textarea"
          rows={3}
          value={feeForm.remarks}
          onChange={handleFeeChange}
          placeholder="Enter remarks (if any)"
        />
      </CommonDrawer>

      {/* Receipt Drawer */}
      <CommonDrawer
        show={!!selectedReceipt || isReceiptLoading}
        onClose={handleCloseReceipt}
        title="Payment Receipt"
        onPrint={handlePrint}
        printText="Print"
        onDownload={handleDownloadPDF}
        downloadText="Download"
      >
        {isReceiptLoading ? (
          <div className="ui-common-loader">
            <ThreeDots
              height="20"
              width="50"
              color="#057DCD"
              ariaLabel="loading"
            />
          </div>
        ) : (
          selectedReceipt && (
            <div className="fee-receipt" ref={receiptRef}>
              <div className="fee-receipt-header-brand">
                <img
                  src={logoImg}
                  alt="KK Global Logo"
                  className="receipt-logo"
                />

                <div className="fee-receipt-brand-info">
                  <h5 className="fee-receipt-title">
                    <span className="fee-brand-primary">KK Global</span>{" "}
                    <span className="fee-brand-secondary">Cricket Academy</span>
                  </h5>

                  <p className="fee-receipt-location">
                    Vijayawada, Andhra Pradesh
                  </p>
                </div>
              </div>

              {/* Receipt Details */}
              <div className="fee-receipt-details-card">
                <div className="fee-receipt-row">
                  <span className="fee-receipt-row-span">Admission No</span>
                  <span className="fee-receipt-row-no">
                    {selectedReceipt.admissionId}
                  </span>
                </div>

                <div className="fee-receipt-row">
                  <span className="fee-receipt-row-span">Player</span>
                  <span className="fee-receipt-row-no">
                    {selectedReceipt.studentName}
                  </span>
                </div>

                <div className="fee-receipt-row">
                  <span className="fee-receipt-row-span">Fee Type</span>
                  <span className="fee-receipt-row-no">
                    {selectedReceipt.feeType}
                  </span>
                </div>

                <div className="fee-receipt-row">
                  <span className="fee-receipt-row-span">Regular Fee</span>
                  <span className="fee-receipt-row-no">
                    ₹{Number(selectedReceipt.amount).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="fee-receipt-row">
                  <span className="fee-receipt-row-span">Hostel Fee</span>
                  <span className="fee-receipt-row-no">
                    {selectedReceipt.hostelFee
                      ? `₹${Number(selectedReceipt.hostelFee).toLocaleString("en-IN")}`
                      : "-"}
                  </span>
                </div>

                <div className="fee-receipt-row">
                  <span className="fee-receipt-row-span">Payment Type</span>
                  <span className="fee-receipt-row-no">
                    {selectedReceipt.paymentType}
                  </span>
                </div>

                <div className="fee-receipt-row">
                  <span className="fee-receipt-row-span">Payment Date</span>
                  <span className="fee-receipt-row-no">
                    {selectedReceipt.paidDate}
                  </span>
                </div>

                <div className="fee-receipt-row">
                  <span className="fee-receipt-row-span">Status</span>
                  <span className="fee-receipt-row-no">
                    {selectedReceipt.status}
                  </span>
                </div>
              </div>

              <div className="fee-receipt-amount-box">
                <span>Total Amount Paid</span>
                <h3>
                  ₹
                  {(
                    Number(selectedReceipt.amount || 0) +
                    Number(selectedReceipt.hostelFee || 0)
                  ).toLocaleString("en-IN")}
                </h3>
              </div>

              <div className="fee-receipt-footer">
                <p>Thank you for your payment.</p>
                <small>This is a computer generated receipt.</small>
              </div>
            </div>
          )
        )}
      </CommonDrawer>
    </div>
  );
};

export default Fees;
