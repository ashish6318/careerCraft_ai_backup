import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  questionId: { // Refers to the _id of the question in the MockTest.questions array
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  questionText: { // Denormalized for easier review of the attempt
    type: String,
    required: true,
  },
  optionsProvided: { // Denormalized options shown to user at time of attempt
    type: [String],
    required: true,
  },
  selectedOptionIndex: { // Index of the option selected by the user
    type: Number,
    // required: true, // Might not be required if user skips a question
  },
  correctOptionIndex: { // Denormalized correct option from the question
    type: Number,
    required: true,
  },
  isCorrect: {
    type: Boolean,
    // required: true, // Will be set based on comparison
  },
  marksAwarded: { // Marks obtained for this question
    type: Number,
    required: true,
    default: 0,
  },
  explanation: { // <-- ADD THIS FIELD
    type: String,
    default: '',
  }
}, { _id: false }); // No separate _id for each answer object in the array is needed here


const testAttemptSchema = new mongoose.Schema(
  {
    seekerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    mockTestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MockTest',
      required: true,
      index: true,
    },
    mockTestTitle: { // Denormalized from MockTest for easier display
      type: String,
      required: true,
    },
    category: { // Denormalized from MockTest
        type: String,
        required: true,
    },
    topic: { // Denormalized from MockTest (optional)
        type: String,
    },
    answers: { // Array of answers given by the seeker
      type: [answerSchema],
      default: [],
    },
    score: { // Total score obtained
      type: Number,
      required: true,
      default: 0,
    },
    totalMarksPossible: { // Total marks possible for this specific test instance/attempt
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['inprogress', 'completed', 'abandoned'],
      default: 'inprogress',
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    timeTakenSeconds: { // Duration of the attempt in seconds
      type: Number,
    },
    // feedback: { type: String } // Optional overall feedback
  },
  {
    timestamps: true, // Adds createdAt and updatedAt for the attempt record itself
  }
);

// Pre-save middleware to calculate percentage or timeTaken if endTime is set
testAttemptSchema.pre('save', function (next) {
  if (this.isModified('score') || this.isModified('totalMarksPossible')) {
    if (this.totalMarksPossible > 0) {
      this.percentage = parseFloat(((this.score / this.totalMarksPossible) * 100).toFixed(2));
    } else {
      this.percentage = 0;
    }
  }
  if (this.isModified('endTime') && this.endTime && this.startTime) {
    this.timeTakenSeconds = Math.round((this.endTime.getTime() - this.startTime.getTime()) / 1000);
  }
  next();
});

// Indexing for frequent queries by seeker
testAttemptSchema.index({ seekerId: 1, applicationDate: -1 }); // Example if there was applicationDate
testAttemptSchema.index({ seekerId: 1, createdAt: -1 });


const TestAttempt = mongoose.model('TestAttempt', testAttemptSchema);

export default TestAttempt;
