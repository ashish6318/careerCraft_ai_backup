import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import applicationService from '../services/applicationService';
import { useAuth } from '../context/AuthContext';

const MyApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth(); // For conditional rendering or checks if needed

  useEffect(() => {
    // Ensure currentUser is loaded before fetching, though backend route is protected
    if (!currentUser) {
      setLoading(false); // Stop loading if no user (should be caught by ProtectedRoute)
      return;
    }

    const fetchApplications = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await applicationService.getMyApplications();
        setApplications(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch your applications.');
        console.error("Fetch My Applications Error:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [currentUser]); // Re-fetch if currentUser changes

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'applied':
        return 'bg-blue-100 text-blue-800';
      case 'viewed':
        return 'bg-yellow-100 text-yellow-800';
      case 'shortlisted':
        return 'bg-purple-100 text-purple-800';
      case 'interviewing':
        return 'bg-indigo-100 text-indigo-800';
      case 'offered':
        return 'bg-teal-100 text-teal-800';
      case 'hired':
        return 'bg-green-100 text-green-800';
      case 'rejected':
      case 'withdrawn':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };


  if (loading) {
    return <div className="text-center mt-10">Loading your applications...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">My Job Applications</h1>

      {applications.length === 0 ? (
        <div className="text-center text-gray-600 py-10 bg-white shadow-md rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-xl mt-4 mb-2">You haven't applied for any jobs yet.</p>
          <Link to="/jobs" className="text-indigo-600 hover:text-indigo-800 font-semibold">
            Find jobs to apply for
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map((app) => (
            <div key={app._id} className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex flex-col sm:flex-row justify-between sm:items-start">
                <div>
                  <h2 className="text-xl font-semibold text-indigo-700 mb-1">
                    {app.jobId ? app.jobId.title : 'Job Title Not Available'}
                  </h2>
                  <p className="text-md text-gray-700 font-medium mb-1">
                    {app.jobId ? app.jobId.companyName : 'Company Not Available'}
                  </p>
                  <p className="text-sm text-gray-500 mb-2">
                    Applied on: {formatDate(app.applicationDate)}
                  </p>
                </div>
                <div className="mt-2 sm:mt-0 sm:text-right">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(app.status)}`}>
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </span>
                </div>
              </div>
              {app.jobId && ( // Only show link if jobId is populated
                <div className="mt-4 pt-4 border-t border-gray-200 text-right">
                  <Link
                    to={`/jobs/${app.jobId._id}`}
                    className="text-indigo-600 hover:text-indigo-800 font-semibold transition duration-150 ease-in-out text-sm"
                  >
                    View Job Details &rarr;
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyApplicationsPage;
