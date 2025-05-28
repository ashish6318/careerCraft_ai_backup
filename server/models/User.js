import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto'; 

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please provide your full name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false, // Do not return password by default when querying users
  },
  role: {
    type: String,
    enum: ['seeker', 'company_recruiter', 'admin'],
    default: 'seeker',
  },
  companyName: { // For recruiters
    type: String,
    // Example: conditionally required if role is recruiter
    // required: function() { return this.role === 'company_recruiter'; }
  },

  // --- New Fields for Seeker Profile ---
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters'],
    default: '',
  },
  skills: {
    type: [String], // An array of strings
    default: [],
  },
  resumeUrl: { // URL or path to the seeker's uploaded resume
    type: String,
    default: '',
  },
  resumeFileName: { // Optional: to store the original name of the resume file
    type: String,
    default: '',
  },
  profilePhotoUrl: { // URL or path to the seeker's profile photo
    type: String,
    default: '', // Could set a default placeholder image URL here
  },
  linkedInUrl: {
    type: String,
    default: '',
    match: [/^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/, 'Please provide a valid LinkedIn profile URL']
  },
  portfolioUrl: { // e.g., GitHub, Behance, personal website
    type: String,
    default: '',
    // Basic URL validation could be added if desired
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  // --- End of New Seeker Profile Fields ---

  createdAt: {
    type: Date,
    default: Date.now,
  },
  // You might want an updatedAt field for profile changes if not using global timestamps for all updates
  // updatedAt: {
  //   type: Date
  // }
}, {
    timestamps: true // This will add createdAt and updatedAt for the whole document
});

// Middleware to hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare entered password with hashed password in DB
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
// Method to generate a password reset token
// --- Method to generate and hash password reset token ---
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex'); // Plain token for the email link

  // Hash the token and set it on the user model (to be stored in DB)
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set token expiration (e.g., 10 minutes from now)
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes in milliseconds

  // Return the plain (unhashed) token to be sent via email
  return resetToken;
};

const User = mongoose.model('User', userSchema);

export default User;
