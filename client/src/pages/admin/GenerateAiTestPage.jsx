import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // For redirecting after test creation
import aiService from '../../services/aiService';
import mockTestService from '../../services/mockTestService'; // Import mockTestService

const GenerateAiTestPage = () => {
  const navigate = useNavigate();
  const [generationParams, setGenerationParams] = useState({
    category: 'JavaScript',
    topic: 'Arrays',
    difficultyLevel: 'Intermediate',
    numberOfQuestions: 3,
  });
  const [generatedQuestions, setGeneratedQuestions] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState('');
  const [generationSuccess, setGenerationSuccess] = useState('');

  // State for new Mock Test details
  const [newTestData, setNewTestData] = useState({
    title: '',
    description: '',
    category: '', // Will be pre-filled from generationParams
    topic: '',     // Will be pre-filled
    difficultyLevel: '', // Will be pre-filled
    durationMinutes: 10, // Default duration
    status: 'published',   // Default status
  });
  const [isSavingTest, setIsSavingTest] = useState(false);
  const [saveTestError, setSaveTestError] = useState('');
  const [saveTestSuccess, setSaveTestSuccess] = useState('');

  const handleParamChange = (e) => {
    const { name, value } = e.target;
    setGenerationParams(prev => ({ ...prev, [name]: value }));
  };

  const handleNewTestDetailChange = (e) => {
    const { name, value } = e.target;
    setNewTestData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateSubmit = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setGenerationError('');
    setGenerationSuccess('');
    setGeneratedQuestions(null); // Clear previous questions
    setSaveTestError(''); // Clear previous save errors
    setSaveTestSuccess('');

    const params = {
      ...generationParams,
      numberOfQuestions: parseInt(generationParams.numberOfQuestions, 10),
    };

    try {
      const response = await aiService.generateAiTestQuestions(params);
      setGeneratedQuestions(response.questions);
      setGenerationSuccess(response.message || `${response.questions?.length || 0} questions generated.`);
      // Pre-fill new test details based on generation params
      setNewTestData(prev => ({
        ...prev,
        title: `AI Generated: ${params.topic} (${params.difficultyLevel})`,
        description: `An AI-generated test on ${params.topic} under ${params.category} for ${params.difficultyLevel} learners.`,
        category: params.category,
        topic: params.topic,
        difficultyLevel: params.difficultyLevel,
        durationMinutes: (parseInt(params.numberOfQuestions, 10) * 2) || 10, // e.g., 2 mins per question
      }));
    } catch (err) {
      setGenerationError(err.response?.data?.message || 'Failed to generate questions.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveNewTest = async (e) => {
    e.preventDefault();
    if (!generatedQuestions || generatedQuestions.length === 0) {
      setSaveTestError("No questions generated to save.");
      return;
    }
    if (!newTestData.title || !newTestData.category || !newTestData.durationMinutes) {
        setSaveTestError("Test title, category, and duration are required.");
        return;
    }

    setIsSavingTest(true);
    setSaveTestError('');
    setSaveTestSuccess('');

    const testToSave = {
      ...newTestData,
      durationMinutes: parseInt(newTestData.durationMinutes, 10),
      questions: generatedQuestions, // Add the AI-generated questions
    };

    try {
      const savedTest = await mockTestService.createMockTest(testToSave);
      setSaveTestSuccess(`New mock test "${savedTest.title}" created successfully! ID: ${savedTest._id}`);
      setGeneratedQuestions(null); // Clear generated questions after saving
      // Optionally navigate away or reset form
      setTimeout(() => navigate('/mock-tests'), 2000); // Redirect after a short delay
    } catch (err) {
      setSaveTestError(err.response?.data?.message || 'Failed to save the new mock test.');
    } finally {
      setIsSavingTest(false);
    }
  };

  const difficultyOptions = ['Beginner', 'Intermediate', 'Advanced', 'Easy', 'Medium', 'Hard'];
  const statusOptions = ['draft', 'published'];


  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="bg-white shadow-xl rounded-lg p-6 md:p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Generate Mock Test Questions (AI)</h1>

        {/* Question Generation Form */}
        <form onSubmit={handleGenerateSubmit} className="space-y-6 mb-8 pb-6 border-b">
          {/* ... (Inputs for category, topic, difficultyLevel, numberOfQuestions - same as before) ... */}
          <div><label htmlFor="category" className="block text-sm font-medium text-gray-700">Category <span className="text-red-500">*</span></label><input type="text" name="category" id="category" value={generationParams.category} onChange={handleParamChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="e.g., JavaScript, Python"/></div>
          <div><label htmlFor="topic" className="block text-sm font-medium text-gray-700">Specific Topic <span className="text-red-500">*</span></label><input type="text" name="topic" id="topic" value={generationParams.topic} onChange={handleParamChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="e.g., Arrays, Loops"/></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><label htmlFor="difficultyLevel" className="block text-sm font-medium text-gray-700">Difficulty Level</label><select name="difficultyLevel" id="difficultyLevel" value={generationParams.difficultyLevel} onChange={handleParamChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">{difficultyOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div><div><label htmlFor="numberOfQuestions" className="block text-sm font-medium text-gray-700">Number of Questions</label><input type="number" name="numberOfQuestions" id="numberOfQuestions" value={generationParams.numberOfQuestions} onChange={handleParamChange} min="1" max="20" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/></div></div>
          <div><button type="submit" disabled={isGenerating} className="w-full justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70">{isGenerating ? 'Generating...' : 'Generate Questions'}</button></div>
        </form>

        {generationError && <p className="my-4 text-red-600 bg-red-100 p-3 rounded-md text-center">{generationError}</p>}
        {generationSuccess && !generatedQuestions && <p className="my-4 text-green-600 bg-green-100 p-3 rounded-md text-center">{generationSuccess}</p>}
        
        {/* Display Generated Questions and Form to Save as New Test */}
        {generatedQuestions && generatedQuestions.length > 0 && (
          <div className="mt-6">
            <h2 className="text-2xl font-semibold text-gray-700 mb-3">AI-Generated Questions ({generatedQuestions.length}):</h2>
            <div className="bg-gray-100 p-4 rounded-md shadow-inner max-h-96 overflow-y-auto mb-6">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 break-all">
                {JSON.stringify(generatedQuestions, null, 2)}
              </pre>
            </div>

            <h2 className="text-2xl font-semibold text-gray-700 mb-4 pt-4 border-t">Save as New Mock Test</h2>
            {saveTestError && <p className="mb-4 text-red-600 bg-red-100 p-3 rounded-md text-center">{saveTestError}</p>}
            {saveTestSuccess && <p className="mb-4 text-green-600 bg-green-100 p-3 rounded-md text-center">{saveTestSuccess}</p>}

            <form onSubmit={handleSaveNewTest} className="space-y-4">
              <div>
                <label htmlFor="newTestTitle" className="block text-sm font-medium text-gray-700">Test Title <span className="text-red-500">*</span></label>
                <input type="text" name="title" id="newTestTitle" value={newTestData.title} onChange={handleNewTestDetailChange} required
                       className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
              </div>
              <div>
                <label htmlFor="newTestDescription" className="block text-sm font-medium text-gray-700">Test Description</label>
                <textarea name="description" id="newTestDescription" value={newTestData.description} onChange={handleNewTestDetailChange} rows="3"
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="newTestCategory" className="block text-sm font-medium text-gray-700">Category <span className="text-red-500">*</span></label>
                  <input type="text" name="category" id="newTestCategory" value={newTestData.category} onChange={handleNewTestDetailChange} required
                         className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
                </div>
                <div>
                  <label htmlFor="newTestTopic" className="block text-sm font-medium text-gray-700">Topic</label>
                  <input type="text" name="topic" id="newTestTopic" value={newTestData.topic} onChange={handleNewTestDetailChange}
                         className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="newTestDifficultyLevel" className="block text-sm font-medium text-gray-700">Difficulty Level</label>
                  <select name="difficultyLevel" id="newTestDifficultyLevel" value={newTestData.difficultyLevel} onChange={handleNewTestDetailChange}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    {difficultyOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="newTestDurationMinutes" className="block text-sm font-medium text-gray-700">Duration (Minutes) <span className="text-red-500">*</span></label>
                  <input type="number" name="durationMinutes" id="newTestDurationMinutes" value={newTestData.durationMinutes} onChange={handleNewTestDetailChange} min="1" required
                         className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
                </div>
              </div>
              <div>
                <label htmlFor="newTestStatus" className="block text-sm font-medium text-gray-700">Status</label>
                  <select name="status" id="newTestStatus" value={newTestData.status} onChange={handleNewTestDetailChange}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    {statusOptions.map(opt => <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>)}
                  </select>
              </div>
              <button type="submit" disabled={isSavingTest}
                      className="w-full justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-70">
                {isSavingTest ? 'Saving Test...' : 'Save as New Mock Test'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateAiTestPage;
