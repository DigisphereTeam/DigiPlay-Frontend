import api from "./api";
import { STAFF_API } from "../config/apiConfig";

export const getStaffs = async () => {
  const response = await api.get(STAFF_API.GET_STAFF);

  return response.data;
};

export const createStaff = async (data) => {
  const response = await api.post(STAFF_API.CREATE_STAFF, data);

  return response.data;
};

export const updateStaff = async (id, data) => {
  const response = await api.patch(STAFF_API.UPDATE_STAFF(id), data);

  return response.data;
};

// export const deleteStaff = async (id) => {
//   const response = await api.delete(STAFF_API.DELETE_STAFF(id));

//   return response.data;
// };


// UPDATE STATUS - PATCH
export const updateStaffStatus = async (id, isActive) => {
  const response = await api.patch(STAFF_API.UPDATE_STAFF_STATUS(id), {
    is_active: isActive,
  });
 
  return response.data;
};