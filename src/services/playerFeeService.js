import api from "./api";
import { PLAYER_FEE_API } from "../config/apiConfig";

// CREATE - POST
export const createPlayerFee = async (data) => {
  const response = await api.post(PLAYER_FEE_API.CREATE_PLAYER_FEE, data);

  return response.data;
};

// GET ALL - GET
export const getPlayerFees = async () => {
  const response = await api.get(PLAYER_FEE_API.GET_PLAYER_FEES);

  return response.data;
};

// GET BY ID - GET
export const getPlayerFeeById = async (id) => {
  const response = await api.get(PLAYER_FEE_API.GET_PLAYER_FEE_BY_ID(id));

  return response.data;
};

// GET BY PLAYER ID - GET
export const getPlayerFeesByPlayerId = async (playerId) => {
  const response = await api.get(
    PLAYER_FEE_API.GET_PLAYER_FEES_BY_PLAYER_ID(playerId),
  );

  return response.data;
};

// GET STATISTICS - GET
export const getPlayerFeeStatistics = async () => {
  const response = await api.get(PLAYER_FEE_API.GET_PLAYER_FEE_STATISTICS);

  return response.data;
};

// UPDATE - PATCH
export const updatePlayerFee = async (id, data) => {
  const response = await api.patch(PLAYER_FEE_API.UPDATE_PLAYER_FEE(id), data);

  return response.data;
};
