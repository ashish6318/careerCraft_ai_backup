import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto'; 

// @desc    Register a new seeker
// @route   POST /api/v1/auth/register
// @access  Public
const registerSeeker = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      fullName,
      email,
      password,
      role: 'seeker', // Explicitly set role for seeker registration
    });

    if (user) {
      generateToken(res, user._id, user.role);
      res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        message: 'Seeker registered successfully',
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ message: error.message || 'Server Error during registration' });
  }
};

// @desc    Auth user & get token (Login)
// @route   POST /api/v1/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password'); // Include password for comparison

    if (user && (await user.matchPassword(password))) {
      generateToken(res, user._id, user.role);
      res.json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        message: 'Login successful',
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: error.message || 'Server Error during login' });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/v1/auth/logout
// @access  Private (user must be logged in)
const logoutUser = (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0), // Set expiry to a past date
    secure: process.env.NODE_ENV !== 'development',
    sameSite: isProduction ? 'none' : 'lax',
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get current user profile (example of a protected route later)
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = async (req, res) => {
  // req.user is now populated by the 'protect' middleware
  if (req.user) {
    res.status(200).json(req.user);
  } else {
    // This case should ideally be caught by 'protect' middleware itself,
    // but as a fallback or if protect middleware logic changes:
    res.status(404).json({ message: 'User not found or not authenticated' });
  }
};
const registerRecruiter = async (req, res) => {
  // Destructure companyName from req.body
  const { fullName, email, password, companyName } = req.body;

  try {
    // Add companyName to the validation check
    if (!fullName || !email || !password || !companyName) {
      return res.status(400).json({ message: 'Please provide full name, email, password, and company name' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      fullName,
      email,
      password,
      companyName, // Pass companyName to User.create
      role: 'company_recruiter',
    });

    if (user) {
      generateToken(res, user._id, user.role);
      res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        companyName: user.companyName, // Include in response
        message: 'Recruiter registered successfully',
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Recruiter Register Error:', error);
    // Check if it's a validation error and customize message if needed
    if (error.name === 'ValidationError') {
        let messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: error.message || 'Server Error during recruiter registration' });
  }
};
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Please provide an email address.' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      // Important: Don't reveal if an email exists or not for security (prevents email enumeration)
      // Send a generic success-like message in both cases (user found or not found).
      console.log(`Password reset requested for email (simulated): ${email}. User ${user ? 'found' : 'not found'}.`);
      return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }

    // Generate the reset token (this method saves the hashed token and expiry on the user instance)
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false }); // Save the user with the new reset token fields, skip other validations if not needed for this specific save.

    // Create reset URL (frontend URL)
    // For development, ensure your .env or config has FRONTEND_URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    // For now, we'll just log the reset URL to the console instead of sending an email.
    // In a real app, you would use an email service here (e.g., Nodemailer with SendGrid/Mailgun/Ethereal).
    console.log('------------------------------------');
    console.log('PASSWORD RESET LINK (FOR DEVELOPMENT):');
    console.log(resetUrl);
    console.log('------------------------------------');
    console.log(`(This link would normally be emailed to ${user.email})`);

    res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });

  } catch (error) {
    console.error('Forgot Password Error:', error);
    // Clear token fields if save failed to prevent user being locked out with a bad token
    if (user) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
    }
    res.status(500).json({ message: 'Error processing forgot password request.' });
  }
};


// @desc    Reset password using token
// @route   PUT /api/v1/auth/reset-password/:resetToken
// @access  Public
const resetPassword = async (req, res) => {
  const { resetToken } = req.params;
  const { password } = req.body;

  if (!password || password.length < 6) {
    return res.status(400).json({ message: 'Please provide a new password with at least 6 characters.' });
  }

  try {
    // 1. Hash the token from the URL (the same way it was hashed before saving to DB)
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // 2. Find user by this hashed token and check if token hasn't expired
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }, // Check if expiry is greater than current time
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
    }

    // 3. If token is valid, set the new password
    user.password = password; // The pre-save hook in User.js will hash this new password
    user.passwordResetToken = undefined; // Clear the reset token fields
    user.passwordResetExpires = undefined;
    await user.save();

    // Optional: Log the user in by generating a new JWT token
    // generateToken(res, user._id, user.role);

    res.status(200).json({ message: 'Password reset successful. You can now log in with your new password.' });

  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ message: 'Error resetting password.' });
  }
};


// Add the new functions to exports
export {
  registerSeeker,
  loginUser,
  logoutUser,
  getMe,
  registerRecruiter,
  forgotPassword,     // New export
  resetPassword       // New export
};
