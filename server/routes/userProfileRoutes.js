import express from 'express';
import {
  getSeekerProfile,
  updateSeekerProfile,
  uploadSeekerResume // Import the new controller function
} from '../controllers/userProfileController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { uploadResume } from '../middleware/multerMiddleware.js'; // Import Multer middleware

const router = express.Router();

// Seeker profile routes
router.route('/seeker/me')
  .get(protect, authorize('seeker'), getSeekerProfile)
  .put(protect, authorize('seeker'), updateSeekerProfile);

// Seeker resume upload route
// Using POST, but PUT could also be semantically correct for updating/replacing.
// The Multer middleware 'uploadResume' will process the file upload first.
router.post(
  '/seeker/me/resume',
  protect,
  authorize('seeker'),
  uploadResume, // Multer middleware for single file upload expecting field 'resumeFile'
  uploadSeekerResume
);

// You could add a route to delete a resume later if needed.
// router.delete('/seeker/me/resume', protect, authorize('seeker'), deleteSeekerResume);

export default router;
