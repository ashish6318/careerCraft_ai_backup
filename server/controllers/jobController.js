import Job from '../models/Job.js';
import User from '../models/User.js'; // To potentially access user details if needed

// @desc    Create a new job
// @route   POST /api/v1/jobs
// @access  Private (company_recruiter)
const createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      salary,
      jobType,
      experienceLevel,
      category,
      skillsRequired,
      applicationDeadline,
      applicationInstructions,
    } = req.body;

    // Validate required fields
    if (!title || !description || !location || !jobType || !category) {
      return res.status(400).json({ message: 'Please provide all required job fields: title, description, location, jobType, category' });
    }

    // req.user is populated by the 'protect' middleware
    // req.user.companyName should be available if it's on the User model for recruiters
    if (!req.user.companyName) {
        return res.status(400).json({ message: 'Company name not found for recruiter. Please update your profile.' });
    }

    const job = new Job({
      title,
      description,
      companyName: req.user.companyName, // Get company name from logged-in recruiter's profile
      postedBy: req.user._id, // Link the job to the logged-in recruiter
      location,
      salary,
      jobType,
      experienceLevel,
      category,
      skillsRequired: skillsRequired || [],
      applicationDeadline,
      applicationInstructions,
      status: 'open', // Default status
    });

    const createdJob = await job.save();
    res.status(201).json(createdJob);
  } catch (error) {
    console.error('Create Job Error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join('. ') });
    }
    res.status(500).json({ message: 'Server Error: Could not create job posting.' });
  }
};

// @desc    Get all jobs posted by the logged-in recruiter
// @route   GET /api/v1/jobs/my-jobs
// @access  Private (company_recruiter)
const getRecruiterJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (error) {
    console.error('Get Recruiter Jobs Error:', error);
    res.status(500).json({ message: 'Server Error: Could not fetch your job postings.' });
  }
};

// @desc    Get a single job by ID (publicly accessible for viewing)
// @route   GET /api/v1/jobs/:id
// @access  Public (for now, can be adjusted)
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (job) {
      res.status(200).json(job);
    } else {
      res.status(404).json({ message: 'Job not found' });
    }
  } catch (error) {
    console.error('Get Job By ID Error:', error);
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Job not found (invalid ID format)' });
    }
    res.status(500).json({ message: 'Server Error: Could not fetch job details.' });
  }
};

// @desc    Update a job posting
// @route   PUT /api/v1/jobs/:id
// @access  Private (company_recruiter who owns the job)
const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if the logged-in user is the one who posted the job
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized to update this job' });
    }

    // Update fields from req.body
    const {
        title,
        description,
        location,
        salary,
        jobType,
        experienceLevel,
        category,
        skillsRequired,
        applicationDeadline,
        applicationInstructions,
        status // Allow updating status e.g., to 'closed'
    } = req.body;

    job.title = title || job.title;
    job.description = description || job.description;
    job.location = location || job.location;
    job.salary = salary !== undefined ? salary : job.salary; // Allow setting salary to empty/null if intended
    job.jobType = jobType || job.jobType;
    job.experienceLevel = experienceLevel || job.experienceLevel;
    job.category = category || job.category;
    job.skillsRequired = skillsRequired || job.skillsRequired;
    job.applicationDeadline = applicationDeadline !== undefined ? applicationDeadline : job.applicationDeadline;
    job.applicationInstructions = applicationInstructions !== undefined ? applicationInstructions : job.applicationInstructions;
    job.status = status || job.status;
    // companyName and postedBy should not be changed here

    const updatedJob = await job.save();
    res.status(200).json(updatedJob);
  } catch (error) {
    console.error('Update Job Error:', error);
     if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join('. ') });
    }
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Job not found (invalid ID format)' });
    }
    res.status(500).json({ message: 'Server Error: Could not update job posting.' });
  }
};

// @desc    Delete a job posting
// @route   DELETE /api/v1/jobs/:id
// @access  Private (company_recruiter who owns the job)
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if the logged-in user is the one who posted the job
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized to delete this job' });
    }

    await Job.deleteOne({ _id: req.params.id }); // Using deleteOne for Mongoose v6+
    // For older Mongoose versions, you might use: await job.remove();

    res.status(200).json({ message: 'Job posting deleted successfully' });
  } catch (error) {
    console.error('Delete Job Error:', error);
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Job not found (invalid ID format)' });
    }
    res.status(500).json({ message: 'Server Error: Could not delete job posting.' });
  }
};


// @desc    Get all jobs (for seekers and public view)
// @route   GET /api/v1/jobs
// @access  Public
const getAllJobs = async (req, res) => {
  try {
    const {
      search,         // Keyword search
      location,
      category,
      jobType,
      experienceLevel,
      sortBy = 'newest', // Default sort: newest, other options: oldest
      page = 1,          // Default page 1
      limit = 10,        // Default 10 jobs per page
    } = req.query;

    // --- Build Filter Object ---
    const queryFilter = { status: 'open' }; // Always filter for open jobs

    if (search) {
      // Using $text search requires a text index on the fields you want to search
      // Ensure your Job model has a text index like:
      // jobSchema.index({ title: 'text', description: 'text', companyName: 'text', category: 'text', skillsRequired: 'text' });
      queryFilter.$text = { $search: search };
    }
    if (location) {
      // Case-insensitive partial match for location
      queryFilter.location = { $regex: location, $options: 'i' };
    }
    if (category) {
      queryFilter.category = category; // Assumes exact match, or use $regex for partial
    }
    if (jobType) {
      queryFilter.jobType = jobType;
    }
    if (experienceLevel) {
      queryFilter.experienceLevel = experienceLevel;
    }

    // --- Sorting ---
    let sortOption = {};
    if (sortBy === 'oldest') {
      sortOption.createdAt = 1; // Ascending
    } else { // Default to newest
      sortOption.createdAt = -1; // Descending
    }
    // If using $text search, MongoDB automatically includes a 'textScore'
    // You could sort by that if 'search' is active:
    // if (search) {
    //   sortOption = { score: { $meta: "textScore" }, ...sortOption };
    // }

    // --- Pagination ---
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // --- Execute Query ---
    const jobs = await Job.find(queryFilter)
      .populate({ // Populate postedBy to get recruiter's companyName if not denormalized on job itself
          path: 'postedBy',
          select: 'companyName' // Or any other recruiter details if needed
      })
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    // Get total count of documents matching the filter (for pagination)
    const totalJobs = await Job.countDocuments(queryFilter);
    const totalPages = Math.ceil(totalJobs / limitNum);

    res.status(200).json({
      jobs,
      currentPage: pageNum,
      totalPages,
      totalJobs,
    });

  } catch (error) {
    console.error('Get All Jobs Error:', error);
    res.status(500).json({ message: 'Server Error: Could not fetch jobs.' });
  }
};

// Make sure getAllJobs is exported
export {
  createJob,
  getRecruiterJobs,
  getJobById,
  updateJob,
  deleteJob,
  getAllJobs // Ensure it's here
};
