import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/v1/mock-tests';

// Configure axios to send credentials (cookies) with requests
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Fetch all published mock tests (summary view)
// Optionally accepts filters like { category: 'SDE', difficulty: 'Intermediate' }
const getAllMockTests = async (filters = {}) => {
  const response = await apiClient.get('/', { params: filters }); // GET /api/v1/mock-tests
  return response.data;
};

// Fetch a specific mock test for a seeker to attempt (questions only, no answers)
const getMockTestForAttempt = async (testId) => {
  const response = await apiClient.get(`/${testId}/attempt`); // GET /api/v1/mock-tests/:testId/attempt
  return response.data;
};

// Submit answers for a mock test
// answers should be an array like: [{ questionId: "...", selectedOptionIndex: X }, ...]
// startTime is an ISO string or Date object
const submitMockTest = async (testId, answers, startTime) => {
  const response = await apiClient.post(`/${testId}/submit`, { answers, startTime }); // POST /api/v1/mock-tests/:testId/submit
  return response.data; // Expected: { message, attemptId, score, ... }
};

// Get details of a specific test attempt (full results)
const getTestAttemptResult = async (attemptId) => {
  const response = await apiClient.get(`/attempts/${attemptId}`); // GET /api/v1/mock-tests/attempts/:attemptId
  return response.data;
};

// Get all test attempts for the logged-in seeker
const getMyTestAttempts = async () => {
  const response = await apiClient.get('/my-attempts'); // GET /api/v1/mock-tests/my-attempts
  return response.data;
};

const createMockTest = async (testData) => {
  // testData should include: { title, description, category, topic, difficultyLevel, questions, durationMinutes, status }
  const response = await apiClient.post('/', testData); // POST /api/v1/mock-tests
  return response.data; // Returns the created test document
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
