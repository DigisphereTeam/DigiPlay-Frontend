import { Link, useLocation } from "react-router-dom";

import { FiHome, FiChevronRight } from "react-icons/fi";

import { getUser } from "../../../services/auth";

import "./Breadcrumb.css";

const Breadcrumb = () => {
  const { pathname } = useLocation();

  const user = getUser();

  const homePath =
    user?.role === "ADMIN" ? "/management/dashboard" : "/management/player-management";

  const pathNames = pathname
    .split("/")
    .filter(Boolean)
    .filter((item) => item !== "management");

  return (
    <div className="breadcrumb-main-section">
      <Link to={homePath} className="breadcrumb-home">
        <FiHome />
      </Link>

      {pathNames.map((item, index) => (
        <div className="breadcrumb-item" key={item}>
          <FiChevronRight className="breadcrumb-arrow" />

          <span className={index === pathNames.length - 1 ? "active" : ""}>
            {item
              .replace("-", " ")
              .replace(/\b\w/g, (char) => char.toUpperCase())}
          </span>
        </div>
      ))}
    </div>
  );
};

export default Breadcrumb;
