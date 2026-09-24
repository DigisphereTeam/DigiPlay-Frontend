import { useMemo, useState } from "react";
import { Row, Col, Button } from "react-bootstrap";
import {
  FiAward,
  FiCalendar,
  FiCheckCircle,
  FiUsers,
  FiEdit2,
  FiTrash2,
  FiPlus,
} from "react-icons/fi";
import toast from "react-hot-toast";

import StatCard from "../../components/ui/StatCard/StatCard";
import CommonDrawer from "../../components/ui/CommonDrawer/CommonDrawer";
import ConfirmDialog from "../../components/ui/ConfirmDialog/ConfirmDialog";
import FormField from "../../components/ui/FormField/FormField";
import TableToolbar from "../../components/ui/TableToolbar/TableToolbar";
import Table from "../../components/ui/Table/Table";
import TablePagination from "../../components/ui/TablePagination/TablePagination";

const INITIAL_EVENTS = [
  {
    id: 1,
    eventName: "Republic Day Tournament 2025",
    type: "Practice Match",
    date: "2026-02-06",
    venue: "Ground B",
    teams: 2,
    winner: "-",
    status: "Completed",
  },
  {
    id: 2,
    eventName: "KK Sports Premier Trophy 2025",
    type: "Cricket Camp",
    date: "2025-03-26",
    venue: "Ground A",
    teams: 4,
    winner: "-",
    status: "Completed",
  },
  {
    id: 3,
    eventName: "KK Sports Premier Trophy 2025",
    type: "Event",
    date: "2026-11-03",
    venue: "Vijayawada Municipal Stadium",
    teams: 4,
    winner: "-",
    status: "Registration Open",
  },
  {
    id: 4,
    eventName: "KK Summer Cup 2025",
    type: "Practice Match",
    date: "2026-11-05",
    venue: "Ground A",
    teams: 2,
    winner: "-",
    status: "Registration Open",
  },
  {
    id: 5,
    eventName: "U-14 Friendly Series 2025",
    type: "Tournament",
    date: "2025-01-25",
    venue: "Ground A",
    teams: 13,
    winner: "Team Titans",
    status: "Completed",
  },
  {
    id: 6,
    eventName: "Vijayawada Junior League 2025",
    type: "Event",
    date: "2025-04-17",
    venue: "Ground A",
    teams: 4,
    winner: "-",
    status: "Completed",
  },
  {
    id: 7,
    eventName: "KK Sports Premier Trophy 2025",
    type: "Event",
    date: "2026-09-13",
    venue: "Ground A",
    teams: 4,
    winner: "-",
    status: "Upcoming",
  },
  {
    id: 8,
    eventName: "Inter-Academy Championship 2025",
    type: "Tournament",
    date: "2026-09-24",
    venue: "Vijayawada Municipal Stadium",
    teams: 7,
    winner: "-",
    status: "Upcoming",
  },
  {
    id: 9,
    eventName: "U-14 Friendly Series 2025",
    type: "Practice Match",
    date: "2026-11-25",
    venue: "Ground B",
    teams: 3,
    winner: "-",
    status: "Upcoming",
  },
  {
    id: 10,
    eventName: "KK Sports Premier Trophy 2025",
    type: "Tournament",
    date: "2025-06-16",
    venue: "Ground A",
    teams: 9,
    winner: "Team Titans",
    status: "Completed",
  },
];

const EVENT_TYPES = ["Tournament", "Practice Match", "Cricket Camp", "Event"];
const EVENT_STATUSES = [
  "Registration Open",
  "Upcoming",
  "Completed",
  "Cancelled",
];

const emptyEvent = {
  eventName: "",
  type: "Tournament",
  date: "",
  venue: "",
  teams: "",
  winner: "-",
  status: "Upcoming",
};

const EventManagement = () => {
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [eventData, setEventData] = useState(emptyEvent);

  const [editId, setEditId] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [drawerTitle, setDrawerTitle] = useState("Add New Event");

  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 5;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const columns = [
    {
      header: "Event Name",
      accessor: "eventName",
    },
    {
      header: "Type",
      accessor: "type",
    },
    {
      header: "Date",
      accessor: "date",
    },
    {
      header: "Venue",
      accessor: "venue",
    },
    {
      header: "Teams",
      accessor: "teams",
    },
    {
      header: "Winner",
      accessor: "winner",
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => {
        let badgeClass = "common-management-table-status-neutral";

        if (row.status === "Completed") {
          badgeClass = "common-management-table-status-success";
        } else if (
          row.status === "Registration Open" ||
          row.status === "Upcoming"
        ) {
          badgeClass = "common-management-table-status-warning";
        } else if (row.status === "Cancelled") {
          badgeClass = "common-management-table-status-danger";
        }

        return <span className={badgeClass}>{row.status}</span>;
      },
    },
  ];

  // Open Drawer for Add
  const handleAddEvent = () => {
    setEventData({ ...emptyEvent });
    setEditId(null);
    setDrawerTitle("Add New Event");
    setShowDrawer(true);
  };

  // Open Drawer for Edit
  const handleEditEvent = (row) => {
    setEventData({
      eventName: row.eventName,
      type: row.type,
      date: row.date,
      venue: row.venue,
      teams: row.teams,
      winner: row.winner || "-",
      status: row.status,
    });

    setEditId(row.id);
    setDrawerTitle("Edit Event");
    setShowDrawer(true);
  };

  const handleCloseDrawer = () => {
    setShowDrawer(false);
    setEditId(null);
    setEventData({ ...emptyEvent });
  };

  // Save or Update
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!eventData.eventName || !eventData.date || !eventData.venue) {
      toast.error("Please fill required event details");
      return;
    }

    if (editId) {
      setEvents((prev) =>
        prev.map((item) =>
          item.id === editId
            ? { ...item, ...eventData, teams: Number(eventData.teams) || 0 }
            : item,
        ),
      );
      toast.success("Event updated successfully");
    } else {
      setEvents((prev) => [
        ...prev,
        {
          ...eventData,
          id: Date.now(),
          teams: Number(eventData.teams) || 0,
        },
      ]);
      toast.success("Event added successfully");
    }

    handleCloseDrawer();
  };

  // Delete Action with Page Adjustment Check
  const handleOpenDelete = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const handleDeleteEvent = () => {
    const updatedEvents = events.filter((item) => item.id !== deleteId);

    // Recalculate pagination for active search/filters
    const updatedFiltered = updatedEvents.filter((item) => {
      const searchValue = search.toLowerCase();
      const searchMatch =
        item.eventName?.toLowerCase().includes(searchValue) ||
        item.type?.toLowerCase().includes(searchValue) ||
        item.venue?.toLowerCase().includes(searchValue);

      const filterMatch = Object.entries(activeFilters).every(
        ([key, value]) => !value || value === "All" || item[key] === value,
      );

      return searchMatch && filterMatch;
    });

    const newTotalPages = Math.ceil(updatedFiltered.length / pageSize);

    // If last remaining item on current page is deleted, jump to previous page
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    }

    setEvents(updatedEvents);
    toast.success("Event deleted successfully");
    setDeleteId(null);
    setShowConfirm(false);
  };

  const handleClearFilters = () => {
    setSearch("");
    setActiveFilters({});
    setCurrentPage(1);
  };

  // Filter Logic
  const filteredEvents = useMemo(() => {
    return events.filter((item) => {
      const searchValue = search.toLowerCase();

      const searchMatch =
        item.eventName?.toLowerCase().includes(searchValue) ||
        item.type?.toLowerCase().includes(searchValue) ||
        item.venue?.toLowerCase().includes(searchValue) ||
        item.winner?.toLowerCase().includes(searchValue);

      const filterMatch = Object.entries(activeFilters).every(
        ([key, value]) => {
          if (!value || value === "All") return true;
          return item[key] === value;
        },
      );

      return searchMatch && filterMatch;
    });
  }, [events, search, activeFilters]);

  const typeOptions = [
    ...new Set(events.map((item) => item.type).filter(Boolean)),
  ];

  const statusOptions = [
    ...new Set(events.map((item) => item.status).filter(Boolean)),
  ];

  const totalPages = Math.ceil(filteredEvents.length / pageSize);
  const safeCurrentPage =
    currentPage > totalPages ? totalPages || 1 : currentPage;

  const paginatedEvents = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return filteredEvents.slice(startIndex, startIndex + pageSize);
  }, [filteredEvents, safeCurrentPage]);

  // Dynamic KPI Stats
  const upcomingCount = useMemo(
    () =>
      events.filter(
        (x) => x.status === "Upcoming" || x.status === "Registration Open",
      ).length,
    [events],
  );

  const completedCount = useMemo(
    () => events.filter((x) => x.status === "Completed").length,
    [events],
  );

  const totalTeamsCount = useMemo(
    () => events.reduce((sum, item) => sum + (Number(item.teams) || 0), 0),
    [events],
  );

  return (
    <div className="common-management-main-section">
      <div className="dashboard-action-page-header">
        <div>
          <h2 className="all-dash-page-title">Event Management</h2>
          <p className="all-dash-page-subtitle">
            Tournaments, practice matches and cricket camps
          </p>
        </div>

        <Button
          className="dashboard-action-primary-btn"
          onClick={handleAddEvent}
        >
          <FiPlus className="dashboard-action-primary-btn-icon" />
          Add Event
        </Button>
      </div>

      {/* KPI Stats Section */}
      <Row className="g-3 mb-4">
        <Col md={3} xs={6}>
          <StatCard title="TOTAL EVENTS" value={events.length} icon={FiAward} />
        </Col>

        <Col md={3} xs={6}>
          <StatCard title="UPCOMING" value={upcomingCount} icon={FiCalendar} />
        </Col>

        <Col md={3} xs={6}>
          <StatCard
            title="COMPLETED"
            value={completedCount}
            icon={FiCheckCircle}
          />
        </Col>

        <Col md={3} xs={6}>
          <StatCard
            title="TOTAL TEAMS"
            value={totalTeamsCount}
            icon={FiUsers}
          />
        </Col>
      </Row>

      {/* Filter and Export Toolbar */}
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
        data={filteredEvents}
        columns={columns}
        exportFileName="events_list"
      />

      {/* Events Table */}
      <Table
        columns={columns}
        data={paginatedEvents}
        actions={(row) => (
          <div className="common-management-action-buttons">
            <button title="Edit Event" onClick={() => handleEditEvent(row)}>
              <FiEdit2 />
            </button>

            <button
              title="Delete Event"
              onClick={() => handleOpenDelete(row.id)}
            >
              <FiTrash2 />
            </button>
          </div>
        )}
      />

      {/* Pagination Footer */}
      {filteredEvents.length > 0 && (
        <TablePagination
          page={safeCurrentPage}
          totalPages={totalPages}
          totalRecords={filteredEvents.length}
          pageSize={pageSize}
          onPrevious={() => setCurrentPage((prev) => prev - 1)}
          onNext={() => setCurrentPage((prev) => prev + 1)}
        />
      )}

      {/* Event Drawer */}
      <CommonDrawer
        show={showDrawer}
        onClose={handleCloseDrawer}
        title={drawerTitle}
        saveText={editId ? "Update Event" : "Add Event"}
        onSave={handleSubmit}
      >
        <h6 className="ui-common-drawer-section-title">Event Details</h6>

        <FormField
          label="Event Name"
          name="eventName"
          value={eventData.eventName}
          onChange={handleInputChange}
          placeholder="Enter event name"
          required
        />

        <Row>
          <Col md={6}>
            <FormField
              label="Type"
              name="type"
              type="select"
              value={eventData.type}
              onChange={handleInputChange}
              options={EVENT_TYPES}
              required
            />
          </Col>

          <Col md={6}>
            <FormField
              label="Status"
              name="status"
              type="select"
              value={eventData.status}
              onChange={handleInputChange}
              options={EVENT_STATUSES}
              required
            />
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <FormField
              label="Date"
              name="date"
              type="date"
              value={eventData.date}
              onChange={handleInputChange}
              required
            />
          </Col>

          <Col md={6}>
            <FormField
              label="Teams"
              name="teams"
              type="number"
              value={eventData.teams}
              onChange={handleInputChange}
              placeholder="Number of teams"
              required
            />
          </Col>
        </Row>

        <FormField
          label="Venue"
          name="venue"
          value={eventData.venue}
          onChange={handleInputChange}
          placeholder="Enter venue location"
          required
        />

        <FormField
          label="Winner"
          name="winner"
          value={eventData.winner}
          onChange={handleInputChange}
          placeholder="Enter winner name or '-'"
        />
      </CommonDrawer>

      {/* Delete Confirmation */}
      <ConfirmDialog
        show={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDeleteEvent}
        title="Delete Event"
        message="Are you sure you want to delete this event?"
        confirmText="Delete"
      />
    </div>
  );
};

export default EventManagement;
