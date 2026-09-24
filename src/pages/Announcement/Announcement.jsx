import { useState, useMemo } from "react";

import {
  FiBell,
  FiMessageCircle,
  FiMail,
  FiSend,
  FiPlus,
} from "react-icons/fi";

import { Row, Col, Button, Modal, Form } from "react-bootstrap";

import toast from "react-hot-toast";

import StatCard from "../../components/ui/StatCard/StatCard";
import TableToolbar from "../../components/ui/TableToolbar/TableToolbar";
import Table from "../../components/ui/Table/Table.jsx";
import TablePagination from "../../components/ui/TablePagination/TablePagination";

const ANNOUNCEMENTS = [
  {
    id: 1,
    type: "Announcement",
    channel: "WhatsApp",
    recipient: "All Students",
    message: "Academy will remain closed on Sunday due to maintenance work. ",
    sentOn: "25-01-2026",
    status: "Delivered",
  },
  {
    id: 2,
    type: "Fee Reminder",
    channel: "SMS",
    recipient: "Rahul Sharma",
    message: "Monthly academy fee payment is pending. Kindly complete payment.",
    sentOn: "24-01-2026",
    status: "Delivered",
  },
  {
    id: 3,
    type: "Attendance Reminder",
    channel: "WhatsApp",
    recipient: "Arjun Kumar",
    message: "You have missed 3 consecutive training sessions.",
    sentOn: "23-01-2026",
    status: "Delivered",
  },
  {
    id: 4,
    type: "Birthday Reminder",
    channel: "SMS",
    recipient: "Vikram Singh",
    message: "Happy Birthday! Wishing you success from KK Academy.",
    sentOn: "22-01-2026",
    status: "Delivered",
  },
  {
    id: 5,
    type: "Event Update",
    channel: "WhatsApp",
    recipient: "All Players",
    message: "KK Summer Cup 2026 registration has started.",
    sentOn: "21-01-2026",
    status: "Delivered",
  },
  {
    id: 6,
    type: "Fee Reminder",
    channel: "SMS",
    recipient: "Priya Patel",
    message: "Your pending fee payment reminder.",
    sentOn: "20-01-2026",
    status: "Failed",
  },
  {
    id: 7,
    type: "Announcement",
    channel: "SMS",
    recipient: "Parents",
    message: "New evening batch timing has been updated.",
    sentOn: "19-01-2026",
    status: "Delivered",
  },
  {
    id: 8,
    type: "Event Update",
    channel: "WhatsApp",
    recipient: "Students",
    message: "Tournament schedule has been released.",
    sentOn: "18-01-2026",
    status: "Delivered",
  },
  {
    id: 9,
    type: "Attendance Reminder",
    channel: "SMS",
    recipient: "Karan Mehta",
    message: "Attendance is below required percentage. Please improve.",
    sentOn: "17-01-2026",
    status: "Delivered",
  },
  {
    id: 10,
    type: "Announcement",
    channel: "WhatsApp",
    recipient: "All Coaches",
    message: "Monthly coaches meeting scheduled on Monday.",
    sentOn: "16-01-2026",
    status: "Delivered",
  },
  {
    id: 11,
    type: "Fee Reminder",
    channel: "WhatsApp",
    recipient: "Amit Verma",
    message: "Second installment payment reminder.",
    sentOn: "15-01-2026",
    status: "Failed",
  },
  {
    id: 12,
    type: "Event Update",
    channel: "SMS",
    recipient: "Parents Group",
    message: "Match timings updated for weekend tournament.",
    sentOn: "14-01-2026",
    status: "Delivered",
  },
  {
    id: 13,
    type: "Birthday Reminder",
    channel: "WhatsApp",
    recipient: "Rohan Das",
    message: "Wish you a very happy birthday from academy team.",
    sentOn: "13-01-2026",
    status: "Delivered",
  },
  {
    id: 14,
    type: "Announcement",
    channel: "SMS",
    recipient: "All Students",
    message: "New cricket practice schedule announced.",
    sentOn: "12-01-2026",
    status: "Delivered",
  },
  {
    id: 15,
    type: "Attendance Reminder",
    channel: "WhatsApp",
    recipient: "Sanjay Kumar",
    message: "Please maintain regular practice attendance.",
    sentOn: "11-01-2026",
    status: "Delivered",
  },
  {
    id: 16,
    type: "Fee Reminder",
    channel: "SMS",
    recipient: "Neha Sharma",
    message: "Your monthly fee is due tomorrow.",
    sentOn: "10-01-2026",
    status: "Delivered",
  },
  {
    id: 17,
    type: "Event Update",
    channel: "WhatsApp",
    recipient: "Under 16 Team",
    message: "Selection trials date announced.",
    sentOn: "09-01-2026",
    status: "Delivered",
  },
  {
    id: 18,
    type: "Announcement",
    channel: "WhatsApp",
    recipient: "Parents",
    message: "Holiday camp registration started.",
    sentOn: "08-01-2026",
    status: "Failed",
  },
  {
    id: 19,
    type: "Attendance Reminder",
    channel: "WhatsApp",
    recipient: "Vivek Singh",
    message: "Your attendance report is available.",
    sentOn: "07-01-2026",
    status: "Delivered",
  },
  {
    id: 20,
    type: "Birthday Reminder",
    channel: "SMS",
    recipient: "Mohit Patel",
    message: "Birthday wishes from KK Global Cricket Academy.",
    sentOn: "06-01-2026",
    status: "Delivered",
  },
];

const CHANNEL_ICON = {
  WhatsApp: FiMessageCircle,
  SMS: FiSend,
  Email: FiMail,
};

const Announcement = () => {
  const [data, setData] = useState(ANNOUNCEMENTS);

  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const [composeOpen, setComposeOpen] = useState(false);

  const [form, setForm] = useState({
    type: "Announcement",
    channel: "WhatsApp",
    message: "",
  });

  const columns = [
    {
      header: "Type",
      accessor: "type",
    },
    {
      header: "Channel",
      accessor: "channel",
      cell: (row) => {
        const Icon = CHANNEL_ICON[row.channel];

        return (
          <span className="notification-table-channel-cell">
            <Icon />
            {row.channel}
          </span>
        );
      },
    },
    {
      header: "Recipient",
      accessor: "recipient",
    },
    {
      header: "Message",
      accessor: "message",
      cell: (row) => (
        <div className="notification-table-message-cell" title={row.message}>
          {row.message}
        </div>
      ),
    },
    {
      header: "Sent On",
      accessor: "sentOn",
    },

    {
      header: "Status",
      accessor: "status",
      cell: (row) => (
        <span
          className={
            row.status === "Delivered"
              ? "notification-status-badge-success"
              : "notification-status-badge-failed"
          }
        >
          {row.status}
        </span>
      ),
    },
  ];

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const searchMatch =
        item.type.toLowerCase().includes(search.toLowerCase()) ||
        item.recipient.toLowerCase().includes(search.toLowerCase()) ||
        item.message.toLowerCase().includes(search.toLowerCase());

      const filterMatch = Object.entries(activeFilters).every(
        ([key, value]) => {
          if (!value || value === "All") return true;

          return item[key] === value;
        },
      );

      return searchMatch && filterMatch;
    });
  }, [data, search, activeFilters]);

  const typeOptions = [...new Set(data.map((item) => item.type))];

  const channelOptions = [...new Set(data.map((item) => item.channel))];

  const clearFilters = () => {
    setSearch("");
    setActiveFilters({});
    setCurrentPage(1);
  };

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;

    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage]);

  const sendNotification = () => {
    if (!form.message.trim()) {
      toast.error("Please write a message before sending.");
      return;
    }

    const today = new Date();

    const newNotification = {
      id: Date.now(),
      type: form.type,
      channel: form.channel,
      recipient: "All Students", // You can make this a dropdown later
      message: form.message,
      sentOn: today.toLocaleDateString("en-GB"),
      status: "Delivered",
    };

    setData((prev) => [newNotification, ...prev]);

    toast.success(`${form.type} sent successfully via ${form.channel}.`);

    setComposeOpen(false);

    setForm({
      type: "Announcement",
      channel: "WhatsApp",
      message: "",
    });

    setCurrentPage(1);
  };

  return (
    <div className="notification-page">
      {/* HEADER */}

      <div className="dashboard-action-page-header">
        <div>
          <h2 className="all-dash-page-title">Announcements</h2>
          <p className="all-dash-page-subtitle">
            Announcements and communication history
          </p>
        </div>

        <Button
          className="dashboard-action-primary-btn"
          onClick={() => setComposeOpen(true)}
        >
          <FiPlus className="dashboard-action-primary-btn-icon" />
          Compose
        </Button>
      </div>

      {/* STAT CARDS */}
      <Row className="g-3 mb-4">
        <Col md={3} xs={6}>
          <StatCard title="Total Sent" value={data.length} icon={FiBell} />
        </Col>

        <Col md={3} xs={6}>
          <StatCard
            title="Delivered"
            value={data.filter((n) => n.status === "Delivered").length}
            icon={FiSend}
          />
        </Col>

        <Col md={3} xs={6}>
          <StatCard
            title="WhatsApp"
            value={data.filter((n) => n.channel === "WhatsApp").length}
            icon={FiMessageCircle}
          />
        </Col>

        <Col md={3} xs={6}>
          <StatCard
            title="Email"
            value={data.filter((n) => n.channel === "Email").length}
            icon={FiMail}
          />
        </Col>
      </Row>

      {/* TABLE */}
      <TableToolbar
        search={search}
        setSearch={(value) => {
          setSearch(value);
          setCurrentPage(1);
        }}
        filters={[
          {
            key: "type",
            label: "Type",
            options: typeOptions,
          },

          {
            key: "channel",
            label: "Channel",
            options: channelOptions,
          },
        ]}
        activeFilters={activeFilters}
        setActiveFilters={(value) => {
          setActiveFilters(value);
          setCurrentPage(1);
        }}
        onClear={clearFilters}
        data={filteredData}
        columns={columns}
        exportFileName="notifications"
      />

      <Table columns={columns} data={paginatedData} />

      {filteredData.length > 0 && (
        <TablePagination
          page={currentPage}
          totalPages={Math.ceil(filteredData.length / pageSize)}
          totalRecords={filteredData.length}
          pageSize={pageSize}
          onPrevious={() => setCurrentPage((prev) => prev - 1)}
          onNext={() => setCurrentPage((prev) => prev + 1)}
        />
      )}

      {/* COMPOSE MODAL */}
      <Modal
        show={composeOpen}
        onHide={() => setComposeOpen(false)}
        backdrop="static"
        keyboard={false}
        centered
        className="notification-modal-main"
      >
        <Modal.Header closeButton className="notification-modal-header">
          <Modal.Title className="notification-modal-title">
            Compose Notification
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="notification-modal-body">
          <Form.Group className="mb-3">
            <Form.Label className="notification-modal-form-label">
              Type
            </Form.Label>

            <Form.Select
              value={form.type}
              onChange={(e) =>
                setForm({
                  ...form,
                  type: e.target.value,
                })
              }
              className="notification-modal-form-input"
            >
              {[
                "Announcement",
                "Fee Reminder",
                "Attendance Reminder",
                "Birthday Reminder",
                "Event Update",
              ].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="notification-modal-form-label">
              Channel
            </Form.Label>

            <Form.Select
              value={form.channel}
              onChange={(e) =>
                setForm({
                  ...form,
                  channel: e.target.value,
                })
              }
              className="notification-modal-form-input"
            >
              {["WhatsApp", "SMS"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group>
            <Form.Label className="notification-modal-form-label">
              Message
            </Form.Label>

            <Form.Control
              as="textarea"
              rows={4}
              value={form.message}
              onChange={(e) =>
                setForm({
                  ...form,
                  message: e.target.value,
                })
              }
              placeholder="Type your message..."
              className="notification-modal-form-input"
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer className="notification-modal-footer">
          <Button
            onClick={() => setComposeOpen(false)}
            className="notification-modal-footer-btn-cancel"
          >
            Cancel
          </Button>

          <Button
            onClick={sendNotification}
            className="notification-modal-footer-btn-send"
          >
            Send
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Announcement;
