import axios from 'axios';

// 1. Get the general API root URL from environment variables
const API_ROOT_URL = import.meta.env.VITE_API_ROOT_URL || 'http://localhost:5000/api/v1';

// 2. Construct the specific base URL for the Auth service
const AUTH_SERVICE_BASE_URL = `${API_ROOT_URL}/auth`;

// 3. Create the apiClient
const apiClient = axios.create({
  baseURL: AUTH_SERVICE_BASE_URL, // e.g., http://localhost:5000/api/v1/auth
  withCredentials: true,
});

const register = async (userData) => {
  const response = await apiClient.post('/register', userData);
  return response.data;
};

const registerRecruiter = async (userData) => {
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

const forgotPassword = async (email) => {
  const response = await apiClient.post('/forgot-password', { email });
  return response.data;
};

const resetPassword = async (token, password) => {
  const response = await apiClient.put(`/reset-password/${token}`, { password });
  return response.data;
};

const authService = {
  register,
  registerRecruiter,
  login,
  logout,
  getCurrentUser,
  forgotPassword,
  resetPassword,
};

export default authService;
