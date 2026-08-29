import axios from "axios";

const API_URL = "https://pbel-project-bhpm.onrender.com/api/reports";

const getConfig = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getReportsData = async () => {
  const response = await axios.get(API_URL, getConfig());
  return response.data;
};