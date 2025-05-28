import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a job title'],
      trim: true,
      maxlength: [100, 'Job title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a job description'],
      maxlength: [2000, 'Job description cannot be more than 2000 characters'], // Increased max length
    },
    companyName: { // Denormalized from the recruiter's user profile for easy display
      type: String,
      required: [true, 'Company name is required'],
    },
    postedBy: { // The recruiter who posted the job
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    location: {
      type: String,
      required: [true, 'Please provide a job location'],
      trim: true,
    },
    salary: { // Example: "₹50,000 - ₹70,000 per month" or "Competitive"
      type: String, // Can be enhanced to an object with min/max/currency/period later
      trim: true,
    },
    jobType: {
      type: String,
      required: [true, 'Please specify the job type'],
      enum: ['Full-time', 'Part-time', 'Internship', 'Contract', 'Temporary', 'Remote'],
    },
    experienceLevel: { // Optional field
      type: String,
      enum: ['Entry-level', 'Mid-level', 'Senior-level', 'Lead', 'Manager', 'Executive', 'Not Specified'],
      default: 'Not Specified',
    },
    category: { // e.g., Software Development, Marketing, Design, Data Science
      type: String,
      required: [true, 'Please specify a job category'],
      trim: true,
      // Consider making this an enum if you have a predefined list
      // enum: ['Software Development', 'Data Science', 'AI/ML', 'Marketing', 'Design', 'Sales', 'Customer Support', 'HR', 'Other']
    },
    skillsRequired: [ // Array of strings
      {
        type: String,
        trim: true,
      },
    ],
    applicationDeadline: {
      type: Date,
    },
    applicationInstructions: { // How to apply, e.g., link to external site or email
        type: String,
        trim: true,
    },
    status: {
      type: String,
      enum: ['open', 'closed', 'archived'],
      default: 'open',
    },
    // We can add fields for number of views, applications later if needed
    // views: { type: Number, default: 0 },
    // applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' }]
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

// Optional: Add indexes for fields that will be frequently queried
jobSchema.index({ title: 'text', description: 'text', companyName: 'text', category: 'text', skillsRequired: 'text' }); // For text search
jobSchema.index({ location: 1 });
jobSchema.index({ jobType: 1 });
jobSchema.index({ category: 1 }); // Note: 'category' is in text index and also a separate index. This is fine.
jobSchema.index({ experienceLevel: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ createdAt: -1 }); // For default sorting by newest


const Job = mongoose.model('Job', jobSchema);

export default Job;
