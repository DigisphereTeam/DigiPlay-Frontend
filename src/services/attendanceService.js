import api from "./api";
import { ATTENDANCE_API } from "../config/apiConfig";

// GET /attendance?employee_type=Staff
export const getAttendanceByType = async (params = {}) => {
  const response = await api.get(ATTENDANCE_API.GET_ATTENDANCE_BY_TYPE, {
    params,
  });

  return response.data;
};

// GET /attendance/monthly-summary?employee_type=Staff&employee_id=1
// GET /attendance/monthly-summary?employee_type=Player&employee_id=1
// GET /attendance/monthly-summary?employee_type=Coach&employee_id=1
export const getMonthlyAttendance = async (params = {}) => {
  const response = await api.get(ATTENDANCE_API.GET_MONTHLY_ATTENDANCE, {
    params,
  });

  return response.data;
};

// GET attendance/timeline?employee_type=Player&employee_id=3&from_date=2026-07-01&to_date=2026-08-07
export const getAttendanceTimeline = async (params = {}) => {
  const response = await api.get(ATTENDANCE_API.GET_ATTENDANCE_TIMELINE, {
    params,
  });

  return response.data;
};
