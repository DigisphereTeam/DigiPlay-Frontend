import { useState, useEffect } from "react";
import {
  FiMenu,
  // FiSearch,
  FiBell,
  FiChevronDown,
  FiUser,
  // FiSettings,
  FiLogOut,
} from "react-icons/fi";

import { Link, useNavigate } from "react-router-dom";

import { getFullName, getUser, removeToken } from "../../../services/auth";
import { initialsFromName } from "../../../utils/initialsFromName";
import { getAllNotifications } from "../../../services/notificationService";

import toast from "react-hot-toast";
import { ThreeDots } from "react-loader-spinner";

import "./Header.css";

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

const Header = ({ onMenuClick }) => {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [isNotificationLoading, setIsNotificationLoading] = useState(true);

  const navigate = useNavigate();

  const user = getUser();
  const fullName = getFullName() || "";

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsNotificationLoading(true);
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

          setNotifications(formattedData);
        } else {
          toast.error(response.message);
        }
      } catch (error) {
        console.error("Get Notification Error:", error);
        toast.error(error.response?.data?.message);
      } finally {
        setIsNotificationLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const latestNotifications = notifications.slice(0, 7);

  const handleLogout = () => {
    removeToken();

    navigate("/signin");
  };

  const handleNotificationClick = (item) => {
    setNotificationOpen(false);

    switch (item.module) {
      case "Player":
        navigate("/management/player-management");
        break;

      case "Coach":
        navigate("/management/trainer-management");
        break;

      case "One-on-One Training":
        navigate("/management/personal-training");
        break;

      case "Player Fee":
        navigate("/management/fee-renewals");
        break;

      case "Ground Booking":
        navigate("/management/ground-booking");
        break;

      case "Expenditure":
        navigate("/management/expenditure-management");
        break;

      default:
        navigate("/management/notifications");
        break;
    }
  };

  return (
    <header className="header-main-section">
      {/* Mobile Menu */}
      <button className="header-mobile-menu" onClick={onMenuClick}>
        <FiMenu />
      </button>

      {/* Search */}
      {/* <div className="header-search-box">
        <FiSearch />
        <input
          type="text"
          placeholder="Search students, trainers, bookings..."
          className="header-search-box-input"
        />
      </div> */}

      <div className="header-actions">
        {/* Notification */}
        <div className="header-dropdown">
          <button
            className="header-action-btn"
            onClick={() => {
              setNotificationOpen(!notificationOpen);
              setProfileOpen(false);
            }}
          >
            <FiBell />

            {notifications.length > 0 && (
              <span className="header-notification-count">
                {notifications.length > 99 ? "99+" : notifications.length}
              </span>
            )}
          </button>

          {notificationOpen && (
            <div className="header-notification-dropdown">
              <div className="notification-header">
                <h6>Notifications</h6>

                <Link
                  to="/management/notifications"
                  onClick={() => setNotificationOpen(false)}
                >
                  View All
                </Link>
              </div>

              <div className="header-notification-body">
                {isNotificationLoading ? (
                  <div className="ui-common-loader">
                    <ThreeDots
                      height="20"
                      width="40"
                      color="#057DCD"
                      ariaLabel="loading"
                    />
                  </div>
                ) : latestNotifications.length > 0 ? (
                  latestNotifications.map((item) => (
                    <div
                      className="header-notification-item"
                      key={item.logId}
                      onClick={() => handleNotificationClick(item)}
                    >
                      <p>{item.description}</p>

                      <span>
                        {item.module} • {item.action} • {item.date}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="header-notification-empty">
                    No notifications found.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="header-dropdown">
          <button
            className="header-profile-dropdown-btn"
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotificationOpen(false);
            }}
          >
            <div className="header-profile-avatar">
              {initialsFromName(fullName)}
            </div>

            <div className="header-profile-details">
              {/* <h6>Academy Admin</h6>
              <p>Operations Manager</p> */}
              <h6>{fullName || "User"}</h6>

              <p>{user?.role}</p>
            </div>

            <FiChevronDown className="header-profile-arrow" />
          </button>

          {profileOpen && (
            <div className="header-profile-menu">
              {user?.role === "PRIMARY" && (
                <Link to="/management/profile" onClick={() => setProfileOpen(false)}>
                  <FiUser />
                  My Profile
                </Link>
              )}

              {/* <Link to="/settings">
                <FiSettings />
                Settings
              </Link> */}

              <button onClick={handleLogout}>
                <FiLogOut />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
