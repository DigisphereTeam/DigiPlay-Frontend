import api from "./api";
import { PLAYER_API } from "../config/apiConfig";

// Get all players
export const getPlayers = async () => {
  const response = await api.get(PLAYER_API.GET_PLAYER);

  return response.data;
};

// Get player by id
export const getPlayerById = async (id) => {
  const response = await api.get(PLAYER_API.GET_PLAYER_BY_ID(id));

  return response.data;
};

// Create player
export const createPlayer = async (data) => {
  const formData = new FormData();

  // Object.entries(data).forEach(([key, value]) => {
  //   if (value !== null && value !== undefined) {
  //     formData.append(key, value);
  //   }
  // });

  Object.entries(data).forEach(([key, value]) => {
    if (value === null || value === undefined) return;

    // Multiple files
    if (key === "document_urls" && Array.isArray(value)) {
      value.forEach((file) => {
        formData.append("document_urls", file);
      });
    } else {
      formData.append(key, value);
    }
  });

  const response = await api.post(PLAYER_API.CREATE_PLAYER, formData);

  return response.data;
};

// Update player
export const updatePlayer = async (id, data) => {
  const formData = new FormData();

  // Object.entries(data).forEach(([key, value]) => {
  //   if (value !== null && value !== undefined) {
  //     formData.append(key, value);
  //   }
  // });

   Object.entries(data).forEach(([key, value]) => {

    if (value === null || value === undefined) return;


    if (key === "document_urls" && Array.isArray(value)) {

      value.forEach((file) => {
        formData.append("document_urls", file);
      });

    } else {

      formData.append(key, value);

    }
     });

  const response = await api.patch(PLAYER_API.UPDATE_PLAYER(id), formData);

  return response.data;
};

// Delete player
// export const deletePlayer = async (id) => {
//   const response = await api.delete(PLAYER_API.DELETE_PLAYER(id));

//   return response.data;
// };

//update player status
export const updatePlayerStatus = async (id, isActive) => {
  const response = await api.patch(PLAYER_API.UPDATE_PLAYER_STATUS(id), {
    is_active: isActive,
  });

  return response.data;
};

export const getPlayersWithTrainers = async () => {
  const response = await api.get(PLAYER_API.GET_PLAYER_TRAINER);

  return response.data;
};
