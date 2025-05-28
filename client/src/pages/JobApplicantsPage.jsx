import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import applicationService from '../services/applicationService';
import jobService from '../services/jobService'; // To fetch job title
import { useAuth } from '../context/AuthContext';

const JobApplicantsPage = () => {
  const { jobId } = useParams();
  const { currentUser } = useAuth();
  const [jobTitle, setJobTitle] = useState('');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusUpdateInfo, setStatusUpdateInfo] = useState({ id: null, error: '', success: '' });

  const applicationStatusOptions = ['applied', 'viewed', 'shortlisted', 'interviewing', 'offered', 'rejected', 'hired'];

  const fetchJobAndApplicants = useCallback(async () => {
    if (!currentUser || !jobId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      // Fetch job details to display title and verify ownership (backend also does this)
      const jobData = await jobService.getJobById(jobId);
      setJobTitle(jobData.title);
      // Ensure current user is the one who posted the job
      if (jobData.postedBy !== currentUser._id) {
        setError('You are not authorized to view applicants for this job.');
        setLoading(false);
        return;
      }
      const applicantsData = await applicationService.getJobApplicants(jobId);
      setApplications(applicantsData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch job applicants.');
      console.error("Fetch Job Applicants Error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, [jobId, currentUser]);

  useEffect(() => {
    fetchJobAndApplicants();
  }, [fetchJobAndApplicants]);

  const handleStatusChange = async (applicationId, newStatus) => {
    setStatusUpdateInfo({ id: applicationId, error: '', success: '' }); // Clear previous messages for this app
    try {
      const response = await applicationService.updateApplicationStatus(applicationId, newStatus);
      setApplications(prevApps =>
        prevApps.map(app =>
          app._id === applicationId ? { ...app, status: response.application.status } : app
        )
      );
      setStatusUpdateInfo({ id: applicationId, error: '', success: response.message });
    } catch (err) {
      setStatusUpdateInfo({ id: applicationId, error: err.response?.data?.message || 'Failed to update status.', success: '' });
      console.error("Update Status Error:", err.response?.data || err.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };
  
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) { // Added optional chaining for status
      case 'applied': return 'bg-blue-100 text-blue-800';
      case 'viewed': return 'bg-yellow-100 text-yellow-800';
      case 'shortlisted': return 'bg-purple-100 text-purple-800';
      case 'interviewing': return 'bg-indigo-100 text-indigo-800';
      case 'offered': return 'bg-teal-100 text-teal-800';
      case 'hired': return 'bg-green-100 text-green-800';
      case 'rejected': case 'withdrawn': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };


  if (loading) {
    return <div className="text-center mt-10">Loading applicants...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/recruiter/my-jobs" className="text-indigo-600 hover:text-indigo-800 mb-6 inline-block">&larr; Back to My Jobs</Link>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Applicants for: <span className="text-indigo-700">{jobTitle}</span></h1>
      <p className="text-sm text-gray-500 mb-8">Manage applications and update their statuses.</p>

      {applications.length === 0 ? (
        <div className="text-center text-gray-600 py-10 bg-white shadow-md rounded-lg">
           <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <p className="text-xl mt-4">No applications received for this job yet.</p>
        </div>
      ) : (
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied On</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resume</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Update Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applications.map((app) => (
                <tr key={app._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{app.seekerId?.fullName || 'N/A'}</div>
                    <div className="text-xs text-gray-500">{app.seekerId?.email || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(app.applicationDate)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {app.seekerId?.resumeUrl ? (
                      <a href={app.seekerId.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900 font-medium">
                        {app.seekerId.resumeFileName || 'View Resume'}
                      </a>
                    ) : (
                      <span className="text-gray-400">No Resume</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(app.status)}`}>
                      {app.status ? app.status.charAt(0).toUpperCase() + app.status.slice(1) : 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app._id, e.target.value)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      {applicationStatusOptions.map(statusOpt => (
                        <option key={statusOpt} value={statusOpt}>
                          {statusOpt.charAt(0).toUpperCase() + statusOpt.slice(1)}
                        </option>
                      ))}
                    </select>
                    {statusUpdateInfo.id === app._id && statusUpdateInfo.success && <p className="text-xs text-green-600 mt-1">{statusUpdateInfo.success}</p>}
                    {statusUpdateInfo.id === app._id && statusUpdateInfo.error && <p className="text-xs text-red-600 mt-1">{statusUpdateInfo.error}</p>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default JobApplicantsPage;
