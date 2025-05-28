import axios from 'axios';

// 1. Get the general API root URL from environment variables
const API_ROOT_URL = import.meta.env.VITE_API_ROOT_URL || 'http://localhost:5000/api/v1';

// 2. Construct the specific base URL for the Jobs service
const JOBS_SERVICE_BASE_URL = `${API_ROOT_URL}/jobs`;

// 3. Configure axios
const apiClient = axios.create({
  baseURL: JOBS_SERVICE_BASE_URL, // e.g., http://localhost:5000/api/v1/jobs
  withCredentials: true,
});

const createJob = async (jobData) => {
  const response = await apiClient.post('/', jobData);
  return response.data;
};

const getRecruiterJobs = async () => {
  const response = await apiClient.get('/my-jobs');
  return response.data;
};

const getAllOpenJobs = async (filters = {}) => {
  const response = await apiClient.get('/', { params: filters });
  return response.data;
};

const getJobById = async (jobId) => {
  const response = await apiClient.get(`/${jobId}`);
  return response.data;
};

const updateJob = async (jobId, jobData) => {
  const response = await apiClient.put(`/${jobId}`, jobData);
  return response.data;
};

const deleteJob = async (jobId) => {
  const response = await apiClient.delete(`/${jobId}`);
  return response.data;
};

const jobService = {
  createJob,
  getRecruiterJobs,
  getAllOpenJobs,
  getJobById,
  updateJob,
  deleteJob,
};

export default jobService;
