import api from "./api";
import { PROFILE_API } from "../config/apiConfig";

export const getProfile = async () => {
  const response = await api.get(PROFILE_API.GET);
  
  return response.data;
};
