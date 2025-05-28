import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import jobService from '../services/jobService'; // Your job service
import { useAuth } from '../context/AuthContext'; // To ensure user is loaded

const RecruiterMyJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      // This page should be protected by ProtectedRoute, so currentUser should exist.
      // If not, ProtectedRoute would redirect. If still null, means auth context might not be loaded.
      setLoading(false); // Stop loading if no user, though ideally ProtectedRoute handles this
      return;
    }

    const fetchRecruiterJobs = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await jobService.getRecruiterJobs();
        setJobs(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch your jobs. Please try again.');
        console.error("Fetch Recruiter Jobs Error:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecruiterJobs();
  }, [currentUser]); // Re-fetch if currentUser changes

  // Function to format date (can be moved to a utils file if used elsewhere)
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };
  
  // Placeholder for delete functionality if you add it directly to this page
  // const handleDeleteJob = async (jobId) => {
  //   if (window.confirm('Are you sure you want to delete this job?')) {
  //     try {
  //       await jobService.deleteJob(jobId);
  //       setJobs(prevJobs => prevJobs.filter(job => job._id !== jobId));
  //       alert('Job deleted successfully');
  //     } catch (err) {
  //       alert(err.response?.data?.message || 'Failed to delete job.');
  //     }
  //   }
  // };


  if (loading) {
    return <div className="text-center mt-10">Loading your job postings...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Job Postings</h1>
        <Link
          to="/create-job"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm transition duration-150 ease-in-out"
        >
          Post New Job
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center text-gray-600 py-10 bg-white p-6 rounded-lg shadow">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-6c0-1.414.586-2.667 1.757-3.414C12.273 7.18 13.049 7 14.414 7c1.265 0 2.024.182 3.3.803M7.5 9.31C8.819 8.313 10.57 8 12.414 8c1.365 0 2.533.18 3.8.803" /> {/* Simplified icon */}
          </svg>
          <p className="text-xl mb-2">You haven't posted any jobs yet.</p>
          <p className="text-gray-500">Click the "Post New Job" button to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div key={job._id} className="bg-white shadow-lg rounded-lg p-6 flex flex-col justify-between hover:shadow-xl transition-shadow duration-300">
              <div>
                <h2 className="text-xl font-semibold text-indigo-700 mb-2 truncate" title={job.title}>{job.title}</h2>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Location:</span> {job.location}
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  <span className="font-medium">Status:</span>
                  <span className={`ml-1 px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    job.status === 'open' ? 'bg-green-100 text-green-800' : (job.status === 'closed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800')
                  }`}>
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </span>
                </p>
                <p className="text-xs text-gray-400">
                  Posted: {formatDate(job.createdAt)}
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-gray-200 flex flex-wrap justify-end gap-2"> {/* Use gap for spacing */}
                <Link
                  to={`/recruiter/job/${job._id}/applicants`}
                  className="text-xs text-green-700 hover:text-white font-semibold py-1.5 px-3 rounded-md bg-green-100 hover:bg-green-600 transition-colors duration-150 ease-in-out"
                >
                  View Applicants
                </Link>
                <Link
                  to={`/jobs/${job._id}`}
                  className="text-xs text-indigo-700 hover:text-white font-semibold py-1.5 px-3 rounded-md bg-indigo-100 hover:bg-indigo-600 transition-colors duration-150 ease-in-out"
                >
                  Details
                </Link>
                <Link
                  to={`/recruiter/edit-job/${job._id}`}
                  className="text-xs text-blue-700 hover:text-white font-semibold py-1.5 px-3 rounded-md bg-blue-100 hover:bg-blue-600 transition-colors duration-150 ease-in-out"
                >
                  Edit
                </Link>
                {/* <button 
                  onClick={() => handleDeleteJob(job._id)} 
                  className="text-xs text-red-700 hover:text-white font-semibold py-1.5 px-3 rounded-md bg-red-100 hover:bg-red-600 transition-colors duration-150 ease-in-out"
                >
                  Delete
                </button> 
                */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecruiterMyJobsPage;
