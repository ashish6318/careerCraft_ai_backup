import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import jobService from '../services/jobService';
import applicationService from '../services/applicationService';
import { useAuth } from '../context/AuthContext';

const JobDetailPage = () => {
  const { jobId } = useParams();
  const { currentUser } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState('');

  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applySuccessMessage, setApplySuccessMessage] = useState('');

  useEffect(() => {
    console.log('[JobDetailPage] useEffect triggered. Job ID:', jobId);
    const fetchJobDetails = async () => {
      setLoading(true); // Explicitly set loading true at the start of fetch
      setError('');
      setApplyError('');
      setApplySuccessMessage('');
      setJob(null); // Reset job state before fetching new one
      try {
        console.log('[JobDetailPage] Fetching job details for ID:', jobId);
        const data = await jobService.getJobById(jobId);
        console.log('[JobDetailPage] Fetched data:', data);
        setJob(data); // If API returns null for not found (and 200 OK), job will be null
      } catch (err) {
        console.error("[JobDetailPage] Fetch Job Details Error:", err.response?.data || err.message, err);
        setError(err.response?.data?.message || 'Failed to fetch job details.');
        setJob(null); // Ensure job is null on error
      } finally {
        setLoading(false);
        console.log('[JobDetailPage] Fetch complete. Loading set to false.');
      }
    };

    if (jobId) {
      fetchJobDetails();
    } else {
      setError('No Job ID provided.');
      setLoading(false);
      setJob(null);
    }
  }, [jobId]); // Dependency array includes jobId

  const formatDate = (dateString) => { /* ... same ... */
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };
  const handleApply = async () => { /* ... same ... */
    if (!currentUser || currentUser.role !== 'seeker') {
      setApplyError('Only seekers can apply for jobs. Please log in as a seeker.');
      return;
    }
    setIsApplying(true);
    setApplyError('');
    setApplySuccessMessage('');
    try {
      const response = await applicationService.applyForJob(jobId);
      setApplySuccessMessage(response.message || 'Application submitted successfully!');
    } catch (err) {
      setApplyError(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setIsApplying(false);
    }
  };

  // Log state right before rendering decisions
  // console.log('[JobDetailPage] Pre-render state: loading=', loading, 'error=', error, 'job=', job);

  if (loading) {
    // console.log('[JobDetailPage] Rendering: Loading...');
    return <div className="text-center mt-20">Loading job details...</div>;
  }

  if (error) {
    // console.log('[JobDetailPage] Rendering: Error -', error);
    return <div className="container mx-auto px-4 py-8 text-center text-red-500 text-xl">{error}</div>;
  }

  if (!job) { // This is the crucial check if loading is false and no error
    // console.log('[JobDetailPage] Rendering: Job not found (job is null/undefined)');
    return <div className="container mx-auto px-4 py-8 text-center text-xl">Job not found or could not be loaded.</div>;
  }

  // If we reach here, job should be an object with data
  // console.log('[JobDetailPage] Rendering: Main job content. Job title:', job.title);
  const canApply = currentUser?.role === 'seeker' && job.status === 'open' && !applySuccessMessage;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white shadow-2xl rounded-lg p-8 md:p-12">
        {/* Job Header */}
        <div className="mb-6 pb-4 border-b border-gray-200">
          {/* Line 99 (approximately) would be here or just after */}
          <h1 className="text-3xl md:text-4xl font-bold text-indigo-700 mb-2">{job.title}</h1>
          <p className="text-xl text-gray-700 font-medium">{job.companyName}</p>
          <p className="text-md text-gray-500">{job.location}</p>
        </div>

        {/* ... Rest of your JSX for displaying job details ... */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase">Job Type</p>
            <p className="text-md text-gray-800">{job.jobType}</p>
          </div>
          {job.salary && (
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase">Salary</p>
              <p className="text-md text-gray-800">{job.salary}</p>
            </div>
          )}
          {job.experienceLevel && job.experienceLevel !== 'Not Specified' && (
             <div>
              <p className="text-sm font-semibold text-gray-500 uppercase">Experience Level</p>
              <p className="text-md text-gray-800">{job.experienceLevel}</p>
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase">Category</p>
            <p className="text-md text-gray-800">{job.category}</p>
          </div>
           <div>
            <p className="text-sm font-semibold text-gray-500 uppercase">Posted On</p>
            <p className="text-md text-gray-800">{formatDate(job.createdAt)}</p>
          </div>
          {job.applicationDeadline && (
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase">Apply By</p>
              <p className="text-md text-red-600 font-semibold">{formatDate(job.applicationDeadline)}</p>
            </div>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">Job Description</h2>
          <div className="prose prose-indigo max-w-none text-gray-700 whitespace-pre-wrap">
            {job.description}
          </div>
        </div>

        {job.skillsRequired && job.skillsRequired.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">Skills Required</h2>
            <div className="flex flex-wrap gap-2">
              {job.skillsRequired.map((skill, index) => (
                <span key={index} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {job.applicationInstructions && (
            <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-3">How to Apply</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{job.applicationInstructions}</p>
            </div>
        )}

        <div className="mt-10 pt-6 border-t border-gray-200 space-y-3">
          {applyError && <p className="text-red-600 bg-red-100 p-3 rounded text-sm">{applyError}</p>}
          {applySuccessMessage && <p className="text-green-600 bg-green-100 p-3 rounded text-sm">{applySuccessMessage}</p>}

          {canApply && (
            <button
              onClick={handleApply}
              disabled={isApplying}
              className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-150 ease-in-out text-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isApplying ? 'Submitting Application...' : 'Apply Now'}
            </button>
          )}
          {!canApply && currentUser?.role === 'seeker' && job.status === 'open' && applySuccessMessage && (
             <button
              disabled={true}
              className="w-full md:w-auto bg-gray-400 text-white font-bold py-3 px-6 rounded-lg shadow-md text-lg disabled:cursor-not-allowed"
            >
              Applied ✓
            </button>
          )}


          {currentUser?.role === 'company_recruiter' && currentUser?._id === job.postedBy && (
            <div className="flex space-x-4">
              <Link
                to={`/recruiter/edit-job/${job._id}`}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm transition duration-150 ease-in-out"
              >
                Edit Job
              </Link>
              <button
                // onClick={handleDelete} // Ensure handleDelete is defined if you re-enable
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm transition duration-150 ease-in-out"
              >
                Delete Job
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetailPage;
