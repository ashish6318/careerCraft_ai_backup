import mongoose from 'mongoose';

// Sub-schema for individual questions within a MockTest
const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, 'Question text is required.'],
    trim: true,
  },
  options: [ // Array of possible answer strings
    {
      type: String,
      required: [true, 'At least two options are required for a question.'],
      trim: true,
    },
  ],
  correctOptionIndex: {
    type: Number,
    required: [true, 'Please specify the index of the correct option.'],
    min: [0, 'Correct option index cannot be negative.'],
    // We can add a custom validator later to ensure index is within options length
  },
  explanation: { // Explanation for the correct answer
    type: String,
    trim: true,
    default: '',
  },
  marks: { // Marks for this question
    type: Number,
    default: 1,
    min: [0, 'Marks cannot be negative.']
  },
  difficulty: { // Optional difficulty per question
    type: String,
    enum: ['Easy', 'Medium', 'Hard', 'Beginner', 'Intermediate', 'Advanced'],
    // default: 'Medium', // Or leave it undefined
  }
}, { _id: true }); // Mongoose will add _id to subdocuments by default, which is useful


const mockTestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Test title is required.'],
      trim: true,
      unique: true, // Assuming test titles should be unique
    },
    description: {
      type: String,
      trim: true,
    },
    category: { // e.g., "Software Development", "Data Science", "Verbal Ability"
      type: String,
      required: [true, 'Test category is required.'],
      trim: true,
      // Consider an enum if you have a fixed list of categories
      // enum: ['Software Development', 'Data Science', 'Logical Reasoning', 'Quantitative Aptitude', 'Verbal Ability']
    },
    topic: { // More specific topic within the category, e.g., "JavaScript", "Python", "Algorithms"
      type: String,
      trim: true,
    },
    difficultyLevel: { // Overall difficulty of the test
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Mixed'],
      default: 'Intermediate',
    },
    questions: {
      type: [questionSchema], // Array of question sub-documents
      validate: [
        { validator: (val) => val.length > 0, msg: 'A mock test must have at least one question.' },
        // Custom validator to check correctOptionIndex for each question
        {
          validator: function(questions) {
            return questions.every(q => q.correctOptionIndex < q.options.length);
          },
          msg: 'Correct option index is out of bounds for one or more questions.'
        }
      ]
    },
    totalMarks: { // Could be calculated dynamically or set manually
      type: Number,
      // required: true, // Or calculate before save
      min: [0, 'Total marks cannot be negative.']
    },
    durationMinutes: { // Duration of the test in minutes
      type: Number,
      min: [1, 'Duration must be at least 1 minute.'],
      // default: 60, // Example default
    },
    status: { // To control visibility of the test
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    createdBy: { // Optional: admin/recruiter who created the test
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // We can add passMarks or other metadata later
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
mockTestSchema.virtual('questionCount').get(function() {
  if (this.questions) {
    return this.questions.length;
  }
  return 0;
});

// Pre-save middleware to calculate totalMarks if not provided
mockTestSchema.pre('save', function (next) {
  if (this.isModified('questions') || !this.totalMarks) { // Recalculate if questions change or totalMarks isn't set
    this.totalMarks = this.questions.reduce((acc, q) => acc + (q.marks || 1), 0);
  }
  next();
});

// Indexing for frequent queries
// mockTestSchema.index({ title: 1 });
mockTestSchema.index({ category: 1 });
mockTestSchema.index({ difficultyLevel: 1 });
mockTestSchema.index({ status: 1 });


const MockTest = mongoose.model('MockTest', mockTestSchema);

export default MockTest;
