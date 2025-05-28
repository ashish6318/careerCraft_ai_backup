import axios from 'axios';

// 1. Get the general API root URL from environment variables
const API_ROOT_URL = import.meta.env.VITE_API_ROOT_URL || 'http://localhost:5000/api/v1';

// 2. Construct the specific base URL for the Mock Tests service
const MOCK_TESTS_SERVICE_BASE_URL = `${API_ROOT_URL}/mock-tests`;

// 3. Configure axios
const apiClient = axios.create({
  baseURL: MOCK_TESTS_SERVICE_BASE_URL, // e.g., http://localhost:5000/api/v1/mock-tests
  withCredentials: true,
});

const getAllMockTests = async (filters = {}) => {
  const response = await apiClient.get('/', { params: filters });
  return response.data;
};

const getMockTestForAttempt = async (testId) => {
  const response = await apiClient.get(`/${testId}/attempt`);
  return response.data;
};

const submitMockTest = async (testId, answers, startTime) => {
  const response = await apiClient.post(`/${testId}/submit`, { answers, startTime });
  return response.data;
};

const getTestAttemptResult = async (attemptId) => {
  const response = await apiClient.get(`/attempts/${attemptId}`);
  return response.data;
};

const getMyTestAttempts = async () => {
  const response = await apiClient.get('/my-attempts');
  return response.data;
};

const createMockTest = async (testData) => {
  const response = await apiClient.post('/', testData);
  return response.data;
};

const mockTestService = {
  getAllMockTests,
  getMockTestForAttempt,
  submitMockTest,
  getTestAttemptResult,
  getMyTestAttempts,
  createMockTest,
};

export default mockTestService;
