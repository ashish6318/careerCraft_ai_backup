import User from '../models/User.js';
import cloudinary from '../config/cloudinaryConfig.js';
import DatauriParser from 'datauri/parser.js'; // Old import - might be problematic
import Datauri from 'datauri'; // Corrected way to import the main class
import path from 'path';


// @desc    Get logged-in seeker's profile
// @route   GET /api/v1/profile/seeker/me
// @access  Private (seeker)
const getSeekerProfile = async (req, res) => {
  try {
    // req.user is populated by the 'protect' middleware
    // We can send req.user directly as it contains the user document
    // (excluding password, as defined in the 'protect' middleware)
    if (!req.user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    // Ensure the user is a seeker (though 'authorize' middleware should also handle this)
    if (req.user.role !== 'seeker') {
        return res.status(403).json({ message: 'Access denied. User is not a seeker.' });
    }

    res.status(200).json(req.user);
  } catch (error) {
    console.error('Get Seeker Profile Error:', error);
    res.status(500).json({ message: 'Server Error: Could not fetch profile.' });
  }
};

// @desc    Update logged-in seeker's profile (textual data only)
// @route   PUT /api/v1/profile/seeker/me
// @access  Private (seeker)
const updateSeekerProfile = async (req, res) => {
  try {
    const seeker = await User.findById(req.user._id); // req.user is from 'protect' middleware

    if (!seeker) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (seeker.role !== 'seeker') {
        return res.status(403).json({ message: 'Access denied. User is not a seeker.' });
    }

    // Fields that can be updated by the seeker for their profile
    const { fullName, bio, skills, linkedInUrl, portfolioUrl } = req.body;

    seeker.fullName = fullName || seeker.fullName;
    seeker.bio = bio !== undefined ? bio : seeker.bio; // Allow setting to empty string
    seeker.skills = skills !== undefined ? (Array.isArray(skills) ? skills : [skills]) : seeker.skills; // Ensure skills is an array
    seeker.linkedInUrl = linkedInUrl !== undefined ? linkedInUrl : seeker.linkedInUrl;
    seeker.portfolioUrl = portfolioUrl !== undefined ? portfolioUrl : seeker.portfolioUrl;

    // Note: Email and password changes should ideally be handled via separate, dedicated endpoints
    // for security reasons (e.g., requiring current password for password change).

    const updatedSeeker = await seeker.save();

    // Return the updated user object (Mongoose by default returns the updated doc)
    // We might want to re-select to exclude password if it wasn't excluded by default on 'save'
    const userToReturn = await User.findById(updatedSeeker._id).select('-password');

    res.status(200).json(userToReturn);

  } catch (error) {
    console.error('Update Seeker Profile Error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join('. ') });
    }
    res.status(500).json({ message: 'Server Error: Could not update profile.' });
  }
};
const uploadSeekerResume = async (req, res) => {
  try {
    const seeker = await User.findById(req.user._id);

    if (!seeker) {
      return res.status(404).json({ message: 'User not found.' });
    }
    if (seeker.role !== 'seeker') {
      return res.status(403).json({ message: 'Access denied. User is not a seeker.' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No resume file uploaded. Please select a file.' });
    }

    // Optional: Delete old resume from Cloudinary if it exists and you want to replace
    // This requires storing the public_id of the old resume. For simplicity, we'll skip this for now,
    // but in a production app, you'd manage old files to save storage.
    // if (seeker.resumeCloudinaryId) {
    //   await cloudinary.uploader.destroy(seeker.resumeCloudinaryId, { resource_type: 'raw' });
    // }

    // Convert buffer to Data URI
    const parser = new DatauriParser();
    const fileExtension = path.extname(req.file.originalname).toString();
    const fileBuffer = req.file.buffer;
    const dataUri = parser.format(fileExtension, fileBuffer);

    // Upload to Cloudinary
    // You can specify a folder and a public_id for better organization in Cloudinary
    // For resumes, 'raw' resource_type is often appropriate.
    const result = await cloudinary.uploader.upload(dataUri.content, {
      resource_type: 'raw', // For non-image files like PDF, DOCX
      folder: `careercraft_ai/resumes/${seeker._id}`, // Store in a user-specific folder
      // public_id: `resume_${Date.now()}`, // Optional: define a public_id
      // use_filename: true, // Optional: tries to use original filename (with unique suffix)
      // unique_filename: true, // Ensures Cloudinary makes it unique if use_filename is true
    });

    if (!result || !result.secure_url) {
        throw new Error('Cloudinary upload failed');
    }

    seeker.resumeUrl = result.secure_url;
    seeker.resumeFileName = req.file.originalname;
    // seeker.resumeCloudinaryId = result.public_id; // Optional: store public_id for future deletion

    await seeker.save();

    // Return relevant info
    res.status(200).json({
      message: 'Resume uploaded successfully!',
      resumeUrl: seeker.resumeUrl,
      resumeFileName: seeker.resumeFileName,
      // You could return the whole updated seeker object if preferred:
      // user: await User.findById(seeker._id).select('-password')
    });

  } catch (error) {
    console.error('Upload Seeker Resume Error:', error);
    // Check for specific Cloudinary errors if needed by inspecting error object
    if (error.message && error.message.includes('Only PDF, DOC, and DOCX files are allowed')) {
        return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message || 'Server Error: Could not upload resume.' });
  }
};


export { getSeekerProfile, updateSeekerProfile, uploadSeekerResume }; 


