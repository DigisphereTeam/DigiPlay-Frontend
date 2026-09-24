import api from "./api";
import { EMPLOYEE_SALARY_API } from "../config/apiConfig";

// Create Salary Payment
export const createEmployeeSalary = async (data) => {
  const response = await api.post(
    EMPLOYEE_SALARY_API.CREATE_EMPLOYEE_SALARY,
    data,
  );

  return response.data;
};

// GET /employee-salaries/eligible-employees?employee_type=Coach&payment_date=2026-10-07
export const getEligibleEmployees = async (params = {}) => {
  const response = await api.get(EMPLOYEE_SALARY_API.GET_ELIGIBLE_EMPLOYEES, {
    params,
  });

  return response.data;
};

// GET /employee-salaries?employee_type=Coach
export const getEmployeeSalariesByType = async (params = {}) => {
  const response = await api.get(
    EMPLOYEE_SALARY_API.GET_EMPLOYEE_SALARIES_BY_TYPE,
    {
      params,
    },
  );

  return response.data;
};

// GET /employee-salaries/history?staff_id=1
// GET /employee-salaries/history?coach_id=1
export const getSalaryHistory = async (params = {}) => {
  const response = await api.get(EMPLOYEE_SALARY_API.GET_SALARY_HISTORY, {
    params,
  });

  return response.data;
};

// PATCH /employee-salaries/5
export const updateEmployeeSalary = async (id, data) => {
  const response = await api.patch(
    EMPLOYEE_SALARY_API.UPDATE_EMPLOYEE_SALARY(id),
    data,
  );

  return response.data;
};

// POST /employee-salaries/credit/:id
export const creditEmployeeSalary = async (id, data) => {
  const response = await api.post(
    EMPLOYEE_SALARY_API.CREDIT_EMPLOYEE_SALARY(id),
    data,
  );

  return response.data;
};
