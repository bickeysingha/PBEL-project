import axios from "axios";

const API_URL = "https://pbel-project-bhpm.onrender.com/api/dashboard";

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