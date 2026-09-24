import { useState, useMemo } from "react";
import { FiSun, FiMoon, FiCalendar, FiUsers, FiX } from "react-icons/fi";

import { Modal, Row, Col, ProgressBar } from "react-bootstrap";

import StatCard from "../../components/ui/StatCard/StatCard.jsx";
import Table from "../ui/Table/Table";
import TablePagination from "../../components/ui/TablePagination/TablePagination.jsx";
import TableToolbar from "../ui/TableToolbar/TableToolbar";

import "./RegularBatch.css";

// Mock Data
const MORNING_BATCHES = [
  {
    id: "BATCH-01",
    title: "Morning Batch",
    // badge: "U-16",
    // time: "6:00 AM - 7:30 AM",
    // coach: "Phani Naidu",
    ground: "Ground A",
    enrolled: 11,
    capacity: 21,
    variant: "reg-success",
  },
];

const EVENING_BATCHES = [
  {
    id: "BATCH-02",
    title: "Evening Batch",
    // badge: "U-16",
    // time: "7:00 PM - 8:30 PM",
    // coach: "Siddharth Krishna",
    ground: "Ground B",
    enrolled: 11,
    capacity: 22,
    variant: "reg-success",
  },
];

const MOCK_STUDENTS = [
  {
    id: 1,
    student: "Bhargav Babu",
    age: 18,
    playingRole: "Wicket Keeper",
    feeStatus: "Paid",
  },
  {
    id: 2,
    student: "Divya Kumar",
    age: 7,
    playingRole: "Bowler - Spin",
    feeStatus: "Pending",
  },
  {
    id: 3,
    student: "Bhavya Chowdary",
    age: 18,
    playingRole: "All-rounder",
    feeStatus: "Paid",
  },
  {
    id: 4,
    student: "Jaswanth Naidu",
    age: 10,
    playingRole: "Bowler - Pace",
    feeStatus: "Paid",
  },
  {
    id: 5,
    student: "Yaswanth Nair",
    age: 14,
    playingRole: "Bowler - Spin",
    feeStatus: "Paid",
  },
  {
    id: 6,
    student: "Dhanya Pillai",
    age: 12,
    playingRole: "Bowler - Pace",
    feeStatus: "Paid",
  },
  {
    id: 7,
    student: "Rahul Verma",
    age: 15,
    playingRole: "Batsman",
    feeStatus: "Paid",
  },
  {
    id: 8,
    student: "Kiran Kumar",
    age: 16,
    playingRole: "All-rounder",
    feeStatus: "Pending",
  },
  {
    id: 9,
    student: "Anish Roy",
    age: 13,
    playingRole: "Bowler - Spin",
    feeStatus: "Paid",
  },
  {
    id: 10,
    student: "Suresh Raina",
    age: 17,
    playingRole: "Batsman",
    feeStatus: "Paid",
  },
  {
    id: 11,
    student: "Vikram Rathore",
    age: 14,
    playingRole: "Wicket Keeper",
    feeStatus: "Paid",
  },
];

const BatchCard = ({ batch, onClick }) => {
  const enrolled = batch.enrolled ?? 0;
  const capacity = batch.capacity || 1;
  const percentage = Math.round((enrolled / capacity) * 100);

  // Dynamic progress bar variant based on capacity
  const getVariant = () => {
    if (batch.variant) return batch.variant;
    if (percentage >= 90) return "reg-danger";
    if (percentage >= 70) return "reg-warning";
    return "reg-success";
  };

  return (
    <div
      className="reg-batch-card p-3 rounded-4 bg-white d-flex flex-column h-100"
      onClick={() => onClick?.(batch)}
    >
      {/* HEADER: Title & Badge */}
      <div className="d-flex justify-content-between align-items-start mb-1">
        <h5 className="reg-card-title mb-0">{batch.title || batch.name}</h5>
        {/* <span className="badge reg-badge">U-16</span> */}
      </div>

      {/* SUBTEXT: ID & Time */}
      <div className="reg-card-subtext mb-3">
        <span>{batch.id || batch.code}</span> &bull;{" "}
        <span>{batch.time || batch.timeSlot}</span>
      </div>

      {/* COACH */}
      {/* <div className="reg-card-coach mb-1">
        Coach: <strong>{batch.coach || batch.trainerName}</strong>
      </div> */}

      {/* GROUND */}
      <div className="reg-card-ground mb-3">{batch.ground}</div>

      {/* PROGRESS BOX */}
      <div className="mt-auto">
        <ProgressBar
          now={percentage}
          variant={getVariant()}
          className="reg-progress mb-2"
        />
        <div className="reg-card-enrolled">
          {enrolled} / {capacity} students enrolled
        </div>
      </div>
    </div>
  );
};

const BatchDetailsModal = ({ show, onHide, batch }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const filtersConfig = [
    {
      key: "feeStatus",
      label: "Fee Status",
      options: [
        { label: "Paid", value: "Paid" },
        { label: "Pending", value: "Pending" },
      ],
    },
  ];

  const filteredStudents = useMemo(() => {
    return MOCK_STUDENTS.filter((item) => {
      const matchesSearch =
        !searchTerm.trim() ||
        item.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.playingRole.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFeeStatus =
        !activeFilters.feeStatus ||
        activeFilters.feeStatus === "All" ||
        item.feeStatus === activeFilters.feeStatus;

      return matchesSearch && matchesFeeStatus;
    });
  }, [searchTerm, activeFilters]);

  const totalRecords = filteredStudents.length;
  const totalPages = Math.ceil(totalRecords / pageSize);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setActiveFilters({});
    setCurrentPage(1);
  };

  const columns = [
    { header: "Student", accessor: "student" },
    { header: "Age", accessor: "age" },
    { header: "Playing Role", accessor: "playingRole" },
    {
      header: "Fee Status",
      accessor: "feeStatus",
      cell: (row) => (
        <span className={`reg-fee-status-badge ${row.feeStatus.toLowerCase()}`}>
          {row.feeStatus}
        </span>
      ),
    },
  ];

  if (!batch) return null;

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      dialogClassName="reg-modal-dialog"
      contentClassName="reg-modal-content"
    >
      <div className="reg-modal-header d-flex justify-content-between align-items-center">
        <h4 className="reg-modal-title fw-bold m-0">{batch.title}</h4>
        <button type="button" className="reg-modal-close-btn" onClick={onHide}>
          <FiX />
        </button>
      </div>

      <Modal.Body className="p-4">
        {/* Info Cards Row */}
        <Row className="g-3 mb-4">
          <Col xs={6} md={3}>
            <div className="reg-meta-card">
              <span className="reg-meta-card-label">Coach</span>
              <strong className="reg-meta-card-val">{batch.coach}</strong>
            </div>
          </Col>
          <Col xs={6} md={3}>
            <div className="reg-meta-card">
              <span className="reg-meta-card-label">Time Slot</span>
              <strong className="reg-meta-card-val">{batch.time}</strong>
            </div>
          </Col>
          <Col xs={6} md={3}>
            <div className="reg-meta-card">
              <span className="reg-meta-card-label">Ground</span>
              <strong className="reg-meta-card-val">{batch.ground}</strong>
            </div>
          </Col>
          <Col xs={6} md={3}>
            <div className="reg-meta-card">
              <span className="reg-meta-card-label">Capacity</span>
              <strong className="reg-meta-card-val">
                {batch.enrolled}/{batch.capacity}
              </strong>
            </div>
          </Col>
        </Row>

        {/* Table Container Card */}
        <div className="border rounded-3 overflow-hidden">
          <TableToolbar
            search={searchTerm}
            setSearch={(val) => {
              setSearchTerm(val);
              setCurrentPage(1);
            }}
            filters={filtersConfig}
            activeFilters={activeFilters}
            setActiveFilters={(filters) => {
              setActiveFilters(filters);
              setCurrentPage(1);
            }}
            onClear={handleClearFilters}
            data={filteredStudents}
            columns={columns}
            exportFileName={`${batch?.title || "Batch"}_Students`}
          />

          <Table columns={columns} data={paginatedData} />

          <TablePagination
            page={currentPage}
            totalPages={totalPages}
            totalRecords={totalRecords}
            pageSize={pageSize}
            onPrevious={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            onNext={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
          />
        </div>
      </Modal.Body>
    </Modal>
  );
};

const RegularBatch = () => {
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleCardClick = (batch) => {
    setSelectedBatch(batch);
    setShowModal(true);
  };

  return (
    <div className="common-management-main-section">
      <div className="dashboard-action-page-header">
        <div>
          <h2 className="all-dash-page-title">Regular Batch</h2>
          <p className="all-dash-page-subtitle">
            Batch capacity, trainers and rosters
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <Row className="g-3 mb-4">
             <Col md={3} xs={6}>
          <StatCard title="TOTAL BATCHES" value="10" icon={FiCalendar} />
        </Col>
             <Col md={3} xs={6}>
          <StatCard title="MORNING BATCHES" value="5" icon={FiSun} />
        </Col>
              <Col md={3} xs={6}>
          <StatCard title="EVENING BATCHES" value="5" icon={FiMoon} />
        </Col>
             <Col md={3} xs={6}>
          <StatCard title="TOTAL CAPACITY" value="214" icon={FiUsers} />
        </Col>
      </Row>

      {/* Morning Batches */}
      <h5 className="mb-3 d-flex align-items-center gap-2">
        <FiSun className="text-warning" /> Morning Batches
      </h5>
      <Row className="g-3 mb-4">
        {MORNING_BATCHES.map((batch) => (
          <Col key={batch.id} lg={4} md={6} xs={12}>
            <BatchCard batch={batch} onClick={handleCardClick} />
          </Col>
        ))}
      </Row>

      {/* Evening Batches */}
      <h5 className="mb-3 d-flex align-items-center gap-2">
        <FiMoon className="text-warning" /> Evening Batches
      </h5>
      <Row className="g-3">
        {EVENING_BATCHES.map((batch) => (
          <Col key={batch.id} lg={4} md={6} xs={12}>
            <BatchCard batch={batch} onClick={handleCardClick} />
          </Col>
        ))}
      </Row>

      {/* Detail View Modal */}
      <BatchDetailsModal
        show={showModal}
        onHide={() => setShowModal(false)}
        batch={selectedBatch}
      />
    </div>
  );
};

export default RegularBatch;
