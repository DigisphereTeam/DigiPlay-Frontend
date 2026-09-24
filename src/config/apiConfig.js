export const BASE_URL = "https://kk-global-cricket-academy-api.onrender.com";


//Admin and Primary signin
export const AUTH_API = {
  SIGNIN: `${BASE_URL}/auth/signin`,
};

export const DASHBOARD_API = {
  GET_OVERVIEW: `${BASE_URL}/dashboard/overview`,
  GET_CHARTS: `${BASE_URL}/dashboard/charts`,
  GET_REVENUE_ACTIVITIES: `${BASE_URL}/dashboard/revenue-activities`,
};

export const PLAYER_API = {
  CREATE_PLAYER: `${BASE_URL}/players`,
  GET_PLAYER: `${BASE_URL}/players`,
  GET_PLAYER_BY_ID: (id) => `${BASE_URL}/players/${id}`,
  UPDATE_PLAYER: (id) => `${BASE_URL}/players/${id}`,
  // DELETE_PLAYER: (id) => `${BASE_URL}/players/${id}`,
  UPDATE_PLAYER_STATUS: (id) => `${BASE_URL}/players/${id}/status`,

  GET_PLAYER_TRAINER: `${BASE_URL}/players/players-coaches`,
};

export const TRAINER_API = {
  CREATE_TRAINER: `${BASE_URL}/coaches`,
  GET_TRAINER: `${BASE_URL}/coaches`,
  UPDATE_TRAINER: (id) => `${BASE_URL}/coaches/${id}`,
  // DELETE_TRAINER: (id) => `${BASE_URL}/coaches/${id}`,
  UPDATE_TRAINER_STATUS: (id) => `${BASE_URL}/coaches/${id}/status`,
};

export const STAFF_API = {
  GET_STAFF: `${BASE_URL}/staff`,
  CREATE_STAFF: `${BASE_URL}/staff`,
  UPDATE_STAFF: (id) => `${BASE_URL}/staff/${id}`,
  // DELETE_STAFF: (id) => `${BASE_URL}/staff/${id}`,
  UPDATE_STAFF_STATUS: (id) => `${BASE_URL}/staff/${id}/status`,
};

export const ONEONONE_API = {
  CREATE_ONEONONE: `${BASE_URL}/one-on-one-applications`,
  GET_ONEONONE: `${BASE_URL}/one-on-one-applications`,
  GET_ONEONONE_ID: (id) =>
    `${BASE_URL}/one-on-one-applications/players/${id}/applications`,
  RENEW_ONEONONE: (id) => `${BASE_URL}/one-on-one-applications/${id}/renew`,
  CANCEL_ONEONONE: (id) => `${BASE_URL}/one-on-one-applications/${id}/cancel`,
  // UPDATE APPLICATION
  UPDATE_ONEONONE: (id) => `${BASE_URL}/one-on-one-applications/${id}`,
  // UPDATE STATUS
  UPDATE_ONEONONE_STATUS: (id) =>
    `${BASE_URL}/one-on-one-applications/${id}/status`,
};

export const ATTENDANCE_API = {
  // Get Attendance By Student, Trainer, Staff Type
  GET_ATTENDANCE_BY_TYPE: `${BASE_URL}/attendance`,

  // Get Monthly Attendance Summary
  GET_MONTHLY_ATTENDANCE: `${BASE_URL}/attendance/monthly-summary`,

  // Get Attendance Timeline
  GET_ATTENDANCE_TIMELINE: `${BASE_URL}/attendance/timeline`,
};

export const PLAYER_FEE_API = {
  CREATE_PLAYER_FEE: `${BASE_URL}/player-fees`,
  GET_PLAYER_FEES: `${BASE_URL}/player-fees`,
  GET_PLAYER_FEE_BY_ID: (id) => `${BASE_URL}/player-fees/${id}`, //handle Receipt
  GET_PLAYER_FEES_BY_PLAYER_ID: (playerId) =>
    `${BASE_URL}/player-fees/player/${playerId}`,
  GET_PLAYER_FEE_STATISTICS: `${BASE_URL}/player-fees/statistics`,

  // UPDATE
  UPDATE_PLAYER_FEE: (id) => `${BASE_URL}/player-fees/${id}`,
};

export const EMPLOYEE_SALARY_API = {
  // Get Eligible Employees For Salary Payment
  GET_ELIGIBLE_EMPLOYEES: `${BASE_URL}/employee-salaries/eligible-employees`,
  // First time create salary record
  CREATE_EMPLOYEE_SALARY: `${BASE_URL}/employee-salaries`,
  // Get Salaries By Employee Type
  GET_EMPLOYEE_SALARIES_BY_TYPE: `${BASE_URL}/employee-salaries`,
  // Get Salary History By Staff ID
  GET_SALARY_HISTORY: `${BASE_URL}/employee-salaries/history`,
  // Update Salary By ID
  UPDATE_EMPLOYEE_SALARY: (id) => `${BASE_URL}/employee-salaries/${id}`,
  // Pay pending salary
  CREDIT_EMPLOYEE_SALARY: (id) => `${BASE_URL}/employee-salaries/credit/${id}`,
};

export const GROUND_BOOKING_API = {
  CREATE_GROUND_BOOKING: `${BASE_URL}/ground-bookings`,
  GET_GROUND_BOOKINGS: `${BASE_URL}/ground-bookings`,

  GET_MONTHLY_GROUND_SLOTS: `${BASE_URL}/ground-bookings/monthly-slots`,
  UPDATE_GROUND_BOOKING: (id) => `${BASE_URL}/ground-bookings/${id}`,
};

export const EXPENDITURE_API = {
  CREATE_EXPENDITURE: `${BASE_URL}/expenditures`,
  GET_EXPENDITURES: `${BASE_URL}/expenditures`,
  UPDATE_EXPENDITURE: (id) => `${BASE_URL}/expenditures/${id}`,
};

// Reports
export const REPORTS_API = {
  GET_ALL_PLAYERS: `${BASE_URL}/reports/player-wise`,
  GET_MONTHLY_PLAYERS: `${BASE_URL}/reports/player-monthly`,

  GET_ALL_TRAINERS: `${BASE_URL}/reports/trainer-wise`,
  GET_MONTHLY_TRAINERS: `${BASE_URL}/reports/trainer-monthly`,

  GET_ALL_STAFF: `${BASE_URL}/reports/staff-wise`,
  GET_MONTHLY_STAFF: `${BASE_URL}/reports/staff-monthly`,

  GET_EMPLOYEE_STATISTICS: `${BASE_URL}/reports/employee/statistics`,
};

export const REGISTRATION_API = {
  CREATE_REGISTRATION: `${BASE_URL}/users/primary`,
  GET_REGISTRATION: `${BASE_URL}/users`,
  UPDATE_REGISTRATION: (id) => `${BASE_URL}/users/${id}`,
  DELETE_REGISTRATION: (id) => `${BASE_URL}/users/${id}`,
};

// Notification
export const NOTIFICATION_API = {
  GET_NOTIFICATION: `${BASE_URL}/notifications`,
  DELETE_NOTIFICATION: (id) => `${BASE_URL}/notifications/${id}`,
};

export const PROFILE_API = {
  GET: `${BASE_URL}/users/profile`,
};
