import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import jobService from '../services/jobService';
import { useAuth } from '../context/AuthContext';

const EditJobPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // To ensure user context is loaded

  const [jobDetails, setJobDetails] = useState({
    title: '',
    description: '',
    location: '',
    salary: '',
    jobType: 'Full-time',
    experienceLevel: 'Not Specified',
    category: '',
    skillsRequired: '', // Will be joined from array for input, then split
    applicationDeadline: '',
    applicationInstructions: '',
    status: 'open', // Add status to the form
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true); // For initial data fetch

  useEffect(() => {
    if (!currentUser) return; // Wait for user context

    const fetchJobData = async () => {
      setPageLoading(true);
      try {
        const data = await jobService.getJobById(jobId);
        // Ensure the current user is the one who posted the job (additional client-side check)
        if (data.postedBy !== currentUser._id) {
          setError("You are not authorized to edit this job.");
          // Optionally redirect: navigate('/unauthorized');
          setPageLoading(false);
          return;
        }
        setJobDetails({
          ...data,
          skillsRequired: Array.isArray(data.skillsRequired) ? data.skillsRequired.join(', ') : '',
          applicationDeadline: data.applicationDeadline ? new Date(data.applicationDeadline).toISOString().split('T')[0] : '',
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch job data for editing.');
        console.error("Fetch Job for Edit Error:", err.response?.data || err.message);
      } finally {
        setPageLoading(false);
      }
    };

    fetchJobData();
  }, [jobId, currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJobDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!jobDetails.title || !jobDetails.description || !jobDetails.location || !jobDetails.jobType || !jobDetails.category) {
        setError('Please fill in all required fields: Title, Description, Location, Job Type, and Category.');
        setLoading(false);
        return;
    }

    const skillsArray = jobDetails.skillsRequired.split(',').map(skill => skill.trim()).filter(skill => skill);

    const jobDataToSubmit = {
      ...jobDetails,
      skillsRequired: skillsArray,
      applicationDeadline: jobDetails.applicationDeadline || null,
    };
    // Remove fields that should not be sent or are handled by backend (like companyName, postedBy)
    delete jobDataToSubmit._id;
    delete jobDataToSubmit.companyName; // Assuming companyName is not editable or derived on backend
    delete jobDataToSubmit.postedBy;
    delete jobDataToSubmit.createdAt;
    delete jobDataToSubmit.updatedAt;
    delete jobDataToSubmit.__v;


    try {
      await jobService.updateJob(jobId, jobDataToSubmit);
      alert('Job updated successfully!');
      navigate(`/jobs/${jobId}`); // Navigate to the job detail page
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update job. Please try again.');
      console.error("Update Job Error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const jobTypeOptions = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Temporary', 'Remote'];
  const experienceLevelOptions = ['Entry-level', 'Mid-level', 'Senior-level', 'Lead', 'Manager', 'Executive', 'Not Specified'];
  const categoryOptions = ['Software Development', 'Data Science', 'AI/ML', 'Marketing', 'Design', 'Sales', 'Customer Support', 'HR', 'Other'];
  const statusOptions = ['open', 'closed', 'archived'];


  if (pageLoading) {
    return <div className="text-center mt-20">Loading job data for editing...</div>;
  }

  if (error && !jobDetails.title) { // If initial fetch failed critically
    return <div className="container mx-auto px-4 py-8 text-center text-red-500 text-xl">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white p-8 shadow-lg rounded-lg">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Edit Job Posting</h1>
        {error && <p className="mb-4 text-red-600 bg-red-100 p-3 rounded-md text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Job Title <span className="text-red-500">*</span></label>
            <input type="text" name="title" id="title" value={jobDetails.title} onChange={handleChange} required
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>

          {/* Job Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Job Description <span className="text-red-500">*</span></label>
            <textarea name="description" id="description" value={jobDetails.description} onChange={handleChange} required rows="6"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location <span className="text-red-500">*</span></label>
            <input type="text" name="location" id="location" value={jobDetails.location} onChange={handleChange} required
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>

          {/* Job Type & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="jobType" className="block text-sm font-medium text-gray-700 mb-1">Job Type <span className="text-red-500">*</span></label>
              <select name="jobType" id="jobType" value={jobDetails.jobType} onChange={handleChange} required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                {jobTypeOptions.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
              <input type="text" name="category" id="category" list="category-options" value={jobDetails.category} onChange={handleChange} required
                     className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="e.g., Software Engineering"/>
              <datalist id="category-options">
                {categoryOptions.map(option => <option key={option} value={option}/>)}
              </datalist>
            </div>
          </div>

          {/* Salary */}
          <div>
            <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-1">Salary Range (Optional)</label>
            <input type="text" name="salary" id="salary" value={jobDetails.salary || ''} onChange={handleChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="e.g., $60,000 - $80,000 per year or Competitive" />
          </div>

          {/* Experience Level */}
          <div>
            <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700 mb-1">Experience Level (Optional)</label>
            <select name="experienceLevel" id="experienceLevel" value={jobDetails.experienceLevel} onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              {experienceLevelOptions.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>

          {/* Skills Required */}
          <div>
            <label htmlFor="skillsRequired" className="block text-sm font-medium text-gray-700 mb-1">Skills Required (Comma-separated)</label>
            <input type="text" name="skillsRequired" id="skillsRequired" value={jobDetails.skillsRequired} onChange={handleChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="e.g., React, Node.js, MongoDB" />
          </div>

          {/* Application Deadline */}
          <div>
            <label htmlFor="applicationDeadline" className="block text-sm font-medium text-gray-700 mb-1">Application Deadline (Optional)</label>
            <input type="date" name="applicationDeadline" id="applicationDeadline" value={jobDetails.applicationDeadline} onChange={handleChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>

           {/* Application Instructions */}
           <div>
            <label htmlFor="applicationInstructions" className="block text-sm font-medium text-gray-700 mb-1">Application Instructions (Optional)</label>
            <textarea name="applicationInstructions" id="applicationInstructions" value={jobDetails.applicationInstructions || ''} onChange={handleChange} rows="3"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="e.g., Apply via our careers page: company.com/careers or Email resumes to hr@example.com"></textarea>
          </div>
          
          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Job Status <span className="text-red-500">*</span></label>
            <select name="status" id="status" value={jobDetails.status} onChange={handleChange} required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              {statusOptions.map(option => <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>)}
            </select>
          </div>


          {/* Submit Button */}
          <div className="pt-2 flex space-x-4">
            <button type="submit" disabled={loading || pageLoading}
                    className="flex-1 justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-75">
              {loading ? 'Saving Changes...' : 'Save Changes'}
            </button>
            <Link to={`/jobs/${jobId}`} className="flex-1 text-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditJobPage;
