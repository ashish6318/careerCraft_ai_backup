import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1/jobs'; // Your backend jobs API URL

// Configure axios to send credentials (cookies) with requests
const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Service function to create a new job posting
const createJob = async (jobData) => {
  const response = await apiClient.post('/', jobData); // POST to /api/v1/jobs
  return response.data;
};

// Service function to get jobs posted by the logged-in recruiter
const getRecruiterJobs = async () => {
  const response = await apiClient.get('/my-jobs'); // GET /api/v1/jobs/my-jobs
  return response.data;
};

// Service function to get all open jobs (for seekers/public)
const getAllOpenJobs = async (filters = {}) => {
    // axios will automatically convert the 'filters' object into query parameters
    const response = await apiClient.get('/', { params: filters });
    return response.data;
};

// Service function to get a single job by its ID
const getJobById = async (jobId) => {
    const response = await apiClient.get(`/${jobId}`); // GET /api/v1/jobs/:id
    return response.data;
};

// Add updateJob and deleteJob functions later as needed
// Service function to update an existing job posting
const updateJob = async (jobId, jobData) => {
  const response = await apiClient.put(`/${jobId}`, jobData); // PUT /api/v1/jobs/:id
  return response.data;
};

// Service function to delete a job posting
const deleteJob = async (jobId) => {
  const response = await apiClient.delete(`/${jobId}`); // DELETE /api/v1/jobs/:id
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
