import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import mockTestService from '../services/mockTestService';
import { useAuth } from '../context/AuthContext'; // Optional: for user context if needed

const TestResultPage = () => {
  const { attemptId } = useParams();
  // const { currentUser } = useAuth(); // If needed for any user-specific display
  const [attemptDetails, setAttemptDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!attemptId) {
      setError('No attempt ID provided.');
      setLoading(false);
      return;
    }

    const fetchAttemptResult = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await mockTestService.getTestAttemptResult(attemptId);
        setAttemptDetails(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch test results.');
        console.error("Fetch Test Result Error:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAttemptResult();
  }, [attemptId]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const formatTimeTaken = (seconds) => {
    if (seconds === null || seconds === undefined) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  if (loading) {
    return <div className="text-center mt-20">Loading your test results...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-500 text-xl">{error}</div>;
  }

  if (!attemptDetails) {
    return <div className="container mx-auto px-4 py-8 text-center text-xl">Test attempt details not found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white shadow-xl rounded-lg p-6 md:p-8">
        <h1 className="text-3xl font-bold text-indigo-700 mb-3 text-center">Test Results</h1>
        <p className="text-xl text-gray-700 mb-6 text-center">'{attemptDetails.mockTestTitle}'</p>

        {/* Summary Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-4 bg-gray-50 rounded-lg shadow-sm">
          <div className="text-center">
            <p className="text-sm text-gray-500 uppercase">Score</p>
            <p className="text-2xl font-bold text-green-600">
              {attemptDetails.score} / {attemptDetails.totalMarksPossible}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 uppercase">Percentage</p>
            <p className="text-2xl font-bold text-green-600">{attemptDetails.percentage}%</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 uppercase">Time Taken</p>
            <p className="text-lg font-semibold text-gray-700">{formatTimeTaken(attemptDetails.timeTakenSeconds)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 uppercase">Completed On</p>
            <p className="text-lg font-semibold text-gray-700">{formatDate(attemptDetails.endTime)}</p>
          </div>
        </div>

        {/* Detailed Question Review */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Detailed Review:</h2>
        <div className="space-y-8">
          {attemptDetails.answers.map((answer, index) => (
            <div key={answer.questionId || index} className={`p-4 border rounded-lg ${answer.isCorrect ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
              <p className="font-semibold text-gray-700 mb-2">
                Q{index + 1}. {answer.questionText}
              </p>
              <div className="space-y-2 mb-3">
                {answer.optionsProvided.map((option, optIndex) => (
                  <div
                    key={optIndex}
                    className={`p-2 border rounded-md text-sm flex items-center
                      ${optIndex === answer.correctOptionIndex ? 'bg-green-200 border-green-400 font-medium text-green-800' : ''}
                      ${optIndex === answer.selectedOptionIndex && optIndex !== answer.correctOptionIndex ? 'bg-red-200 border-red-400 text-red-800' : ''}
                      ${optIndex === answer.selectedOptionIndex && optIndex === answer.correctOptionIndex ? '' : (optIndex !== answer.correctOptionIndex ? 'text-gray-600' : '')}
                    `}
                  >
                    <span className={`mr-2 font-bold ${
                        optIndex === answer.correctOptionIndex ? 'text-green-700' : 
                        (optIndex === answer.selectedOptionIndex ? 'text-red-700' : 'text-gray-500')
                    }`}>
                        {String.fromCharCode(65 + optIndex)}. {/* A, B, C... */}
                    </span>
                    {option}
                    {optIndex === answer.selectedOptionIndex && <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-300 text-gray-700">Your Answer</span>}
                    {optIndex === answer.correctOptionIndex && answer.selectedOptionIndex !== optIndex && <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-green-500 text-white">Correct</span>}
                  </div>
                ))}
                 {answer.selectedOptionIndex === undefined || answer.selectedOptionIndex === null && (
                    <p className="text-sm text-yellow-700 font-medium mt-1">Not Answered</p>
                )}
              </div>
              {answer.explanation && (
                <div className="mt-3 pt-3 border-t border-dashed">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Explanation:</p>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{answer.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Navigation Links */}
        <div className="mt-10 pt-6 border-t text-center space-x-4">
          <Link
            to="/my-test-attempts" // We'll create this page next
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-md shadow-sm transition duration-150"
          >
            View All My Attempts
          </Link>
          <Link
            to="/mock-tests"
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-6 rounded-md shadow-sm transition duration-150"
          >
            Take Another Test
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TestResultPage;
