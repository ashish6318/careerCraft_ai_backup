import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import mockTestService from '../services/mockTestService';
// import { useAuth } from '../context/AuthContext'; // For startTime or user context if needed

const TestTakingPage = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  // const { currentUser } = useAuth();

  const [testData, setTestData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // Stores { questionId: selectedOptionIndex }
  const [startTime, setStartTime] = useState(null); // To record when the test started

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch test data
  useEffect(() => {
    const fetchTest = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await mockTestService.getMockTestForAttempt(testId);
        setTestData(data);
        setQuestions(data.questions || []);
        // Initialize selectedAnswers with null for each question
        const initialAnswers = {};
        if (data.questions) {
          data.questions.forEach(q => {
            initialAnswers[q._id] = null; // Or undefined
          });
        }
        setSelectedAnswers(initialAnswers);
        setStartTime(new Date()); // Record start time when test data is loaded
        setCurrentQuestionIndex(0); // Start with the first question
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load the test. Please try again.');
        console.error("Fetch Test for Attempt Error:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    if (testId) {
      fetchTest();
    }
  }, [testId]);

  const handleOptionSelect = (questionId, optionIndex) => {
    setSelectedAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: optionIndex,
    }));
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prevIndex => prevIndex - 1);
    }
  };

  const handleSubmitTest = async () => {
    if (!window.confirm('Are you sure you want to submit the test?')) {
      return;
    }

    setLoading(true); // Indicate submission process
    setError('');
    
    const answersToSubmit = Object.entries(selectedAnswers)
        .map(([questionId, selectedOptionIndex]) => ({
            questionId,
            selectedOptionIndex,
        }))
        .filter(ans => ans.selectedOptionIndex !== null); // Only submit answered questions or all with nulls if backend handles skips

    try {
      const result = await mockTestService.submitMockTest(testId, answersToSubmit, startTime);
      // result should contain { attemptId, score, ... }
      alert(`Test Submitted! Your Score: ${result.score}/${result.totalMarksPossible} (${result.percentage}%)`);
      navigate(`/mock-test/attempt/${result.attemptId}/result`); // Navigate to results page
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit the test. Please try again.');
      console.error("Submit Test Error:", err.response?.data || err.message);
      setLoading(false); // Reset loading on error
    }
    // setLoading(false) will be handled by navigation or error display
  };


  if (loading && !testData) { // Initial loading of test data
    return <div className="text-center mt-20">Loading test questions...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-500 text-xl">{error}</div>;
  }

  if (!testData || questions.length === 0) {
    return <div className="container mx-auto px-4 py-8 text-center text-xl">Test not found or no questions available.</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="bg-white shadow-xl rounded-lg p-6 md:p-8">
        <div className="mb-6 pb-4 border-b">
          <h1 className="text-2xl md:text-3xl font-bold text-indigo-700 mb-1">{testData.title}</h1>
          <p className="text-sm text-gray-500">Category: {testData.category} {testData.topic ? `(${testData.topic})` : ''}</p>
          <p className="text-sm text-gray-500">Question {currentQuestionIndex + 1} of {questions.length}</p>
          {/* Placeholder for Timer */}
          {/* <p className="text-lg font-semibold text-red-600 mt-2">Time Left: MM:SS</p> */}
        </div>

        {currentQuestion && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 leading-relaxed">
              {currentQuestionIndex + 1}. {currentQuestion.questionText}
            </h2>
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <label
                  key={index}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-150 ease-in-out 
                              ${selectedAnswers[currentQuestion._id] === index 
                                ? 'bg-indigo-100 border-indigo-500 ring-2 ring-indigo-500' 
                                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
                >
                  <input
                    type="radio"
                    name={`question_${currentQuestion._id}`}
                    value={index}
                    checked={selectedAnswers[currentQuestion._id] === index}
                    onChange={() => handleOptionSelect(currentQuestion._id, index)}
                    className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 mr-3"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Navigation and Submit Buttons */}
        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={goToPreviousQuestion}
            disabled={currentQuestionIndex === 0 || loading}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            &larr; Previous
          </button>

          {currentQuestionIndex === questions.length - 1 ? (
            <button
              onClick={handleSubmitTest}
              disabled={loading} // Disable while submitting
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-md shadow-sm transition duration-150 ease-in-out disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Test'}
            </button>
          ) : (
            <button
              onClick={goToNextQuestion}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-md shadow-sm transition duration-150 ease-in-out"
            >
              Next &rarr;
            </button>
          )}
        </div>
        {loading && currentQuestionIndex === questions.length - 1 && <p className="text-center mt-4 text-indigo-600">Submitting your test...</p>}

      </div>
    </div>
  );
};

export default TestTakingPage;
