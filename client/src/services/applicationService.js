import axios from 'axios';

// 1. Get the general API root URL from environment variables
const API_ROOT_URL = import.meta.env.VITE_API_ROOT_URL || 'http://localhost:5000/api/v1';

// 2. Construct the specific base URL for the application service
const APPLICATIONS_SERVICE_BASE_URL = `${API_ROOT_URL}/applications`;

// 3. Create the apiClient with this specific base URL
const apiClient = axios.create({
  baseURL: APPLICATIONS_SERVICE_BASE_URL, // e.g., http://localhost:5000/api/v1/applications
  withCredentials: true,
});

const applyForJob = async (jobId) => {
  const response = await apiClient.post(`/job/${jobId}/apply`);
  return response.data;
};

const getMyApplications = async () => {
  const response = await apiClient.get('/my-applications');
  return response.data;
};

const getJobApplicants = async (jobId) => {
  const response = await apiClient.get(`/job/${jobId}/applicants`);
  return response.data;
};

const updateApplicationStatus = async (applicationId, status) => {
  const response = await apiClient.put(`/${applicationId}/status`, { status });
  return response.data;
};

const applicationService = {
  applyForJob,
  getMyApplications,       // Ensures getMyApplications is exported
  getJobApplicants,
  updateApplicationStatus,
};

export default applicationService;
