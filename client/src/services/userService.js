import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/v1'; // Base API URL

// Configure axios to send credentials (cookies) with requests
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// --- Seeker Profile ---
// Get the logged-in seeker's profile
const getSeekerProfile = async () => {
  const response = await apiClient.get('/profile/seeker/me'); // GET /api/v1/profile/seeker/me
  return response.data;
};

// Update the logged-in seeker's profile (textual data)
const updateSeekerProfile = async (profileData) => {
  const response = await apiClient.put('/profile/seeker/me', profileData); // PUT /api/v1/profile/seeker/me
  return response.data;
};

// We will add functions for resume and photo uploads here later:
const uploadSeekerResume = async (formData) => {
  // When sending FormData, axios usually sets the Content-Type header correctly.
  // The backend route is POST /api/v1/profile/seeker/me/resume
  const response = await apiClient.post('/profile/seeker/me/resume', formData, {
    headers: {
      'Content-Type': 'multipart/form-data', // Explicitly set, though often not needed with FormData
    },
  });
  return response.data; // Should return { message, resumeUrl, resumeFileName } or updated user
};
// const uploadSeekerResume = async (formData) => { ... };
// const uploadSeekerProfilePhoto = async (formData) => { ... };


const userService = {
  getSeekerProfile,
  updateSeekerProfile,
  uploadSeekerResume,
  // uploadSeekerProfilePhoto, (uncomment when ready)
};

export default userService;
