import api from "./api";
import { NOTIFICATION_API } from "../config/apiConfig";

export const getAllNotifications = async () => {
  const response = await api.get(NOTIFICATION_API.GET_NOTIFICATION);

  return response.data;
};

export const deleteNotifications = async (id) => {
  const response = await api.delete(NOTIFICATION_API.DELETE_NOTIFICATION(id));

  return response.data;
};
