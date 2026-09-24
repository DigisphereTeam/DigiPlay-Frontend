import api from "./api";
import { TRAINER_API } from "../config/apiConfig";

export const getTrainers = async () => {
  const response = await api.get(TRAINER_API.GET_TRAINER);

  return response.data;
};

export const createTrainer = async (data) => {
  const response = await api.post(TRAINER_API.CREATE_TRAINER, data);

  return response.data;
};

export const updateTrainer = async (id, data) => {
  const response = await api.patch(TRAINER_API.UPDATE_TRAINER(id), data);

  return response.data;
};

// export const deleteTrainer = async (id) => {
//   const response = await api.delete(TRAINER_API.DELETE_TRAINER(id));

//   return response.data;
// };

// UPDATE STATUS - PATCH
export const updateTrainerStatus = async (id, isActive) => {
  const response = await api.patch(TRAINER_API.UPDATE_TRAINER_STATUS(id), {
    is_active: isActive,
  });

  return response.data;
};
