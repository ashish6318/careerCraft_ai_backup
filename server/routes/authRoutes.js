import express from 'express';
import {
  registerSeeker,
  loginUser,
  logoutUser,
  getMe,
  registerRecruiter,
  forgotPassword,    // Import new function
  resetPassword,
} from '../controllers/authController.js';
import { protect, authorize } from '../middleware/authMiddleware.js'; // Import middleware

const router = express.Router();

router.post('/register', registerSeeker);
router.post('/register-recruiter', registerRecruiter);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// Apply 'protect' middleware to the /me route
// Now, only authenticated users can access this route
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);

// Example of a route that requires a specific role (e.g., 'admin')
// We don't have an admin panel yet, but this shows how to use 'authorize'
router.get('/admin-only-data', protect, authorize('admin'), (req, res) => {
  res.json({ message: 'Welcome Admin! Here is your secret data.', user: req.user });
});

// Example of a route for seekers only
router.get('/seeker-dashboard-data', protect, authorize('seeker'), (req, res) => {
    res.json({ message: 'Welcome Seeker! Here is your dashboard data.', user: req.user });
});
// Example of a route for recruiters only
router.get('/recruiter-area', protect, authorize('company_recruiter'), (req, res) => {
  res.json({ message: 'Welcome Recruiter! This is your dedicated area.', user: req.user });
});


export default router;
