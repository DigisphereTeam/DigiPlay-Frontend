import api from "./api";
import { REGISTRATION_API } from "../config/apiConfig";

export const createRegistration = async (data) => {
  const response = await api.post(REGISTRATION_API.CREATE_REGISTRATION, data);

  return response.data;
};

export const getRegistration = async () => {
  const response = await api.get(REGISTRATION_API.GET_REGISTRATION);

  return response.data;
};

export const updateRegistration = async (id, data) => {
  const response = await api.patch(
    REGISTRATION_API.UPDATE_REGISTRATION(id),
    data,
  );

  return response.data;
};

export const deleteRegistration = async (id) => {
  const response = await api.delete(REGISTRATION_API.DELETE_REGISTRATION(id));

  return response.data;
};
