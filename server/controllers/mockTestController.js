import MockTest from '../models/MockTest.js';
import TestAttempt from '../models/TestAttempt.js';
import mongoose from 'mongoose';

// @desc    Create a new mock test (Admin/Internal use for now)
// @route   POST /api/v1/mock-tests
// @access  Private (Admin - role check to be implemented more formally later)
const createMockTest = async (req, res) => {
  try {
    const { title, description, category, topic, difficultyLevel, questions, durationMinutes } = req.body;

    if (!title || !category || !questions || questions.length === 0 || !durationMinutes) {
        return res.status(400).json({ message: 'Title, category, questions, and duration are required.' });
    }

    const newTest = new MockTest({
      title,
      description,
      category,
      topic,
      difficultyLevel,
      questions,
      durationMinutes,
      createdBy: req.user?._id,
      status: 'published',
    });

    const savedTest = await newTest.save();
    res.status(201).json(savedTest);
  } catch (error) {
    console.error('Create Mock Test Error:', error);
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server Error: Could not create mock test.' });
  }
};

// @desc    Get all published mock tests (summary view)
// @route   GET /api/v1/mock-tests
// @access  Public / Seeker
const getAllMockTests = async (req, res) => {
  try {
    const { category, difficulty } = req.query;
    const filter = { status: 'published' };
    if (category) filter.category = category;
    if (difficulty) filter.difficultyLevel = difficulty;

    const tests = await MockTest.find(filter)
      .select('title description category topic difficultyLevel totalMarks durationMinutes')
      .sort({ createdAt: -1 });
      
    const testsWithVirtuals = tests.map(test => test.toObject()); // Ensures virtuals like questionCount are present

    res.status(200).json(testsWithVirtuals);
  } catch (error) {
    console.error('Get All Mock Tests Error:', error);
    res.status(500).json({ message: 'Server Error: Could not fetch mock tests.' });
  }
};

// @desc    Get a specific mock test for a seeker to attempt (questions only, no answers)
// @route   GET /api/v1/mock-tests/:testId/attempt
// @access  Private (Seeker)
const getMockTestForAttempt = async (req, res) => {
  try {
    const test = await MockTest.findOne({ _id: req.params.testId, status: 'published' });
    if (!test) {
      return res.status(404).json({ message: 'Mock test not found or not available.' });
    }

    const questionsForAttempt = test.questions.map(q => ({
      _id: q._id,
      questionText: q.questionText,
      options: q.options,
      marks: q.marks,
      difficulty: q.difficulty,
    }));

    res.status(200).json({
      _id: test._id,
      title: test.title,
      description: test.description,
      category: test.category,
      topic: test.topic,
      difficultyLevel: test.difficultyLevel,
      questions: questionsForAttempt,
      totalMarks: test.totalMarks,
      durationMinutes: test.durationMinutes,
    });
  } catch (error) {
    console.error('Get Mock Test for Attempt Error:', error);
    if (error.kind === 'ObjectId') return res.status(404).json({ message: 'Invalid Test ID format.' });
    res.status(500).json({ message: 'Server Error: Could not fetch test for attempt.' });
  }
};

// @desc    Submit answers for a mock test
// @route   POST /api/v1/mock-tests/:testId/submit
// @access  Private (Seeker)
const submitMockTest = async (req, res) => {
  const { testId } = req.params;
  const seekerId = req.user._id;
  const submittedAnswers = req.body.answers;
  const startTime = req.body.startTime ? new Date(req.body.startTime) : new Date();

  try {
    const mockTest = await MockTest.findById(testId);
    if (!mockTest) {
      return res.status(404).json({ message: 'Mock test not found.' });
    }

    let score = 0;
    const processedAnswers = [];

    for (const submittedAnswer of submittedAnswers) {
      const question = mockTest.questions.find(q => q._id.toString() === submittedAnswer.questionId);
      if (!question) {
        console.warn(`Question ID ${submittedAnswer.questionId} not found in test ${testId}`);
        continue;
      }

      let isCorrect = false;
      let marksAwarded = 0;
      if (submittedAnswer.selectedOptionIndex !== undefined && submittedAnswer.selectedOptionIndex === question.correctOptionIndex) {
        isCorrect = true;
        marksAwarded = question.marks || 1;
        score += marksAwarded;
      }

      processedAnswers.push({
        questionId: question._id,
        questionText: question.questionText,
        optionsProvided: question.options,
        selectedOptionIndex: submittedAnswer.selectedOptionIndex,
        correctOptionIndex: question.correctOptionIndex,
        isCorrect,
        marksAwarded,
        explanation: question.explanation || '',
      });
    }
    
    const endTime = new Date();
    const timeTakenSeconds = Math.round((endTime.getTime() - startTime.getTime()) / 1000);

    // --- Robust calculation for totalMarksPossible ---
    let marksPossibleForThisAttempt = mockTest.totalMarks;
    if (
        marksPossibleForThisAttempt === undefined ||
        marksPossibleForThisAttempt === null ||
        (mockTest.questions && mockTest.questions.length > 0 && marksPossibleForThisAttempt === 0 && mockTest.questions.reduce((acc, q) => acc + (q.marks || 1), 0) > 0)
       ) {
      console.warn(`[SubmitMockTest] Recalculating totalMarksPossible for attempt as mockTest.totalMarks was ${mockTest.totalMarks}. Test ID: ${mockTest._id}`);
      marksPossibleForThisAttempt = mockTest.questions.reduce((acc, q) => acc + (q.marks || 1), 0);
    }
    // --- End of robust calculation ---

    const newAttempt = new TestAttempt({
      seekerId,
      mockTestId: testId,
      mockTestTitle: mockTest.title,
      category: mockTest.category,
      topic: mockTest.topic,
      answers: processedAnswers,
      score,
      totalMarksPossible: marksPossibleForThisAttempt, // Use the robustly calculated value
      status: 'completed',
      startTime,
      endTime,
      timeTakenSeconds,
    });

    const savedAttempt = await newAttempt.save();
    res.status(201).json({
      message: 'Test submitted successfully!',
      attemptId: savedAttempt._id,
      score: savedAttempt.score,
      totalMarksPossible: savedAttempt.totalMarksPossible,
      percentage: savedAttempt.percentage,
    });

  } catch (error) {
    console.error('Submit Mock Test Error:', error);
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ message: `Validation Failed: ${messages.join(', ')}` });
    }
    res.status(500).json({ message: 'Server Error: Could not submit test attempt.' });
  }
};

// @desc    Get details of a specific test attempt
// @route   GET /api/v1/mock-tests/attempts/:attemptId
// @access  Private (Seeker who owns the attempt)
const getTestAttemptResult = async (req, res) => {
  try {
    const attempt = await TestAttempt.findById(req.params.attemptId);

    if (!attempt) {
      return res.status(404).json({ message: 'Test attempt not found.' });
    }
    if (attempt.seekerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this attempt.' });
    }
    res.status(200).json(attempt);
  } catch (error) {
    console.error('Get Test Attempt Result Error:', error);
    if (error.kind === 'ObjectId') return res.status(404).json({ message: 'Invalid Attempt ID format.' });
    res.status(500).json({ message: 'Server Error: Could not fetch test attempt.' });
  }
};

// @desc    Get all test attempts for the logged-in seeker
// @route   GET /api/v1/mock-tests/my-attempts
// @access  Private (Seeker)
const getMyTestAttempts = async (req, res) => {
    try {
        const attempts = await TestAttempt.find({ seekerId: req.user._id })
            .select('mockTestTitle category score totalMarksPossible percentage status createdAt timeTakenSeconds mockTestId')
            .sort({ createdAt: -1 });
        res.status(200).json(attempts);
    } catch (error) {
        console.error('Get My Test Attempts Error:', error);
        res.status(500).json({ message: 'Server Error: Could not fetch your test attempts.' });
    }
};

export {
  createMockTest,
  getAllMockTests,
  getMockTestForAttempt,
  submitMockTest,
  getTestAttemptResult,
  getMyTestAttempts
};
