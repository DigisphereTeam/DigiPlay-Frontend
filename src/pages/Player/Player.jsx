import { useEffect, useCallback, useMemo, useState, useRef } from "react";
import { Row, Col, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

import {
  FiUsers,
  FiUserCheck,
  FiUserX,
  // FiDollarSign,
  FiEye,
  FiEdit2,
  // FiTrash2,
  FiPlus,
  // FiClock,
  FiCreditCard,
  FiPrinter,
} from "react-icons/fi";

import { MdCurrencyRupee } from "react-icons/md";

import {
  getPlayers,
  createPlayer,
  updatePlayer,
  // deletePlayer,
  updatePlayerStatus,
} from "../../services/playerService";

import { initialsFromName } from "../../utils/initialsFromName";
import {
  canCreate,
  canEdit,
  // canDelete,
  canView,
} from "../../utils/permissions";

import toast from "react-hot-toast";
import { ThreeDots } from "react-loader-spinner";

// img
import logoImg from "../../assets/images/kk-logo.png";

import StatCard from "../../components/ui/StatCard/StatCard.jsx";
import CommonDrawer from "../../components//ui/CommonDrawer/CommonDrawer.jsx";
import ConfirmDialog from "../../components//ui/ConfirmDialog/ConfirmDialog.jsx";
import FormField from "../../components//ui/FormField/FormField.jsx";
import TableToolbar from "../../components//ui/TableToolbar/TableToolbar.jsx";
import Table from "../../components//ui/Table/Table.jsx";
import TablePagination from "../../components//ui/TablePagination/TablePagination.jsx";
import DescriptionCell from "../../components/ui/DescriptionCell/DescriptionCell.jsx";

import "./Player.css";

const Player = () => {
  const [players, setPlayers] = useState([]);
  const [statistics, setStatistics] = useState({});

  const emptyPlayer = {
    full_name: "",
    gender: "Male",
    age: "",
    date_of_birth: "",
    admission_date: "",
    phone_number: "",
    // email: "",
    address: "",
    // school: "",

    admission_fee: "",
    regular_fee: "",
    hostel_fee: "",
    // fee_type: "",
    payment_type: "",

    father_name: "",
    father_phone: "",
    father_occupation: "",

    mother_name: "",
    mother_phone: "",

    contact_name: "",
    relation: "",
    contact_phone: "",

    blood_group: "O+",
    // allergies: "",
    remarks: "",
    document_urls: [],

    // height: "",
    // weight: "",
  };
  const [player, setPlayer] = useState(emptyPlayer);

  const [editId, setEditId] = useState(null);

  const [showDrawer, setShowDrawer] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [deleteId, setDeleteId] = useState(null);
  const [drawerTitle, setDrawerTitle] = useState("Add New Player");

  const [selectedPlayer, setSelectedPlayer] = useState(null);

  // Print// download ReceiptDrawer
  const [showReceiptDrawer, setShowReceiptDrawer] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const playerReceiptRef = useRef(null);

  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  //loading
  const [isPlayersLoading, setIsPlayersLoading] = useState(true);
  const [isCreatingPlayer, setIsCreatingPlayer] = useState(false);
  const [isUpdatingPlayer, setIsUpdatingPlayer] = useState(false);
  const [isDeletingPlayer, setIsDeletingPlayer] = useState(false);

  const pageSize = 5;

  const navigate = useNavigate();

  const handlePlayerChange = (e) => {
    const { name, value, type, files } = e.target;

    setPlayer((prev) => ({
      ...prev,
      [name]: type === "file" ? Array.from(files) : value,
    }));
  };

  const columns = useMemo(
    () => [
      {
        header: "Player",
        accessor: "full_name",
        cell: (row) => (
          <div className="common-management-name-cell">
            <div className="common-management-avatar">
              {initialsFromName(row.full_name)}
            </div>

            <div>
              <h6
                className="common-management-table-name"
                title={row.full_name || "-"}
              >
                {row.full_name || "-"}
              </h6>
              <span>{row.admission_id || "-"}</span>
            </div>
          </div>
        ),
      },

      {
        header: "Gender",
        accessor: "gender",
        cell: (row) => row.gender || "-",
      },
      {
        header: "Age",
        accessor: "age",
        cell: (row) => row.age || "-",
      },
      {
        header: "Admission Date",
        accessor: "admission_date",
        cell: (row) => row.admission_date || "-",
      },
      {
        header: "Phone",
        accessor: "phone_number",
        cell: (row) => row.phone_number || "-",
      },

      // {
      //   header: "Fee Type",
      //   accessor: "fee_type",
      //   cell: (row) => row.fee_type || "-",
      // },

      {
        header: "Admission Fee",
        accessor: "admission_fee",
        cell: (row) =>
          row.admission_fee
            ? `₹${Number(row.admission_fee).toLocaleString("en-IN")}`
            : "-",
      },

      {
        header: "Regular Fee",
        accessor: "regular_fee",
        cell: (row) =>
          row.regular_fee
            ? `₹${Number(row.regular_fee).toLocaleString("en-IN")}`
            : "-",
      },

      {
        header: "Hostel Fee",
        accessor: "hostel_fee",
        cell: (row) =>
          row.hostel_fee
            ? `₹${Number(row.hostel_fee).toLocaleString("en-IN")}`
            : "-",
      },

      {
        header: "Payment Type",
        accessor: "payment_type",
        cell: (row) => row.payment_type || "-",
      },

      {
        header: "Remarks",
        accessor: "remarks",
        // cell: (row) => (
        //   <span title={row.remarks || ""}>{row.remarks || "-"}</span>
        // ),
        cell: (row) => <DescriptionCell text={row.remarks || "-"} />,
      },
      {
        header: "Fee Status",
        accessor: "fee_status",
        cell: (row) => (
          <span
            className={
              row.fee_status === "Paid"
                ? "common-management-table-status-success"
                : "common-management-table-status-warning"
            }
          >
            {row.fee_status || "-"}
          </span>
        ),
      },
      {
        header: "Status",
        accessor: "is_active",
        cell: (row) => (
          <span
            className={
              row.is_active
                ? "common-management-table-status-success"
                : "common-management-table-status-danger"
            }
          >
            {row.is_active ? "Active" : "Inactive"}
          </span>
        ),
      },
    ],
    [],
  );

  // Open Add Drawer
  const handleOpenAddPlayer = () => {
    setPlayer({ ...emptyPlayer });
    setEditId(null);
    setDrawerTitle("Add New Player");
    setShowDrawer(true);
  };

  // Open Edit Drawer
  const handleOpenEditPlayer = (row) => {
    setPlayer({ ...row });
    setEditId(row.player_id);
    setDrawerTitle("Edit Player");
    setShowDrawer(true);
  };

  // Close Drawer
  const handleCloseDrawer = () => {
    setShowDrawer(false);
    setEditId(null);
    setPlayer({ ...emptyPlayer });
  };

  const fetchPlayers = useCallback(async () => {
    try {
      const response = await getPlayers();

      if (response.statusCode === 200) {
        setStatistics(response.data.statistics || {});
        setPlayers(response.data.players || []);
      } else {
        // This will handle any 2xx response that is not 201
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Player Error:", error);
      toast.error(error.response?.data?.message);
    }
  }, []);

  useEffect(() => {
    const loadPlayers = async () => {
      setIsPlayersLoading(true);

      try {
        await fetchPlayers();
      } finally {
        setIsPlayersLoading(false);
      }
    };

    loadPlayers();
  }, [fetchPlayers]);

  const handleCreatePlayer = async (e) => {
    e.preventDefault();

    if (editId) {
      await handleUpdatePlayer();
      return;
    }

    setIsCreatingPlayer(true);
    try {
      const response = await createPlayer(player);

      if (response.statusCode === 201) {
        toast.success(response.message);

        // refresh table after adding
        await fetchPlayers();

        handleCloseDrawer();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Create Player Error:", error);

      toast.error(error.response?.data?.message);
    } finally {
      setIsCreatingPlayer(false);
    }
  };

  const handleUpdatePlayer = async () => {
    setIsUpdatingPlayer(true);

    try {
      const response = await updatePlayer(editId, player);

      if (response.statusCode === 200) {
        toast.success(response.message);

        await fetchPlayers();

        handleCloseDrawer();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Update Player Error:", error);

      toast.error(error.response?.data?.message);
    } finally {
      setIsUpdatingPlayer(false);
    }
  };

  // Open Delete Confirmation
  const handleOpenDelete = (row) => {
    setSelectedPlayer(row);
    setDeleteId(row.player_id);
    setShowConfirm(true);
  };

  // Delete Student
  // const handleDeletePlayer = async () => {
  //   setIsDeletingPlayer(true);

  //   try {
  //     const response = await deletePlayer(deleteId);

  //     if (response.statusCode === 200) {
  //       toast.success(response.message);

  //       await fetchPlayers();

  //       setDeleteId(null);
  //       setShowConfirm(false);
  //     } else {
  //       toast.error(response.message);
  //     }
  //   } catch (error) {
  //     console.error("Delete Player Error:", error);

  //     toast.error(error.response?.data?.message);
  //   } finally {
  //     setIsDeletingPlayer(false);
  //   }
  // };

  const handleUpdatePlayerStatus = async () => {
    if (!deleteId) return;

    setIsDeletingPlayer(true);

    try {
      const response = await updatePlayerStatus(
        deleteId,
        !selectedPlayer.is_active,
      );

      if (response.statusCode === 200) {
        toast.success(response.message);

        await fetchPlayers();
        setShowConfirm(false);
        setDeleteId(null);
        setSelectedPlayer(null);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Status Update Error:", error);

      toast.error(error.response?.data?.message);
    } finally {
      setIsDeletingPlayer(false);
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
    contentRef: playerReceiptRef,
    documentTitle: `Player_${selectedReceipt?.admission_id || "Receipt"}`,
  });

  const handleDownloadPDF = async () => {
    if (!playerReceiptRef.current || !selectedReceipt) return;

    try {
      const canvas = await html2canvas(playerReceiptRef.current, {
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

      pdf.save(`Player_${selectedReceipt?.admission_id || "Receipt"}.pdf`);
    } catch (error) {
      console.error("Download PDF Error:", error);
      toast.error("Failed to download receipt");
    }
  };

  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      const searchValue = search.toLowerCase();

      const searchMatch =
        player.full_name?.toLowerCase().includes(searchValue) ||
        player.admission_id?.toLowerCase().includes(searchValue) ||
        player.phone_number?.toLowerCase().includes(searchValue);

      const filterMatch = Object.entries(activeFilters).every(
        ([key, value]) => {
          if (!value || value === "All") return true;

          return player[key] === value;
        },
      );

      return searchMatch && filterMatch;
    });
  }, [players, search, activeFilters]);

  const statusOptions = useMemo(
    () => [...new Set(players.map((player) => player.status).filter(Boolean))],
    [players],
  );

  const totalPages = Math.ceil(filteredPlayers.length / pageSize);

  const safeCurrentPage =
    currentPage > totalPages ? totalPages || 1 : currentPage;

  const paginatedPlayers = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;

    return filteredPlayers.slice(startIndex, startIndex + pageSize);
  }, [filteredPlayers, safeCurrentPage]);

  return (
    <div className="common-management-main-section">
      <div className="dashboard-action-page-header">
        <div>
          <h2 className="all-dash-page-title">Player Management</h2>

          <p className="all-dash-page-subtitle">
            {/* Manage player admissions and academy records. */}
            Manage player profiles, fees, payments, and active status in one
            place.
          </p>
        </div>

        {canCreate() && (
          <Button
            className="dashboard-action-primary-btn"
            onClick={handleOpenAddPlayer}
          >
            <FiPlus className="dashboard-action-primary-btn-icon" />
            Add Player
          </Button>
        )}
      </div>

      {/* Loader */}
      {isPlayersLoading ? (
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
          {/* STAT CARD ROW 1 */}
          <Row className="g-3 mb-4">
            <Col md={3} xs={6}>
              <StatCard
                title="Total Players"
                value={statistics.total_players || 0}
                icon={FiUsers}
              />
            </Col>

            <Col md={3} xs={6}>
              <StatCard
                title="Active"
                value={statistics.active_players || 0}
                icon={FiUserCheck}
              />
            </Col>

            <Col md={3} xs={6}>
              <StatCard
                title="Inactive"
                value={statistics.inactive_players || 0}
                icon={FiUserX}
              />
            </Col>

            <Col md={3} xs={6}>
              <StatCard
                title="Pending Fees"
                value={statistics.pending_fees || 0}
                icon={FiCreditCard}
              />
            </Col>
          </Row>

          {/* STAT CARD ROW 2 */}
          {canEdit() && (
            <Row className="g-3 mb-4">
              <Col md={3} xs={6}>
                <StatCard
                  title="Admission Fee"
                  value={statistics.admission_fee || 0}
                  icon={MdCurrencyRupee}
                />
              </Col>

              <Col md={3} xs={6}>
                <StatCard
                  title="Regular Fee"
                  value={statistics.regular_fee || 0}
                  icon={MdCurrencyRupee}
                />
              </Col>

              <Col md={3} xs={6}>
                <StatCard
                  title="Hostel Fee"
                  value={statistics.hostel_fee || 0}
                  icon={MdCurrencyRupee}
                />
              </Col>

              <Col md={3} xs={6}>
                <StatCard
                  title="One-on-One Fee"
                  value={statistics.one_on_one_fee || 0}
                  icon={MdCurrencyRupee}
                />
              </Col>

              <Col md={3} xs={6}>
                <StatCard
                  title="Only One-on-One Fee"
                  value={statistics.only_one_on_one_fee || 0}
                  icon={MdCurrencyRupee}
                />
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
            data={filteredPlayers}
            columns={columns}
            exportFileName="players"
          />

          {/* Table */}
          <Table
            columns={columns}
            data={paginatedPlayers}
            rowKey="player_id"
            actions={(row) => (
              <div className="common-management-action-buttons">
                {canView() && (
                  <button
                    title="View Player"
                    onClick={() =>
                      navigate(
                        `/management/player-management-profile/${row.player_id}`,
                      )
                    }
                  >
                    <FiEye />
                  </button>
                )}

                {canEdit() && (
                  <button
                    title="Edit Player"
                    onClick={() => handleOpenEditPlayer(row)}
                  >
                    <FiEdit2 />
                  </button>
                )}

                <button
                  title={
                    row.is_active ? "Deactivate Player" : "Activate Player"
                  }
                  onClick={() => handleOpenDelete(row)}
                >
                  {row.is_active ? <FiUserX /> : <FiUserCheck />}
                </button>

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
      {filteredPlayers.length > 0 && (
        <TablePagination
          page={safeCurrentPage}
          totalPages={totalPages}
          totalRecords={filteredPlayers.length}
          pageSize={pageSize}
          onPrevious={() => setCurrentPage((prev) => prev - 1)}
          onNext={() => setCurrentPage((prev) => prev + 1)}
        />
      )}

      <CommonDrawer
        show={showDrawer}
        onClose={handleCloseDrawer}
        title={drawerTitle}
        saveText={
          isCreatingPlayer || isUpdatingPlayer
            ? "Saving..."
            : editId
              ? "Update Player"
              : "Add Player"
        }
        onSave={handleCreatePlayer}
        disabled={isCreatingPlayer || isUpdatingPlayer}
      >
        {/* Basic Details */}
        <h6 className="ui-common-drawer-section-title">Basic Details</h6>

        <FormField
          label="Player Name"
          name="full_name"
          value={player.full_name}
          onChange={handlePlayerChange}
          placeholder="Enter player name"
          required
        />

        <Row>
          <Col md={6}>
            <FormField
              label="Gender"
              name="gender"
              type="select"
              value={player.gender}
              onChange={handlePlayerChange}
              options={["Male", "Female"]}
              required
            />
          </Col>

          <Col md={6}>
            <FormField
              label="Age"
              name="age"
              // type="number"
              value={player.age}
              onChange={handlePlayerChange}
              required
            />
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <FormField
              label="Date of Birth"
              name="date_of_birth"
              type="date"
              value={player.date_of_birth}
              onChange={handlePlayerChange}
              required
            />
          </Col>

          <Col md={6}>
            <FormField
              label="Admission Date"
              name="admission_date"
              type="date"
              value={player.admission_date}
              onChange={handlePlayerChange}
              required
            />
          </Col>
        </Row>

        <FormField
          label="Address"
          name="address"
          type="textarea"
          rows={2}
          value={player.address}
          onChange={handlePlayerChange}
          placeholder="Enter complete address"
          required
        />

        <Row>
          <Col md={6}>
            <FormField
              label="Primary Phone"
              name="phone_number"
              value={player.phone_number}
              onChange={handlePlayerChange}
              placeholder="10-digit number"
              required
            />
          </Col>

          <Col md={6}>
            <FormField
              label="Admission Fee (₹)"
              name="admission_fee"
              type="number"
              value={player.admission_fee}
              onChange={handlePlayerChange}
              placeholder="Enter admission fee"
              min="0"
              required
            />
          </Col>

          {/* <Col md={6}>
            <FormField
              label="Email"
              name="email"
              type="email"
              value={player.email}
              onChange={handlePlayerChange}
              placeholder="Enter email address"
            />
          </Col> */}
        </Row>

        {/* <FormField
          label="School / College"
          name="school"
          value={player.school}
          onChange={handlePlayerChange}
          placeholder="Enter school or college"
        /> */}

        {/* Cricket Profile */}
        {/* <h6 className="ui-common-drawer-section-title">Cricket Profile</h6>

        <Row>
          <Col md={6}>
            <FormField
              label="Playing Role"
              name="playingRole"
              type="select"
              value={player.playingRole}
              onChange={handlePlayerChange}
              options={[
                "Batsman",
                "Bowler - Pace",
                "Bowler - Spin",
                "All Rounder",
                "Wicket Keeper",
              ]}
            />
          </Col>

          <Col md={6}>
            <FormField
              label="Batting Style"
              name="battingStyle"
              type="select"
              value={player.battingStyle}
              onChange={handlePlayerChange}
              options={["Right Handed", "Left Handed"]}
            />
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <FormField
              label="Bowling Style"
              name="bowlingStyle"
              value={player.bowlingStyle}
              onChange={handlePlayerChange}
            />
          </Col>

          <Col md={6}>
            <FormField
              label="Batch"
              name="batch"
              type="select"
              value={player.batch}
              onChange={handlePlayerChange}
              options={[
                {
                  label: "Select Batch",
                  value: "",
                },
                {
                  label: "Morning",
                  value: "Morning",
                },
                {
                  label: "Evening",
                  value: "Evening",
                },
              ]}
              required
            />
          </Col>
        </Row> */}

        {/* <FormField
          label="Fee Type"
          name="fee_type"
          type="select"
          value={player.fee_type}
          onChange={handlePlayerChange}
          options={[
            {
              label: "Select Fee Type",
              value: "",
            },
            {
              label: "Admission Fee",
              value: "Admission Fee",
            },
            {
              label: "Regular Fee",
              value: "Regular Fee",
            },
          ]}
          required
        /> */}

        <Row>
          <Col md={6}>
            <FormField
              label="Regular Fee (₹)"
              name="regular_fee"
              type="number"
              value={player.regular_fee}
              onChange={handlePlayerChange}
              placeholder="Enter regular fee"
              min="0"
              // required
            />
          </Col>

          <Col md={6}>
            <FormField
              label="Hostel Fee (₹)"
              name="hostel_fee"
              type="number"
              value={player.hostel_fee}
              onChange={handlePlayerChange}
              placeholder="Enter hostel fee"
              min="0"
            />
          </Col>
        </Row>

        <FormField
          label="Payment Type"
          name="payment_type"
          type="select"
          value={player.payment_type}
          onChange={handlePlayerChange}
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
          ]}
          required
        />

        <FormField
          label="Remarks"
          name="remarks"
          type="textarea"
          rows={3}
          value={player.remarks}
          onChange={handlePlayerChange}
          placeholder="Enter remarks (if any)"
        />

        <FormField
          label="Upload Document"
          name="document_urls"
          type="file"
          multiple
          onChange={handlePlayerChange}
          accept=".pdf,.jpg,.jpeg,.png"
          required={!editId}
        />

        {/* Parent Details */}
        <h6 className="ui-common-drawer-section-title">Parent Details</h6>

        <FormField
          label="Father's Name"
          name="father_name"
          value={player.father_name}
          onChange={handlePlayerChange}
          required
        />

        <Row>
          <Col md={6}>
            <FormField
              label="Father's Phone"
              name="father_phone"
              value={player.father_phone}
              onChange={handlePlayerChange}
              placeholder="10-digit number"
              required
            />
          </Col>

          <Col md={6}>
            <FormField
              label="Father's Occupation"
              name="father_occupation"
              value={player.father_occupation}
              onChange={handlePlayerChange}
              required
            />
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <FormField
              label="Mother's Name"
              name="mother_name"
              value={player.mother_name}
              onChange={handlePlayerChange}
              // required
            />
          </Col>

          <Col md={6}>
            <FormField
              label="Mother's Phone"
              name="mother_phone"
              value={player.mother_phone}
              onChange={handlePlayerChange}
              placeholder="10-digit number"
            />
          </Col>
        </Row>

        {/* Emergency Contact */}

        <h6 className="ui-common-drawer-section-title">
          Emergency & Medical Details
        </h6>
        <Row>
          <Col md={6}>
            <FormField
              label="Contact Name"
              name="contact_name"
              value={player.contact_name}
              onChange={handlePlayerChange}
            />
          </Col>

          <Col md={6}>
            <FormField
              label="Relation"
              name="relation"
              value={player.relation}
              onChange={handlePlayerChange}
            />
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <FormField
              label="Contact Phone"
              name="contact_phone"
              value={player.contact_phone}
              onChange={handlePlayerChange}
              placeholder="10-digit number"
            />
          </Col>

          <Col md={6}>
            <FormField
              label="Blood Group"
              name="blood_group"
              type="select"
              value={player.blood_group}
              onChange={handlePlayerChange}
              options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]}
            />
          </Col>
        </Row>

        {/* Medical Details */}
        {/* 
        <h6 className="ui-common-drawer-section-title">Medical Details</h6>

        <Row>
          <Col md={6}>
            <FormField
              label="Allergies"
              name="allergies"
              value={player.allergies}
              onChange={handlePlayerChange}
            />
          </Col>
        </Row> */}

        {/* <Row>
          <Col md={6}>
            <FormField
              label="Height"
              name="height"
              type="number"
              value={player.height}
              onChange={handlePlayerChange}
            />
          </Col>

          <Col md={6}>
            <FormField
              label="Weight (kg)"
              name="weight"
              type="number"
              value={player.weight}
              onChange={handlePlayerChange}
            />
          </Col>
        </Row> */}
      </CommonDrawer>

      <CommonDrawer
        show={showReceiptDrawer}
        onClose={handleCloseReceipt}
        title="Player Fee Receipt"
        onPrint={handlePrint}
        printText="Print"
        onDownload={handleDownloadPDF}
        downloadText="Download"
      >
        <div className="fee-receipt" ref={playerReceiptRef}>
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

          {/* Details */}
          <div className="fee-receipt-details-card">
            <div className="fee-receipt-row">
              <span className="fee-receipt-row-span">Admission No</span>
              <span className="fee-receipt-row-no">
                {selectedReceipt?.admission_id || "-"}
              </span>
            </div>

            <div className="fee-receipt-row">
              <span className="fee-receipt-row-span">Player</span>
              <span className="fee-receipt-row-no">
                {selectedReceipt?.full_name || "-"}
              </span>
            </div>

            <div className="fee-receipt-row">
              <span className="fee-receipt-row-span">Gender</span>
              <span className="fee-receipt-row-no">
                {selectedReceipt?.gender || "-"}
              </span>
            </div>

            <div className="fee-receipt-row">
              <span className="fee-receipt-row-span">Admission Date</span>
              <span className="fee-receipt-row-no">
                {selectedReceipt?.admission_date || "-"}
              </span>
            </div>

            <div className="fee-receipt-row">
              <span className="fee-receipt-row-span">Phone</span>
              <span className="fee-receipt-row-no">
                {selectedReceipt?.phone_number || "-"}
              </span>
            </div>

            {/* <div className="fee-receipt-row">
              <span className="fee-receipt-row-span">Fee Type</span>
              <span className="fee-receipt-row-no">
                {selectedReceipt?.fee_type || "-"}
              </span>
            </div> */}

            <div className="fee-receipt-row">
              <span className="fee-receipt-row-span">Admission Fee</span>
              <span className="fee-receipt-row-no">
                ₹
                {Number(selectedReceipt?.admission_fee || 0).toLocaleString(
                  "en-IN",
                )}
              </span>
            </div>

            <div className="fee-receipt-row">
              <span className="fee-receipt-row-span">Fee</span>
              <span className="fee-receipt-row-no">
                ₹
                {Number(selectedReceipt?.regular_fee || 0).toLocaleString(
                  "en-IN",
                )}
              </span>
            </div>

            <div className="fee-receipt-row">
              <span className="fee-receipt-row-span">Hostel Fee</span>
              <span className="fee-receipt-row-no">
                ₹
                {Number(selectedReceipt?.hostel_fee || 0).toLocaleString(
                  "en-IN",
                )}
              </span>
            </div>

            <div className="fee-receipt-row">
              <span className="fee-receipt-row-span">Payment Type</span>
              <span className="fee-receipt-row-no">
                {selectedReceipt?.payment_type || "-"}
              </span>
            </div>

            <div className="fee-receipt-row">
              <span className="fee-receipt-row-span">Payment Status</span>
              <span className="fee-receipt-row-no">
                {selectedReceipt?.fee_status || "-"}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="fee-receipt-footer">
            <p>Thank you for choosing KK Global Cricket Academy.</p>

            <small>This is a computer generated receipt.</small>
          </div>
        </div>
      </CommonDrawer>

      <ConfirmDialog
        show={showConfirm}
        onClose={() => {
          setShowConfirm(false);
          setDeleteId(null);
          setSelectedPlayer(null);
        }}
        onConfirm={handleUpdatePlayerStatus}
        title={
          selectedPlayer?.is_active ? "Deactivate Player" : "Activate Player"
        }
        message={
          selectedPlayer?.is_active
            ? "Are you sure you want to deactivate this player application?"
            : "Are you sure you want to activate this player application?"
        }
        confirmText={
          isDeletingPlayer
            ? "Updating..."
            : selectedPlayer?.is_active
              ? "Deactivate"
              : "Activate"
        }
        disabled={isDeletingPlayer}
      />
    </div>
  );
};

export default Player;
