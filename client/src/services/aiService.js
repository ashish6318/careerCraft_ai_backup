import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/v1/ai'; // Base URL for AI endpoints

// Configure axios to send credentials (cookies) with requests
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Fetch AI-powered resume feedback for the logged-in seeker
const fetchResumeSuggestions = async () => {
  // The backend route is POST /api/v1/ai/resume-feedback
  // It uses the authenticated user's session to find their resume.
  // No request body is needed for this specific POST request.
  const response = await apiClient.post('/resume-feedback');
  return response.data; // Expected: { suggestions: "..." } or error
};
const generateAiTestQuestions = async (params) => {
  // params = { category, topic, difficultyLevel, numberOfQuestions }
  const response = await apiClient.post('/generate-test-questions', params);
  return response.data; // Expected: { message, questions: [...] } or error
};
const fetchCareerRoadmap = async ({ role, currentMessage, conversationHistory }) => {
  // Backend route is POST /api/v1/ai/career-roadmap
  // Body can contain: { role, currentMessage, conversationHistory }
  const payload = {};
  if (role) payload.role = role; // For initial roadmap request
  if (currentMessage) payload.currentMessage = currentMessage;
  if (conversationHistory) payload.conversationHistory = conversationHistory;

  const response = await apiClient.post('/career-roadmap', payload);
  return response.data; // Expected: { roadmap: "markdown_string..." } or error
};

const aiService = {
  fetchResumeSuggestions,
  generateAiTestQuestions,
  fetchCareerRoadmap,
};

export default aiService;
