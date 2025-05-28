import multer from 'multer';
import path from 'path';

// Configure Multer for in-memory storage
// This is useful if you want to process the file (e.g., upload to Cloudinary)
// without saving it to the local disk first.
const storage = multer.memoryStorage();

// File filter to accept only certain file types (e.g., PDF, DOC, DOCX for resumes)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx/;
  // Check the mimetype and the extension
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('File upload failed: Only PDF, DOC, and DOCX files are allowed for resumes.'), false);
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit for resumes
  },
  fileFilter: fileFilter,
});

// Middleware for single resume upload
// 'resumeFile' is the field name in the form-data from the client
const uploadResume = upload.single('resumeFile');

export { uploadResume };
