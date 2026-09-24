import api from "./api";
import { EXPENDITURE_API } from "../config/apiConfig";

export const createExpenditure = async (data) => {
  const response = await api.post(EXPENDITURE_API.CREATE_EXPENDITURE, data);

  return response.data;
};

export const getExpenditures = async () => {
  const response = await api.get(EXPENDITURE_API.GET_EXPENDITURES);

  return response.data;
};

export const updateExpenditure = async (id, data) => {
  const response = await api.patch(
    EXPENDITURE_API.UPDATE_EXPENDITURE(id),
    data,
  );

  return response.data;
};
