import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

// Register
const register = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  return response.data;
};

// Login
const login = async (credentials) => {
  const response = await axios.post(`${API_URL}/login`, credentials);
  return response.data;
};

// Get profile
const getProfile = async (token) => {
  const response = await axios.get(`${API_URL}/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

// Update profile
const updateProfile = async (profileData, token) => {
  const response = await axios.put(
    `${API_URL}/profile`,
    profileData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export default {
  register,
  login,
  getProfile,
  updateProfile,
};