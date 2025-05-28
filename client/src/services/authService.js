import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1/auth';

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

const register = async (userData) => { // This is for seekers
  const response = await apiClient.post('/register', userData);
  return response.data;
};

const registerRecruiter = async (userData) => { // New function for recruiters
  const response = await apiClient.post('/register-recruiter', userData);
  return response.data;
};

const login = async (userData) => {
  const response = await apiClient.post('/login', userData);
  return response.data;
};

const logout = async () => {
  const response = await apiClient.post('/logout');
  return response.data;
};

const getCurrentUser = async () => {
  const response = await apiClient.get('/me');
  return response.data;
};
// Request a password reset link
const forgotPassword = async (email) => {
  const response = await apiClient.post('/forgot-password', { email });
  return response.data; // Expected: { message: "..." }
};

// Reset password using the token
const resetPassword = async (token, password) => {
  const response = await apiClient.put(`/reset-password/${token}`, { password });
  return response.data; // Expected: { message: "..." }
};

const authService = {
  register,
  registerRecruiter, // Add new function here
  login,
  logout,
  getCurrentUser,
  forgotPassword,  // Add new function
  resetPassword,
};

export default authService;
