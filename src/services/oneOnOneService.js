import api from "./api";
import { ONEONONE_API } from "../config/apiConfig";

// CREATE - POST
export const createOneOnOne = async (data) => {
  const response = await api.post(ONEONONE_API.CREATE_ONEONONE, data);

  return response.data;
};

// GET ALL - GET
export const getOneOnOne = async () => {
  const response = await api.get(ONEONONE_API.GET_ONEONONE);

  return response.data;
};

// GET BY PLAYER ID - GET
export const getOneOnOneByPlayerId = async (id) => {
  const response = await api.get(ONEONONE_API.GET_ONEONONE_ID(id));

  return response.data;
};

// RENEW - POST
export const renewOneOnOne = async (id, data) => {
  const response = await api.post(ONEONONE_API.RENEW_ONEONONE(id), data);

  return response.data;
};

// CANCEL - PATCH
export const cancelOneOnOne = async (id) => {
  const response = await api.patch(ONEONONE_API.CANCEL_ONEONONE(id));

  return response.data;
};

// UPDATE APPLICATION - PATCH
export const updateOneOnOne = async (id, data) => {
  const response = await api.patch(ONEONONE_API.UPDATE_ONEONONE(id), data);

  return response.data;
};

// UPDATE STATUS - PATCH
export const updateOneOnOneStatus = async (id, data) => {
  const response = await api.patch(
    ONEONONE_API.UPDATE_ONEONONE_STATUS(id),
    data,
  );

  return response.data;
};
