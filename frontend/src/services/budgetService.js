import axios from "axios";

const API_URL = "http://localhost:5000/api/budgets";

const getConfig = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getBudgets = async () => {
  const response = await axios.get(API_URL, getConfig());
  return response.data;
};

export const createBudget = async (budgetData) => {
  const response = await axios.post(
    API_URL,
    budgetData,
    getConfig()
  );

  return response.data;
};

export const updateBudget = async (id, budgetData) => {
  const response = await axios.put(
    `${API_URL}/${id}`,
    budgetData,
    getConfig()
  );

  return response.data;
};

export const deleteBudget = async (id) => {
  const response = await axios.delete(
    `${API_URL}/${id}`,
    getConfig()
  );

  return response.data;
};
