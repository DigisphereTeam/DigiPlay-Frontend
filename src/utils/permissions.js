import { getRole } from "../services/auth";

export const canView = () => {
  const role = getRole();

  return role === "ADMIN" || role === "PRIMARY";
};

export const canCreate = () => {
  const role = getRole();

  return role === "PRIMARY";
};

export const canEdit = () => {
  const role = getRole();

  return role === "ADMIN";
};

export const canDelete = () => {
  const role = getRole();

  return role === "ADMIN";
};

export const canApproveBooking = () => {
  const role = getRole();

  return role === "ADMIN";
};

export const canCancelBooking = () => {
  const role = getRole();

  return role === "ADMIN";
};

// Sidebar permission
export const hasRole = (roles = []) => {
  const role = getRole();

  return roles.includes(role);
};
