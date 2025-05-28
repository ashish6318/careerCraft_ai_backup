import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    seekerId: { // The user who applied
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recruiterId: { // The user who posted the job (owner of the job)
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    companyName: { // Denormalized from Job/Recruiter for easier display in application lists
        type: String,
        required: true,
    },
    jobTitle: { // Denormalized from Job
        type: String,
        required: true,
    },
    seekerName: { // Denormalized from Seeker's User profile
        type: String,
        required: true,
    },
    seekerEmail: { // Denormalized from Seeker's User profile
        type: String,
        required: true,
    },
    resumeUrl: { // URL of the resume used at the time of application
      type: String,
      required: [true, 'A resume is required to apply.'],
    },
    resumeFileName: { // Original name of the resume file
      type: String,
    },
    status: {
      type: String,
      enum: ['applied', 'viewed', 'shortlisted', 'interviewing', 'offered', 'rejected', 'hired', 'withdrawn'],
      default: 'applied',
    },
    applicationDate: {
      type: Date,
      default: Date.now,
    },
    // Optional: Cover Letter Text or URL
    // coverLetterText: { type: String, maxlength: 2000 },
    // coverLetterUrl: { type: String },

    // Notes by recruiter (internal)
    // recruiterNotes: [{
    //    note: String,
    //    date: { type: Date, default: Date.now }
    // }]
  },
  {
    timestamps: true, // Adds createdAt and updatedAt for the application record itself
  }
);

// Ensure a seeker can apply to a specific job only once
applicationSchema.index({ jobId: 1, seekerId: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);

export default Application;
