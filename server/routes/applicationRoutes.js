import express from 'express';
import { applyForJob,getSeekerApplications,getJobApplicants,updateApplicationStatus } from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route for a seeker to apply for a job
// The :jobId will be in req.params
router.post('/job/:jobId/apply', protect, authorize('seeker'), applyForJob);
router.get('/my-applications', protect, authorize('seeker'), getSeekerApplications); // New Route

router.get('/job/:jobId/applicants', protect, authorize('company_recruiter'), getJobApplicants);
// Update the status of an application
router.put('/:applicationId/status', protect, authorize('company_recruiter'), updateApplicationStatus);


export default router;
