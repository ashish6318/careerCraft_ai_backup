import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import mockTestService from '../services/mockTestService';

const MockTestListPage = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // TODO: Add state and handlers for filters (category, difficulty) later

  useEffect(() => {
    const fetchTests = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await mockTestService.getAllMockTests();
        setTests(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch mock tests.');
        console.error("Fetch All Mock Tests Error:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, []);

  if (loading) {
    return <div className="text-center mt-20">Loading available mock tests...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-500 text-xl">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-10 text-center">Available Mock Tests</h1>

      {/* Placeholder for Filters - Implement Later */}
      {/* <div className="mb-8 p-4 bg-gray-100 rounded-lg shadow-sm">
        <p className="text-center text-gray-700">Filter options (by category, difficulty) will go here.</p>
      </div> */}

      {tests.length === 0 ? (
        <div className="text-center text-gray-600 py-12 bg-white p-6 rounded-lg shadow">
           <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h10l-1-1-0.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p className="text-xl mt-4 mb-2">No mock tests available at the moment.</p>
          <p className="text-gray-500">Please check back later!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tests.map((test) => (
            <div key={test._id} className="bg-white shadow-xl rounded-lg overflow-hidden flex flex-col hover:shadow-2xl transition-shadow duration-300">
              <div className="p-6 flex-grow">
                <h2 className="text-xl font-semibold text-indigo-700 mb-2">{test.title}</h2>
                <p className="text-sm text-gray-500 mb-1 capitalize">
                  <span className="font-medium">Category:</span> {test.category}
                </p>
                {test.topic && (
                  <p className="text-sm text-gray-500 mb-1 capitalize">
                    <span className="font-medium">Topic:</span> {test.topic}
                  </p>
                )}
                <p className="text-sm text-gray-500 mb-3 capitalize">
                  <span className="font-medium">Difficulty:</span> {test.difficultyLevel || 'N/A'}
                </p>
                <p className="text-sm text-gray-700 mb-3 line-clamp-3">
                  {test.description || 'No description available.'}
                </p>
                <div className="text-xs text-gray-500 space-y-1">
                    <p>Questions: {test.questionCount || test.questions?.length || 'N/A'}</p>
                    <p>Total Marks: {test.totalMarks || 'N/A'}</p>
                    <p>Duration: {test.durationMinutes ? `${test.durationMinutes} minutes` : 'N/A'}</p>
                </div>
              </div>
              <div className="p-6 bg-gray-50 border-t border-gray-200 text-center">
                <Link
                  to={`/mock-test/${test._id}/take`}
                  className="w-full inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-4 rounded-md shadow-sm transition duration-150 ease-in-out"
                >
                  Start Test
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MockTestListPage;
