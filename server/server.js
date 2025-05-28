import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import userProfileRoutes from './routes/userProfileRoutes.js'; // <--- Import profile routes
import applicationRoutes from './routes/applicationRoutes.js';
import aiRoutes from './routes/aiRoutes.js'; 
import mockTestRoutes from './routes/mockTestRoutes.js'; 

// ... (dotenv.config(), app initialization, connectDB) ...
// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

const isProduction = process.env.NODE_ENV === 'production';

// Add this BEFORE your CORS and other middleware
if (isProduction) {
  app.set('trust proxy', 1); // Trust the first proxy hop (common for Render)
}

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Basic Route
app.get('/', (req, res) => {
  res.send('CareerCraft AI Server is Running!');
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1/profile', userProfileRoutes); // <--- Mount profile routes
app.use('/api/v1/applications', applicationRoutes); // <--- Mount application routes
app.use('/api/v1/ai', aiRoutes); // <--- Mount AI routes
app.use('/api/v1/mock-tests', mockTestRoutes); // <--- Mount mock test routes

// ... (Error Handling Middleware) ...
// Not found middleware
app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
});

// General error handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack, // Fun stack in prod :)
  });
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
