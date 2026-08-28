import axios from "axios";

const API_URL = "http://localhost:5000/api/reports";

export const getReportsData = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};