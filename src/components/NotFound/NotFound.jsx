import pageNotFoundIcon from "../../assets/images/kk-not-found.png";

import "./NotFound.css";

const NotFound = () => {
  return (
    <div className="not-found">
      <img
        src={pageNotFoundIcon}
        alt="Page Not Found"
        className="not-found-image"
      />

      <h2 className="not-found-title">Oops! Page Not Found</h2>

      <p className="not-found-description">
        The page you are looking for doesn't exist or may have been moved.
      </p>
    </div>
  );
};

export default NotFound;
