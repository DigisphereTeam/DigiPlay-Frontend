import api from "./api";
import { REPORTS_API } from "../config/apiConfig";

export const getReportsData = async (mainTab, subTab, params = {}) => {
  let url = "";

  if (mainTab === "player") {
    url =
      subTab === "playerwise"
        ? REPORTS_API.GET_ALL_PLAYERS
        : REPORTS_API.GET_MONTHLY_PLAYERS;
  } else if (mainTab === "trainer") {
    url =
      subTab === "playerwise"
        ? REPORTS_API.GET_ALL_TRAINERS
        : REPORTS_API.GET_MONTHLY_TRAINERS;
  } else if (mainTab === "staff") {
    url =
      subTab === "playerwise"
        ? REPORTS_API.GET_ALL_STAFF
        : REPORTS_API.GET_MONTHLY_STAFF;
  }

  const cleanParams = {};

  if (params.search) cleanParams.search = params.search;
  if (params.from_date) cleanParams.from_date = params.from_date;
  if (params.to_date) cleanParams.to_date = params.to_date;

  const response = await api.get(url, {
    params: cleanParams,
  });

  return response.data;
};

// Employee statistics
export const getEmployeeStatistics = async (employeeType, fromDate, toDate) => {
  const response = await api.get(REPORTS_API.GET_EMPLOYEE_STATISTICS, {
    params: {
      employee_type: employeeType,
      from_date: fromDate,
      to_date: toDate,
    },
  });

  return response.data;
};
