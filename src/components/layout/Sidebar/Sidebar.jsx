import { FiX } from "react-icons/fi";

import { NavLink, useNavigate } from "react-router-dom";

import { getFullName, getUser, removeToken } from "../../../services/auth";
import { hasRole } from "../../../utils/permissions";
import { initialsFromName } from "../../../utils/initialsFromName";

import sidebarLogo from "../../../assets/images/digi-play-logo.png";
import logoutIcon from "../../../assets/icons/logout.png";

// latest iconse
import dashIcon1 from "../../../assets/icons/dash-icon1.svg";
import dashIcon2 from "../../../assets/icons/dash-icon2.svg";
import dashIcon3 from "../../../assets/icons/dash-icon3.svg";
import dashIcon4 from "../../../assets/icons/dash-icon4.svg";
// import dashIcon5 from "../../../assets/icons/dash-icon5.svg";
import dashIcon6 from "../../../assets/icons/dash-icon6.svg";
import dashIcon7 from "../../../assets/icons/dash-icon7.svg";
import dashIcon8 from "../../../assets/icons/dash-icon8.svg";
import dashIcon9 from "../../../assets/icons/dash-icon9.svg";
import dashIcon10 from "../../../assets/icons/dash-icon10.svg";
// import dashIcon11 from "../../assets/icons/dash-icon11.svg";
// import dashIcon12 from "../../assets/icons/dash-icon12.svg";
import dashIcon13 from "../../../assets/icons/dash-icon13.svg";
import dashIcon14 from "../../../assets/icons/dash-icon14.svg";
import dashIcon15 from "../../../assets/icons/dash-icon15.svg";
import dashIcon16 from "../../../assets/icons/dash-icon16.svg";

import "./Sidebar.css";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();

  const user = getUser();
  const fullName = getFullName() || "";

  const menuItems = [
    {
      title: "Dashboard",
      path: "/management/dashboard",
      icon: dashIcon1,
      roles: ["ADMIN"],
    },
    {
      title: "Player Management",
      path: "/management/player-management",
      icon: dashIcon2,
      roles: ["ADMIN", "PRIMARY"],
    },
    {
      title: "Fee Renewals",
      path: "/management/fee-renewals",
      icon: dashIcon8,
      roles: ["ADMIN", "PRIMARY"],
    },
    {
      title: "Personal Training",
      path: "/management/personal-training",
      icon: dashIcon6,
      roles: ["ADMIN", "PRIMARY"],
    },
    {
      title: "Attendance",
      path: "/management/attendance",
      icon: dashIcon7,
      roles: ["ADMIN", "PRIMARY"],
    },
    {
      title: "Ground Bookings",
      path: "/management/ground-booking",
      icon: dashIcon10,
      roles: ["ADMIN", "PRIMARY"],
    },
    {
      title: "Trainer Management",
      path: "/management/trainer-management",
      icon: dashIcon3,
      roles: ["ADMIN"],
    },
    {
      title: "Staff Management",
      path: "/management/staff-management",
      icon: dashIcon4,
      roles: ["ADMIN"],
    },
    {
      title: "Expenditure",
      path: "/management/expenditure-management",
      icon: dashIcon16,
      roles: ["ADMIN"],
    },
    {
      title: "Salary Management",
      path: "/management/salary-management",
      icon: dashIcon9,
      roles: ["ADMIN"],
    },
    {
      title: "Reports",
      path: "/management/reports",
      icon: dashIcon13,
      roles: ["ADMIN"],
    },
    {
      title: "Primary Registration",
      path: "/management/registration",
      icon: dashIcon15,
      roles: ["ADMIN"],
    },
    {
      title: "Notifications",
      path: "/management/notifications",
      icon: dashIcon14,
      roles: ["ADMIN", "PRIMARY"],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) => hasRole(item.roles));

  const handleLogout = () => {
    removeToken();

    navigate("/signin");
  };

  return (
    <>
      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          // onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`sidebar-section ${sidebarOpen ? "show" : ""}`}>
        {/* Logo container with bottom border separating menu */}
        <div 
          className="sidebar-logo" 
          style={{ 
            borderBottom: "1px solid #e5e7eb", 
            paddingBottom: "15px", 
            marginBottom: "15px" 
          }}
        >
          <img 
            src={sidebarLogo} 
            alt="KK Global Cricket Academy" 
            style={{ maxWidth: "100%", height: "auto", objectFit: "contain" }} 
          />

          {/* Close button */}
          <button
            className="sidebar-close-btn"
            onClick={() => setSidebarOpen(false)}
          >
            <FiX />
          </button>
        </div>

        {/* Search */}
        <div className="sidebar-search">
          {/* <FaSearch className="sidebar-search-icon" />

          <Form.Control
            type="text"
            placeholder="Search..."
            className="sidebar-search-input"
          /> */}
        </div>

        {/* Menu */}
        <div className="sidebar-menu-section">
          {filteredMenuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive
                  ? "sidebar-navigate-link active"
                  : "sidebar-navigate-link"
              }
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sidebar-icon">
                <img src={item.icon} alt={item.title} />
              </span>

              <span>{item.title}</span>
            </NavLink>
          ))}
        </div>

        <div className="sidebar-footer">
          <button className="sidebar-footer-logout-btn" onClick={handleLogout}>
            <div className="sidebar-footer-logout-user">
              <div className="sidebar-footer-logout-avatar">
                {initialsFromName(fullName)}
              </div>

              <div className="sidebar-footer-logout-user-details">
                <h5>{fullName || "User"}</h5>

                <p>{user?.role || "Role"}</p>
              </div>
            </div>

            <img
              src={logoutIcon}
              alt="Logout"
              className="sidebar-footer-logout-icon"
            />
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;