import Application from '../models/Application.js';
import Job from '../models/Job.js';
import User from '../models/User.js'; // We'll need User to check seeker's resume

// @desc    Apply for a job
// @route   POST /api/v1/applications/job/:jobId
// @access  Private (seeker)
const applyForJob = async (req, res) => {
  const { jobId } = req.params;
  const seekerId = req.user._id; // From 'protect' middleware

  try {
    // 1. Find the job seeker is applying to
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }
    if (job.status !== 'open') {
      return res.status(400).json({ message: 'This job is no longer open for applications.' });
    }

    // 2. Check if the seeker (User model) has a resume uploaded
    const seeker = await User.findById(seekerId); // req.user could also be used if fully populated
    if (!seeker || !seeker.resumeUrl || !seeker.resumeFileName) {
      return res.status(400).json({ message: 'Please upload your resume to your profile before applying.' });
    }

    // 3. Check if the seeker has already applied for this job
    const existingApplication = await Application.findOne({ jobId, seekerId });
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job.' });
    }

    // 4. Create the new application
    const newApplication = new Application({
      jobId,
      seekerId,
      recruiterId: job.postedBy, // User ID of the recruiter who posted the job
      companyName: job.companyName,
      jobTitle: job.title,
      seekerName: seeker.fullName, // From User model
      seekerEmail: seeker.email,   // From User model
      resumeUrl: seeker.resumeUrl, // Use seeker's current resume URL from their profile
      resumeFileName: seeker.resumeFileName, // Use seeker's current resume filename
      status: 'applied', // Default status
    });

    await newApplication.save();

    res.status(201).json({
      message: 'Application submitted successfully!',
      application: newApplication,
    });

  } catch (error) {
    console.error('Apply for Job Error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join('. ') });
    }
    // Handle potential duplicate key error for the unique index (jobId, seekerId)
    if (error.code === 11000) {
        return res.status(400).json({ message: 'You have already applied for this job (duplicate error).' });
    }
    res.status(500).json({ message: 'Server Error: Could not submit application.' });
  }
};
const getSeekerApplications = async (req, res) => {
  try {
    const seekerId = req.user._id;

    const applications = await Application.find({ seekerId })
      .populate({
        path: 'jobId', // Populate the 'jobId' field
        select: 'title companyName location jobType status', // Select specific fields from the Job model
      })
      .sort({ applicationDate: -1 }); // Sort by most recent application

    if (!applications) {
      // This will likely return an empty array if no applications, not null,
      // but good practice to be aware.
      return res.status(200).json([]);
    }

    res.status(200).json(applications);

  } catch (error) {
    console.error('Get Seeker Applications Error:', error);
    res.status(500).json({ message: 'Server Error: Could not fetch your applications.' });
  }
};const getJobApplicants = async (req, res) => {
  const { jobId } = req.params;
  const recruiterId = req.user._id; // From 'protect' middleware

  try {
    // 1. Find the job to verify ownership
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    // 2. Verify the logged-in recruiter is the owner of the job
    if (job.postedBy.toString() !== recruiterId.toString()) {
      return res.status(403).json({ message: 'Forbidden. You are not authorized to view applicants for this job.' });
    }

    // 3. Find all applications for this job and populate seeker details
    const applications = await Application.find({ jobId })
      .populate({
        path: 'seekerId', // Populate the 'seekerId' field from the Application model
        select: 'fullName email skills bio resumeUrl resumeFileName linkedInUrl portfolioUrl profilePhotoUrl', // Select specific fields from the User model (seeker's profile)
      })
      .sort({ applicationDate: -1 }); // Sort by most recent application

    res.status(200).json(applications);

  } catch (error) {
    console.error('Get Job Applicants Error:', error);
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Invalid Job ID format.' });
    }
    res.status(500).json({ message: 'Server Error: Could not fetch job applicants.' });
  }
};

// @desc    Update the status of an application (by the recruiter who posted the job)
// @route   PUT /api/v1/applications/:applicationId/status
// @access  Private (company_recruiter)
const updateApplicationStatus = async (req, res) => {
  const { applicationId } = req.params;
  const { status } = req.body; // Expecting { status: "newStatus" } in request body
  const recruiterId = req.user._id;

  try {
    // 1. Validate the new status against the enum in Application model
    const allowedStatuses = Application.schema.path('status').enumValues;
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status value. Allowed statuses are: ${allowedStatuses.join(', ')}` });
    }

    // 2. Find the application
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    // 3. Verify the logged-in recruiter is the one associated with this application's job
    // (application.recruiterId was set to job.postedBy when the application was created)
    if (application.recruiterId.toString() !== recruiterId.toString()) {
      return res.status(403).json({ message: 'Forbidden. You are not authorized to update this application.' });
    }

    // 4. Update the status
    application.status = status;
    await application.save();

    // Optionally, populate job and seeker details to return the full application context
    const updatedApplication = await Application.findById(application._id)
        .populate({ path: 'jobId', select: 'title companyName' })
        .populate({ path: 'seekerId', select: 'fullName email' });


    res.status(200).json({
      message: 'Application status updated successfully!',
      application: updatedApplication,
    });

  } catch (error) {
    console.error('Update Application Status Error:', error);
     if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Invalid Application ID format.' });
    }
    if (error.name === 'ValidationError') { // Should be caught by the enum check, but good to have
        return res.status(400).json({ message: `Validation Error: ${error.message}` });
    }
    res.status(500).json({ message: 'Server Error: Could not update application status.' });
  }
};


export {
  applyForJob,
  getSeekerApplications,
  getJobApplicants,         // Add new function
  updateApplicationStatus   // Add new function
};
