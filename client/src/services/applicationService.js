import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/v1/applications';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

const applyForJob = async (jobId) => {
  const response = await apiClient.post(`/job/${jobId}/apply`);
  return response.data;
};

// Function to get all applications for the logged-in seeker
const getMyApplications = async () => {
  const response = await apiClient.get('/my-applications'); // GET /api/v1/applications/my-applications
  return response.data;
};

// Function to get all applicants for a specific job (for recruiters)
const getJobApplicants = async (jobId) => {
  // GET /api/v1/applications/job/:jobId/applicants
  const response = await apiClient.get(`/job/${jobId}/applicants`);
  return response.data;
};

// Function to update the status of an application (for recruiters)
const updateApplicationStatus = async (applicationId, status) => {
  // PUT /api/v1/applications/:applicationId/status
  const response = await apiClient.put(`/${applicationId}/status`, { status }); // Send { status: "newStatus" } in body
  return response.data; // Expected: { message, application }
};

const applicationService = {
  applyForJob,
  getMyApplications,
  getJobApplicants,         // Add new function
  updateApplicationStatus,  // Add new function
};

export default applicationService;

