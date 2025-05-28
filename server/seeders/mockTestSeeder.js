import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js'; // Adjust path if your db.js is elsewhere
import MockTest from '../models/MockTest.js';

// Configure dotenv - it will look for a .env file in the current working directory
// Since you run 'node seeders/mockTestSeeder.js' from the 'server' directory,
// it will look for 'server/.env'
dotenv.config();

// Add a console log to verify if MONGO_URI is loaded
console.log('MONGO_URI from seeder:', process.env.MONGO_URI); // For debugging

if (!process.env.MONGO_URI) {
  console.error('MONGO_URI is not defined. Please check your .env file and its location.');
  process.exit(1); // Exit if MONGO_URI is not found
}

// It's good practice to call connectDB after ensuring MONGO_URI is loaded.
// The previous structure `await connectDB()` at top level is fine if MONGO_URI is set.
// For clarity, let's ensure it's wrapped in the main async function of the seeder.

const mockTestsData = [
  // ... (your mock test data remains the same) ...
  {
    title: "JavaScript Fundamentals Quiz",
    description: "Test your basic knowledge of JavaScript concepts, including variables, data types, operators, and functions.",
    category: "Software Development",
    topic: "JavaScript",
    difficultyLevel: "Beginner",
    durationMinutes: 10,
    status: "published",
    questions: [
      { questionText: "Which keyword is used to declare a variable that cannot be reassigned?", options: ["var", "let", "const", "static"], correctOptionIndex: 2, explanation: "'const' declares a block-scoped variable whose value cannot be reassigned.", marks: 1 },
      { questionText: "What is the output of `typeof null`?", options: ["'null'", "'object'", "'undefined'", "'function'"], correctOptionIndex: 1, explanation: "Historically, `typeof null` returning 'object' is a bug in JavaScript that has been preserved for compatibility.", marks: 1 },
      { questionText: "Which of the following is NOT a primitive data type in JavaScript?", options: ["String", "Number", "Symbol", "Object"], correctOptionIndex: 3, explanation: "Object is a complex data type. String, Number, and Symbol are primitives.", marks: 2 }
    ]
  },
  {
    title: "Python Basics Challenge",
    description: "A quick challenge to test your understanding of Python's fundamental syntax and data structures.",
    category: "Data Science",
    topic: "Python",
    difficultyLevel: "Beginner",
    durationMinutes: 15,
    status: "published",
    questions: [
      { questionText: "What is the output of `print(2 ** 3)` in Python?", options: ["6", "8", "9", "12"], correctOptionIndex: 1, explanation: "The `**` operator in Python is used for exponentiation. So, 2 raised to the power of 3 is 8.", marks: 1 },
      { questionText: "Which data type is immutable in Python?", options: ["List", "Dictionary", "Set", "Tuple"], correctOptionIndex: 3, explanation: "Tuples are immutable sequences, meaning their contents cannot be changed after creation. Lists, Dictionaries, and Sets are mutable.", marks: 1 }
    ]
  },
  {
    title: "General Aptitude - Speed & Distance",
    description: "Solve problems related to speed, distance, and time.",
    category: "General Aptitude",
    topic: "Speed, Distance, Time",
    difficultyLevel: "Intermediate",
    durationMinutes: 20,
    status: "published",
    questions: [
      { questionText: "A train travels at 60 km/h. How far will it travel in 45 minutes?", options: ["30 km", "45 km", "50 km", "60 km"], correctOptionIndex: 1, explanation: "Distance = Speed × Time. Time = 45 min = 0.75 hours. Distance = 60 × 0.75 = 45 km.", marks: 1 },
      { questionText: "If a car covers 120 km in 2 hours, what is its speed in m/s?", options: ["16.67 m/s", "30 m/s", "60 m/s", "120 m/s"], correctOptionIndex: 0, explanation: "Speed = 120 km / 2 h = 60 km/h. To convert km/h to m/s, multiply by 5/18. So, 60 * (5/18) = 16.67 m/s.", marks: 2 }
    ]
  }
];

const seedDB = async () => {
  try {
    // Connect to DB within the async function after dotenv has loaded
    await connectDB();
    console.log('MongoDB connected for seeder...');

    console.log('Attempting to delete existing mock tests...');
    await MockTest.deleteMany({});
    console.log('Existing mock tests deleted.');

    console.log('Attempting to insert new mock tests...');
    await MockTest.insertMany(mockTestsData);
    console.log('Mock tests seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close(); // Ensure connection close is awaited
    console.log('MongoDB connection closed.');
    process.exit(); // Ensure the script exits
  }
};

seedDB();
