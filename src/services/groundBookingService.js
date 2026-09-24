import api from "./api";
import { GROUND_BOOKING_API } from "../config/apiConfig";

export const createGroundBooking = async (data) => {
  const response = await api.post(
    GROUND_BOOKING_API.CREATE_GROUND_BOOKING,
    data,
  );

  return response.data;
};

export const getGroundBookings = async () => {
  const response = await api.get(GROUND_BOOKING_API.GET_GROUND_BOOKINGS);

  return response.data;
};

export const getMonthlyGroundSlots = async (month, year) => {
  const response = await api.get(GROUND_BOOKING_API.GET_MONTHLY_GROUND_SLOTS, {
    params: {
      month,
      year,
    },
  });

  return response.data;
};

export const updateGroundBooking = async (id, data) => {
  const response = await api.patch(
    GROUND_BOOKING_API.UPDATE_GROUND_BOOKING(id),
    data,
  );

  return response.data;
};

export const updateGroundBookingStatus = async (id, data) => {
  const response = await api.patch(
    GROUND_BOOKING_API.UPDATE_GROUND_BOOKING(id),
    data,
  );

  return response.data;
};
