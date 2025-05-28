import express from 'express';
import { getResumeSuggestions,generateAiMockTestQuestions,getCareerRoadmap } from '../controllers/aiController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/resume-feedback', protect, authorize('seeker'), getResumeSuggestions);
// Using POST as it might feel more like an action, though GET could also work if no body is sent.
router.post('/generate-test-questions', protect, /* authorize('admin'), */ generateAiMockTestQuestions);
// Note: The authorize middleware for 'admin' is commented out
// because the AI test generation might be available to all roles 
// or you might want to handle it differently based on your app's logic.
router.post('/career-roadmap', protect, authorize('seeker'), getCareerRoadmap); // New Route

export default router;
