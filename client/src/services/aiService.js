import axios from 'axios';

// 1. Get the general API root URL from environment variables
const API_ROOT_URL = import.meta.env.VITE_API_ROOT_URL || 'http://localhost:5000/api/v1';

// 2. Construct the specific base URL for the AI service
const AI_SERVICE_BASE_URL = `${API_ROOT_URL}/ai`;

// 3. Configure axios to send credentials (cookies) with requests
const apiClient = axios.create({
  baseURL: AI_SERVICE_BASE_URL, // e.g., http://localhost:5000/api/v1/ai
  withCredentials: true,
});

// Fetch AI-powered resume feedback for the logged-in seeker
const fetchResumeSuggestions = async () => {
  const response = await apiClient.post('/resume-feedback');
  return response.data;
};

const generateAiTestQuestions = async (params) => {
  const response = await apiClient.post('/generate-test-questions', params);
  return response.data;
};

const fetchCareerRoadmap = async ({ role, currentMessage, conversationHistory }) => {
  const payload = {};
  if (role) payload.role = role;
  if (currentMessage) payload.currentMessage = currentMessage;
  if (conversationHistory) payload.conversationHistory = conversationHistory;

  const response = await apiClient.post('/career-roadmap', payload);
  return response.data;
};

const aiService = {
  fetchResumeSuggestions,
  generateAiTestQuestions,
  fetchCareerRoadmap,
};

export default aiService;
