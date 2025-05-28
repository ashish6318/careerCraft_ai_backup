import axios from 'axios';

// 1. Get the general API root URL from environment variables
//    This will be the base URL for this service directly.
const API_ROOT_URL = import.meta.env.VITE_API_ROOT_URL || 'http://localhost:5000/api/v1';

// 2. Configure axios
const apiClient = axios.create({
  baseURL: API_ROOT_URL, // e.g., http://localhost:5000/api/v1
  withCredentials: true,
});

// --- Seeker Profile ---
const getSeekerProfile = async () => {
  // Calls GET <API_ROOT_URL>/profile/seeker/me
  const response = await apiClient.get('/profile/seeker/me');
  return response.data;
};

const updateSeekerProfile = async (profileData) => {
  // Calls PUT <API_ROOT_URL>/profile/seeker/me
  const response = await apiClient.put('/profile/seeker/me', profileData);
  return response.data;
};

const uploadSeekerResume = async (formData) => {
  // Calls POST <API_ROOT_URL>/profile/seeker/me/resume
  const response = await apiClient.post('/profile/seeker/me/resume', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

const userService = {
  getSeekerProfile,
  updateSeekerProfile,
  uploadSeekerResume,
};

export default userService;
