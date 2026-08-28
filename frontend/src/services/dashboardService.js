import axios from "axios";

const API_URL = "http://localhost:5000/api/dashboard";

const getConfig = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getDashboardData = async () => {
  const response = await axios.get(API_URL, getConfig());
  return response.data;
};