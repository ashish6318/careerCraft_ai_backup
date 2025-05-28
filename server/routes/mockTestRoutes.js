import express from 'express';
import {
  createMockTest,
  getAllMockTests,
  getMockTestForAttempt,
  submitMockTest,
  getTestAttemptResult,
  getMyTestAttempts
} from '../controllers/mockTestController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- Admin/Creator Routes (example, refine roles later) ---
// For now, 'protect' ensures logged in, actual admin role check can be added to controller or dedicated middleware
router.post('/', protect, /* authorize('admin'), */ createMockTest); // Create a new mock test

// --- Seeker / Public Routes ---
router.get('/', getAllMockTests); // Get all published mock tests (summary)

router.get('/:testId/attempt', protect, authorize('seeker'), getMockTestForAttempt); // Get a specific test for attempting
router.post('/:testId/submit', protect, authorize('seeker'), submitMockTest); // Submit answers for a test

router.get('/my-attempts', protect, authorize('seeker'), getMyTestAttempts); // Get all attempts for logged-in seeker
router.get('/attempts/:attemptId', protect, authorize('seeker'), getTestAttemptResult); // Get result of a specific attempt


export default router;
