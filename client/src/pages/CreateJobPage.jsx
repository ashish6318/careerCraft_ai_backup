import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import jobService from '../services/jobService'; // Import your job service
// import { useAuth } from '../context/AuthContext'; // If you need currentUser for anything specific here

const CreateJobPage = () => {
  // const { currentUser } = useAuth(); // Recruiter info is handled by backend via token
  const navigate = useNavigate();
  const [jobDetails, setJobDetails] = useState({
    title: '',
    description: '',
    location: '',
    salary: '', // e.g., "50000 - 70000 INR per annum" or "Competitive"
    jobType: 'Full-time', // Default value
    experienceLevel: 'Not Specified',
    category: '',
    skillsRequired: '', // Will be split into an array
    applicationDeadline: '',
    applicationInstructions: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

    // Basic validation
    if (!jobDetails.title || !jobDetails.description || !jobDetails.location || !jobDetails.jobType || !jobDetails.category) {
        setError('Please fill in all required fields: Title, Description, Location, Job Type, and Category.');
        setLoading(false);
        return;
    }

    const skillsArray = jobDetails.skillsRequired.split(',').map(skill => skill.trim()).filter(skill => skill);

    const jobDataToSubmit = {
      ...jobDetails,
      skillsRequired: skillsArray,
      applicationDeadline: jobDetails.applicationDeadline || null, // Send null if empty
    };

    try {
      await jobService.createJob(jobDataToSubmit);
      alert('Job posted successfully!'); // Replace with a nicer notification/toast later
      navigate('/recruiter/my-jobs'); // Navigate to recruiter's jobs list or dashboard
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post job. Please try again.');
      console.error("Create Job Error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const jobTypeOptions = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Temporary', 'Remote'];
  const experienceLevelOptions = ['Entry-level', 'Mid-level', 'Senior-level', 'Lead', 'Manager', 'Executive', 'Not Specified'];
  // Define categories based on your backend Job model's enum or expected values if any
  const categoryOptions = ['Software Development', 'Data Science', 'AI/ML', 'Marketing', 'Design', 'Sales', 'Customer Support', 'HR', 'Other'];


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white p-8 shadow-lg rounded-lg">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Post a New Job</h1>
        {error && <p className="mb-4 text-red-600 bg-red-100 p-3 rounded-md text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Job Title <span className="text-red-500">*</span></label>
            <input type="text" name="title" id="title" value={jobDetails.title} onChange={handleChange} required
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Job Description <span className="text-red-500">*</span></label>
            <textarea name="description" id="description" value={jobDetails.description} onChange={handleChange} required rows="6"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location <span className="text-red-500">*</span></label>
            <input type="text" name="location" id="location" value={jobDetails.location} onChange={handleChange} required
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>

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

          <div>
            <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-1">Salary Range (Optional)</label>
            <input type="text" name="salary" id="salary" value={jobDetails.salary} onChange={handleChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="e.g., $60,000 - $80,000 per year or Competitive" />
          </div>

          <div>
            <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700 mb-1">Experience Level (Optional)</label>
            <select name="experienceLevel" id="experienceLevel" value={jobDetails.experienceLevel} onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              {experienceLevelOptions.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="skillsRequired" className="block text-sm font-medium text-gray-700 mb-1">Skills Required (Comma-separated)</label>
            <input type="text" name="skillsRequired" id="skillsRequired" value={jobDetails.skillsRequired} onChange={handleChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="e.g., React, Node.js, MongoDB" />
          </div>

          <div>
            <label htmlFor="applicationDeadline" className="block text-sm font-medium text-gray-700 mb-1">Application Deadline (Optional)</label>
            <input type="date" name="applicationDeadline" id="applicationDeadline" value={jobDetails.applicationDeadline} onChange={handleChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
           <div>
            <label htmlFor="applicationInstructions" className="block text-sm font-medium text-gray-700 mb-1">Application Instructions (Optional)</label>
            <textarea name="applicationInstructions" id="applicationInstructions" value={jobDetails.applicationInstructions} onChange={handleChange} rows="3"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="e.g., Apply via our careers page: company.com/careers or Email resumes to hr@example.com"></textarea>
          </div>

          <div className="pt-2">
            <button type="submit" disabled={loading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-75">
              {loading ? 'Submitting...' : 'Post Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateJobPage;
