import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthProvider from './context/AuthContext'; // Assuming this is the default import
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RegisterRecruiterPage from './pages/RegisterRecruiterPage';
import CreateJobPage from './pages/CreateJobPage';
import RecruiterMyJobsPage from './pages/RecruiterMyJobsPage';
import JobDetailPage from './pages/JobDetailPage';
import EditJobPage from './pages/EditJobPage';
import AllJobsPage from './pages/AllJobsPage';
import SeekerProfilePage from './pages/SeekerProfilePage'; // Make sure this import is correct
import MyApplicationsPage from './pages/MyApplicationsPage'; 
import JobApplicantsPage from './pages/JobApplicantsPage';
import MockTestListPage from './pages/MockTestListPage'; 
import TestTakingPage from './pages/TestTakingPage';
import TestResultPage from './pages/TestResultPage'; // Import the new page
import MyTestAttemptsPage from './pages/MyTestAttemptsPage';
import GenerateAiTestPage from './pages/admin/GenerateAiTestPage'; // Import the new page
import CareerRoadmapPage from './pages/CareerRoadmapPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage'; // Import ForgotPasswordPage
import ResetPasswordPage from './pages/ResetPasswordPage';   // Import ResetPasswordPage

function App() {
  return (
    <AuthProvider>
      <Router>
         <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow pt-4 pb-8 bg-slate-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/register-recruiter" element={<RegisterRecruiterPage />} />
            <Route path="/jobs" element={<AllJobsPage />} />
            <Route path="/jobs/:jobId" element={<JobDetailPage />} />
             <Route path="/mock-tests" element={<MockTestListPage />} />
             <Route path="/forgot-password" element={<ForgotPasswordPage />} /> 
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />


            {/* Recruiter Routes */}
            <Route element={<ProtectedRoute allowedRoles={['company_recruiter','admin']} />}>
              <Route path="/create-job" element={<CreateJobPage />} />
              <Route path="/recruiter/my-jobs" element={<RecruiterMyJobsPage />} />
              <Route path="/recruiter/edit-job/:jobId" element={<EditJobPage />} />
               <Route path="/recruiter/job/:jobId/applicants" element={<JobApplicantsPage />} />
                <Route path="/admin/generate-test-questions" element={<GenerateAiTestPage />} /> 
            </Route>

            {/* Seeker Routes */}
            <Route element={<ProtectedRoute allowedRoles={['seeker']} />}>
              {/* Corrected Path and Element below */}
              <Route path="/seeker/profile" element={<SeekerProfilePage />} />
              <Route path="/my-applications" element={<MyApplicationsPage />} />
              <Route path="/mock-test/:testId/take" element={<TestTakingPage />} />
               <Route path="/mock-test/attempt/:attemptId/result" element={<TestResultPage />} />
               <Route path="/my-test-attempts" element={<MyTestAttemptsPage />} />
               <Route path="/career-roadmap" element={<CareerRoadmapPage />} />
            </Route>
          </Routes>
        </main>
        <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
