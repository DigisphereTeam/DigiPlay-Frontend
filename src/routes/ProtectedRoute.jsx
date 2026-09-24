import { Navigate } from "react-router-dom";
import { isLoggedIn, getRole } from "../services/auth";

const ProtectedRoute = ({ children, allowedRoles }) => {
  // Check login
  if (!isLoggedIn()) {
    return <Navigate to="/signin" replace />;
  }

  // Check role
  const role = getRole();

  if (!role) {
    return <Navigate to="/signin" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/management/not-found" replace />;
  }

  return children;
};

export default ProtectedRoute;
