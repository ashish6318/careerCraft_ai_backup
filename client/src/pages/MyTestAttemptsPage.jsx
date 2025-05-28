import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import mockTestService from '../services/mockTestService';
import { useAuth } from '../context/AuthContext'; // To ensure user is loaded

const MyTestAttemptsPage = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      // This page is protected by ProtectedRoute, so currentUser should be available.
      // If somehow null, ProtectedRoute would redirect.
      setLoading(false);
      return;
    }

    const fetchAttempts = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await mockTestService.getMyTestAttempts();
        setAttempts(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch your test attempts.');
        console.error("Fetch My Test Attempts Error:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAttempts();
  }, [currentUser]); // Re-fetch if user context changes

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  const formatTimeTaken = (seconds) => {
    if (seconds === null || seconds === undefined) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  if (loading) {
    return <div className="text-center mt-20">Loading your test history...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-500 text-xl">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Test Attempts</h1>
        <Link
            to="/mock-tests"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm transition duration-150 ease-in-out"
        >
            Take New Test
        </Link>
      </div>


      {attempts.length === 0 ? (
        <div className="text-center text-gray-600 py-10 bg-white p-6 rounded-lg shadow">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-xl mt-4 mb-2">You haven't attempted any mock tests yet.</p>
          <p className="text-gray-500">
            Visit the <Link to="/mock-tests" className="text-indigo-600 hover:underline">Mock Tests</Link> page to get started!
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-xl rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Title</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Taken</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Taken</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attempts.map((attempt) => (
                <tr key={attempt._id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{attempt.mockTestTitle}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{attempt.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(attempt.createdAt)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{attempt.score} / {attempt.totalMarksPossible}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">{attempt.percentage}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatTimeTaken(attempt.timeTakenSeconds)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        attempt.status === 'completed' ? 'bg-green-100 text-green-800' : 
                        (attempt.status === 'inprogress' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800')
                    }`}>
                      {attempt.status.charAt(0).toUpperCase() + attempt.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/mock-test/attempt/${attempt._id}/result`} className="text-indigo-600 hover:text-indigo-900">
                      View Results
                    </Link>
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

export default MyTestAttemptsPage;
