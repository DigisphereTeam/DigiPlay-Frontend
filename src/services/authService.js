// Login API function
import api from "./api";
import { AUTH_API } from "../config/apiConfig";

export const authService = async (data) => {
  const response = await api.post(AUTH_API.SIGNIN, data);

  return response.data;
};
