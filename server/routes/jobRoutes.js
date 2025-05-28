import express from 'express';
import {
  createJob,
  getRecruiterJobs,
  getJobById,
  updateJob,
  deleteJob,
  getAllJobs
} from '../controllers/jobController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- Public Routes ---
// Get all open jobs (for seekers/public view)
router.get('/', getAllJobs);

// --- Recruiter Specific Routes (Protected and Authorized) ---
// Get all jobs posted by the currently logged-in recruiter
// This specific string route must come BEFORE the parameterized '/:id' GET route
router.get('/my-jobs', protect, authorize('company_recruiter'), getRecruiterJobs);

// --- Public Route (Can also be used by authenticated users) ---
// Get a single job by ID (publicly accessible for viewing details)
// Now this will correctly handle actual IDs and not accidentally catch '/my-jobs'
router.get('/:id', getJobById);


// --- Recruiter Specific Routes (Protected and Authorized) ---
// Create a new job posting (POST uses the same '/' path as GET getAllJobs, but different method is fine)
router.post('/', protect, authorize('company_recruiter'), createJob);

// Update a specific job posting owned by the recruiter
router.put('/:id', protect, authorize('company_recruiter'), updateJob);

// Delete a specific job posting owned by the recruiter
router.delete('/:id', protect, authorize('company_recruiter'), deleteJob);

export default router;
