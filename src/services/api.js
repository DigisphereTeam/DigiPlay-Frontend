// Axios setup + token sending
import axios from "axios";
import toast from "react-hot-toast";
import { getToken, removeToken } from "./auth";

import { BASE_URL } from "../config/apiConfig";

const api = axios.create({
  baseURL: BASE_URL,
});

// Attach token automatically
api.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers = config.headers || {};

      config.headers.Authorization = `Bearer ${token}`;
    }

    // Handle file uploads
    if (config.data instanceof FormData) {
      config.headers = config.headers || {};

      config.headers["Content-Type"] = "multipart/form-data";
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Handle token expiry
api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    if (error.response?.status === 401) {
      const message = error.response?.data?.message;

      toast.error(message);

      // remove expired token
      removeToken();

      // Redirect after showing the message
      setTimeout(() => {
        window.location.href = "/signin";
      }, 1000);
    }

    return Promise.reject(error);
  },
);

export default api;
