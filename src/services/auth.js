// Token storage, decode, role
import { jwtDecode } from "jwt-decode";

export const saveToken = (token) => {
  localStorage.setItem("token", token);
};

export const getToken = () => {
  return localStorage.getItem("token");
};

export const getFullName = () => {
  return localStorage.getItem("full_name");
};

export const removeToken = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("full_name");
};

export const getUser = () => {
  const token = getToken();

  if (!token) {
    return null;
  }

  try {
    return jwtDecode(token);
  } catch {
    removeToken();
    return null;
  }
};

export const getRole = () => {
  const user = getUser();

  return user?.role || null;
};

export const isLoggedIn = () => {
  return Boolean(getToken());
};
