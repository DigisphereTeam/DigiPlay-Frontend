import { useEffect, useCallback, useMemo, useState } from "react";

import {
  // FiBell,
  // FiMessageCircle,
  // FiMail,
  // FiSend,
  FiTrash2,
} from "react-icons/fi";

import {
  getAllNotifications,
  deleteNotifications,
} from "../../services/notificationService";

import toast from "react-hot-toast";
import { ThreeDots } from "react-loader-spinner";

// import StatCard from "../../components/ui/StatCard/StatCard";
import ConfirmDialog from "../ui/ConfirmDialog/ConfirmDialog.jsx";
import TableToolbar from "../ui/TableToolbar/TableToolbar.jsx";
import Table from "../ui/Table/Table.jsx";
import TablePagination from "../ui/TablePagination/TablePagination.jsx";
import DescriptionCell from "../ui/DescriptionCell/DescriptionCell.jsx";

import "./Notification.css";

// Helper function to format ISO date string
const formatDate = (isoString) => {
  if (!isoString) return "-";
  const date = new Date(isoString);
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const Notification = () => {
  const [notificationData, setNotificationData] = useState([]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  //loading
  const [isNotificationLoading, setIsNotificationLoading] = useState(true);
  const [isDeletingNotification, setIsDeletingNotification] = useState(false);

  const pageSize = 5;

  const columns = useMemo(
    () => [
      {
        header: "User",
        accessor: "user",
      },
      {
        header: "Module",
        accessor: "module",
      },
      {
        header: "Action",
        accessor: "action",
      },
      {
        header: "Description",
        accessor: "description",
        // cell: (row) => (
        //   <div
        //     className="notification-table-message-cell"
        //     title={row.description}
        //   >
        //     {row.description}
        //   </div>
        // ),
        cell: (row) => <DescriptionCell text={row.description} />,
      },
      {
        header: "Date",
        accessor: "date",
      },
    ],
    [],
  );

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await getAllNotifications();

      if (response.statusCode === 200) {
        const formattedData = (response.data || []).map((item) => ({
          logId: item.log_id,
          module: item.module_name || "-",
          user: item.performed_by || "-",
          action: item.action || "-",
          description: item.description || "-",
          date: formatDate(item.created_at),
          rawDate: item.created_at,
        }));

        setNotificationData(formattedData);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Get Notification Error:", error);
      toast.error(error.response?.data?.message);
    }
  }, []);

  useEffect(() => {
    const loadUsers = async () => {
      setIsNotificationLoading(true);

      try {
        await fetchNotifications();
      } finally {
        setIsNotificationLoading(false);
      }
    };

    loadUsers();
  }, [fetchNotifications]);

  const handleOpenDelete = (item) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const handleDeleteItem = async () => {
    if (!selectedItem) return;

    setIsDeletingNotification(true);
    try {
      const response = await deleteNotifications(selectedItem.logId);

      if (response.statusCode === 200) {
        toast.success(response.message);

        await fetchNotifications();

        setShowDeleteModal(false);
        setSelectedItem(null);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Delete Notification Error:", error);

      toast.error(error.response?.data?.message);
    } finally {
      setIsDeletingNotification(false);
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setActiveFilters({});
    setCurrentPage(1);
  };

  const filteredData = useMemo(() => {
    return notificationData.filter((item) => {
      const searchValue = search.toLowerCase();

      const searchMatch =
        item.user?.toLowerCase().includes(searchValue) ||
        item.module?.toLowerCase().includes(searchValue) ||
        item.action?.toLowerCase().includes(searchValue) ||
        item.description?.toLowerCase().includes(searchValue);

      const filterMatch = Object.entries(activeFilters).every(
        ([key, value]) => {
          if (!value || value === "All") return true;

          return item[key] === value;
        },
      );

      return searchMatch && filterMatch;
    });
  }, [notificationData, search, activeFilters]);

  const moduleOptions = useMemo(
    () => [
      ...new Set(notificationData.map((item) => item.module).filter(Boolean)),
    ],
    [notificationData],
  );

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const safeCurrentPage =
    currentPage > totalPages ? totalPages || 1 : currentPage;

  const paginatedData = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;

    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, safeCurrentPage]);

  return (
    <div className="notification-page">
      {/* HEADER */}

      <div className="dashboard-action-page-header">
        <div>
          <h2 className="all-dash-page-title">Notifications</h2>
          <p className="all-dash-page-subtitle">
            {/* Track user actions and system activities */}
            Stay updated with important academy alerts, payments, and
            activities.
          </p>
        </div>
      </div>

      {/* STAT CARDS */}
      {/* <Row className="g-3 mb-4">
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
      </Row> */}

      {/* Loader */}
      {isNotificationLoading ? (
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
          {/* TABLE */}
          <TableToolbar
            search={search}
            setSearch={(value) => {
              setSearch(value);
              setCurrentPage(1);
            }}
            filters={[
              {
                key: "module",
                label: "Module",
                options: moduleOptions,
              },
            ]}
            activeFilters={activeFilters}
            setActiveFilters={(value) => {
              setActiveFilters(value);
              setCurrentPage(1);
            }}
            onClear={handleClearFilters}
            data={filteredData}
            columns={columns}
            exportFileName="notifications"
          />

          <Table
            columns={columns}
            data={paginatedData}
            rowKey="logId"
            actions={(row) => (
              <div className="common-management-action-buttons">
                <button
                  title="Delete Item"
                  onClick={() => handleOpenDelete(row)}
                >
                  <FiTrash2 />
                </button>
              </div>
            )}
          />
        </>
      )}

      {filteredData.length > 0 && (
        <TablePagination
          page={safeCurrentPage}
          totalPages={totalPages}
          totalRecords={filteredData.length}
          pageSize={pageSize}
          onPrevious={() => setCurrentPage((prev) => prev - 1)}
          onNext={() => setCurrentPage((prev) => prev + 1)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        show={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedItem(null);
        }}
        onConfirm={handleDeleteItem}
        title="Delete Notification"
        message="Are you sure you want to delete this notification?"
        confirmText={isDeletingNotification ? "Deleting..." : "Delete"}
        disabled={isDeletingNotification}
      />
    </div>
  );
};

export default Notification;
