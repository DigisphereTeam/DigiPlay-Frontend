import api from "./api";
import { DASHBOARD_API } from "../config/apiConfig";

export const getAllDashboardStats = async () => {
  const response = await api.get(DASHBOARD_API.GET_OVERVIEW);

  return response.data;
};

export const getDashboardCharts = async () => {
  const response = await api.get(DASHBOARD_API.GET_CHARTS);

  return response.data;
};

export const getRevenueActivities = async () => {
  const response = await api.get(DASHBOARD_API.GET_REVENUE_ACTIVITIES);

  return response.data;
};
