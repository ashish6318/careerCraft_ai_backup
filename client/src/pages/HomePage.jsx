import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Heroicons v2 (HiOutline) are generally cleaner for a professional look
import {
  HiOutlineAcademicCap,
  HiOutlineArrowRightOnRectangle, // For Login
  HiOutlineUserPlus,           // For Sign Up
  HiOutlineBriefcase,
  HiOutlineChatBubbleLeftRight, // For Career Roadmap
  HiOutlineClipboardDocumentList, // For My Job Postings / My Applications
  HiOutlinePlusCircle,
  HiOutlineSparkles,           // For AI features
  HiOutlineUserCircle,
  HiOutlineWrenchScrewdriver,  // For Generate Test Questions (AI)
  HiOutlineLightBulb          // For AI Insights (general)
} from 'react-icons/hi2'; // Using Hi2 for Heroicons v2

const HomePage = () => {
  const { currentUser } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100); // Slight delay to ensure transition
    return () => clearTimeout(timer);
  }, []);

  // Welcome Section - remains largely the same, animation classes applied directly
  const WelcomeSection = () => (
    <div
      className={`mb-10 md:mb-16 text-center transition-all duration-1000 ease-out ${
        isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
    >
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-900">
        Welcome to <span className="text-indigo-600">CareerCraft AI</span>!
      </h1>
      <p className="mt-4 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
        Your intelligent partner for navigating the complexities of career development and job seeking.
      </p>
    </div>
  );

  // Dashboard Action Card Component
  const ActionCard = ({ to, icon, title, bgColorClass, hoverBgColorClass, delay }) => {
    const IconComponent = icon;
    return (
      <div
        className={`transition-all duration-500 ease-out ${
          isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
        style={{ transitionDelay: `${delay * 100}ms` }}
      >
        <Link
          to={to}
          className={`group block p-6 ${bgColorClass} rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1.5 transition-all duration-300 ease-out`}
        >
          <div className="flex flex-col items-center text-center">
            <IconComponent className={`h-10 w-10 text-white mb-3 transition-transform duration-300 group-hover:scale-110`} />
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          </div>
        </Link>
      </div>
    );
  };
  
  // Feature Card for "Why CareerCraft AI?"
  const FeatureCard = ({ icon, title, description, delay }) => {
    const IconComponent = icon;
    return (
      <div
        className={`bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 ease-out transform hover:-translate-y-1 ${
          isMounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        style={{ transitionDelay: `${delay * 150}ms` }}
      >
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="p-3 bg-indigo-100 rounded-full">
              <IconComponent className="h-7 w-7 text-indigo-600" />
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-slate-800 mb-1">{title}</h4>
            <p className="text-sm text-slate-600">{description}</p>
          </div>
        </div>
      </div>
    );
  };


  return (
    <div className="bg-slate-50 min-h-screen py-10 md:py-16 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto text-center">
        <WelcomeSection />

        {currentUser ? (
          <div className={`w-full max-w-3xl mx-auto transition-opacity duration-700 ease-in delay-300 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
            <p className="text-lg sm:text-xl mb-8 text-slate-700">
              Logged in as <span className="font-semibold text-indigo-700">{currentUser.fullName}</span> 
              <span className="text-slate-500"> ({currentUser.role.replace('_', ' ')})</span>.
            </p>

            {currentUser.role === 'seeker' && (
              <div className="space-y-6">
                <h2 className="text-2xl sm:text-3xl font-semibold text-slate-800 mb-6">Your Dashboard</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                  <ActionCard to="/jobs" icon={HiOutlineBriefcase} title="Find Jobs" bgColorClass="bg-blue-500" hoverBgColorClass="hover:bg-blue-600" delay={1} />
                  <ActionCard to="/seeker/profile" icon={HiOutlineUserCircle} title="My Profile" bgColorClass="bg-purple-500" hoverBgColorClass="hover:bg-purple-600" delay={2} />
                  <ActionCard to="/my-applications" icon={HiOutlineClipboardDocumentList} title="My Applications" bgColorClass="bg-teal-500" hoverBgColorClass="hover:bg-teal-600" delay={3} />
                  <ActionCard to="/mock-tests" icon={HiOutlineAcademicCap} title="Mock Tests" bgColorClass="bg-orange-500" hoverBgColorClass="hover:bg-orange-600" delay={4} />
                  <ActionCard to="/career-roadmap" icon={HiOutlineChatBubbleLeftRight} title="Career Roadmap" bgColorClass="bg-sky-500" hoverBgColorClass="hover:bg-sky-600" delay={5} />
                </div>
              </div>
            )}

            {currentUser.role === 'company_recruiter' && (
              <div className="space-y-6">
                <h2 className="text-2xl sm:text-3xl font-semibold text-slate-800 mb-6">Recruiter Tools</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                  <ActionCard to="/create-job" icon={HiOutlinePlusCircle} title="Post New Job" bgColorClass="bg-green-500" hoverBgColorClass="hover:bg-green-600" delay={1} />
                  <ActionCard to="/recruiter/my-jobs" icon={HiOutlineClipboardDocumentList} title="My Job Postings" bgColorClass="bg-cyan-500" hoverBgColorClass="hover:bg-cyan-600" delay={2} />
                  <ActionCard to="/admin/generate-test-questions" icon={HiOutlineWrenchScrewdriver} title="AI Test Questions" bgColorClass="bg-amber-500" hoverBgColorClass="hover:bg-amber-600" delay={3} />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className={`space-y-6 w-full max-w-md mx-auto transition-opacity duration-700 ease-in delay-300 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
            <p className="text-lg sm:text-xl text-slate-600">
              Log in or register to unlock your potential and access all features.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Link
                to="/login"
                className="flex items-center justify-center w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-base"
              >
                <HiOutlineArrowRightOnRectangle className="mr-2 h-5 w-5" /> Login
              </Link>
              <Link
                to="/register"
                className="flex items-center justify-center w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-base"
              >
                <HiOutlineUserPlus className="mr-2 h-5 w-5" /> Sign Up (Seeker)
              </Link>
            </div>
            <p className="text-sm text-slate-500">
              Representing a company? <Link to="/register-recruiter" className="text-indigo-600 hover:underline font-medium">Register here</Link>.
            </p>
          </div>
        )}

        {/* "Why CareerCraft AI?" Section - Restyled Cards */}
        <div
          className={`mt-16 md:mt-24 pt-10 md:pt-16 border-t border-slate-200 w-full max-w-4xl mx-auto transition-all duration-1000 ease-out ${
            isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          style={{ transitionDelay: isMounted ? '400ms' : '0ms' }}
        >
          <h3 className="text-3xl font-semibold text-slate-800 mb-8 sm:mb-10">Why <span className="text-indigo-600">CareerCraft AI</span>?</h3>
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 text-left">
            <FeatureCard
              icon={HiOutlineLightBulb}
              title="AI-Powered Insights"
              description="Leverage AI for personalized resume feedback and strategic career roadmaps."
              delay={7}
            />
            <FeatureCard
              icon={HiOutlineAcademicCap}
              title="Skill Assessment"
              description="Sharpen your skills with mock tests tailored for various job roles and difficulties."
              delay={8}
            />
            <FeatureCard
              icon={HiOutlineBriefcase}
              title="Opportunity Gateway"
              description="Discover and apply to relevant job openings posted by innovative companies."
              delay={9}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
