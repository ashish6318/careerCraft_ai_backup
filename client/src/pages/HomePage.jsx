import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion'; // Import motion

import {
  HiOutlineAcademicCap,
  HiOutlineArrowRightOnRectangle,
  HiOutlineUserPlus,
  HiOutlineBriefcase,
  HiOutlineChatBubbleLeftRight,
  HiOutlineClipboardDocumentList,
  HiOutlinePlusCircle,
  HiOutlineSparkles,
  HiOutlineUserCircle,
  HiOutlineWrenchScrewdriver,
  HiOutlineLightBulb
} from 'react-icons/hi2';

const HomePage = () => {
  const { currentUser } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100); // Slight delay for entry animation
    return () => clearTimeout(timer);
  }, []);

  const WelcomeSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isMounted ? 1 : 0, y: isMounted ? 0 : 20 }}
      transition={{ duration: 0.8, delay: 0.1 }}
      className="mb-12 md:mb-20 text-center" // Increased bottom margin
    >
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-900">
        Welcome to <span className="text-indigo-600">CareerCraft AI</span>!
      </h1>
      <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto"> {/* Increased max-width */}
        Your intelligent partner for navigating the complexities of career development and job seeking.
      </p>
    </motion.div>
  );

  const ActionCard = ({ to, icon, title, delay, accentColorClass = 'text-indigo-600' }) => {
    const IconComponent = icon;
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: isMounted ? 1 : 0, y: isMounted ? 0 : 30 }}
        transition={{ delay: (delay || 0) * 0.15 + 0.3, duration: 0.5, ease: "easeOut" }} // Staggered delay, smooth ease
      >
        <Link
          to={to}
          className={`group block p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 ease-out border border-slate-200 hover:border-indigo-400`}
        >
          <motion.div 
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="flex flex-col items-center text-center"
          >
            <IconComponent className={`h-14 w-14 ${accentColorClass} mb-5 transition-colors duration-300`} /> {/* Icon size increased */}
            <h3 className={`text-xl font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors duration-300`}>{title}</h3>
          </motion.div>
        </Link>
      </motion.div>
    );
  };
  
  const FeatureCard = ({ icon, title, description, delay }) => {
    const IconComponent = icon;
    return (
      <motion.div
        className="bg-white p-8 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 ease-out transform hover:-translate-y-2.5 border border-slate-100 hover:border-transparent" // Slightly increased shadow, lift
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: isMounted ? 1 : 0, scale: isMounted ? 1 : 0.9 }}
        transition={{ delay: (delay || 0) * 0.2 + 0.6, duration: 0.5, ease: "easeOut" }} // Staggered delay, smooth ease
        whileHover={{ y: -10, transition: { type: "spring", stiffness: 300 } }} // Springy hover
      >
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="p-4 bg-indigo-100 rounded-full"> {/* Increased padding for icon bg */}
              <IconComponent className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
          <div>
            <h4 className="text-xl font-semibold text-slate-800 mb-2">{title}</h4>
            <p className="text-base text-slate-600 leading-relaxed">{description}</p> {/* Added leading-relaxed */}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="bg-slate-100 min-h-screen py-12 md:py-20 px-4 sm:px-6 lg:px-8"> {/* Slightly lighter bg, increased padding */}
      <div className="container mx-auto">
        <WelcomeSection />

        {currentUser ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: isMounted ? 1 : 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className={`w-full max-w-5xl mx-auto mb-16 md:mb-24`} // Increased max-w and bottom margin
          >
            <p className="text-xl sm:text-2xl mb-12 text-slate-700 text-center"> {/* Increased font size & margin */}
              Logged in as <span className="font-semibold text-indigo-700">{currentUser.fullName}</span> 
              <span className="text-slate-600"> ({currentUser.role.replace('_', ' ')})</span> {/* Period removed */}
            </p>

            {currentUser.role === 'seeker' && (
              <div className="space-y-10">
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-10 text-center">Your Dashboard</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10"> {/* Increased gap */}
                  <ActionCard to="/jobs" icon={HiOutlineBriefcase} title="Find Jobs" delay={1} accentColorClass="text-blue-600" />
                  <ActionCard to="/seeker/profile" icon={HiOutlineUserCircle} title="My Profile" delay={2} accentColorClass="text-purple-600" />
                  <ActionCard to="/my-applications" icon={HiOutlineClipboardDocumentList} title="My Applications" delay={3} accentColorClass="text-teal-500" />
                  <ActionCard to="/mock-tests" icon={HiOutlineAcademicCap} title="Mock Tests" delay={4} accentColorClass="text-orange-500" />
                  <ActionCard to="/career-roadmap" icon={HiOutlineChatBubbleLeftRight} title="Career Roadmap" delay={5} accentColorClass="text-sky-500" />
                </div>
              </div>
            )}

            {currentUser.role === 'company_recruiter' && (
              <div className="space-y-10">
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-10 text-center">Recruiter Tools</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                  <ActionCard to="/create-job" icon={HiOutlinePlusCircle} title="Post New Job" delay={1} accentColorClass="text-green-500" />
                  <ActionCard to="/recruiter/my-jobs" icon={HiOutlineClipboardDocumentList} title="My Job Postings" delay={2} accentColorClass="text-cyan-500" />
                  <ActionCard to="/admin/generate-test-questions" icon={HiOutlineWrenchScrewdriver} title="AI Test Questions" delay={3} accentColorClass="text-amber-500" />
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: isMounted ? 1 : 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className={`text-center space-y-8 w-full max-w-lg mx-auto mb-16 md:mb-24`} // Increased max-w, bottom margin
          >
            <h2 className="text-3xl font-semibold text-slate-800">Get Started</h2>
            <p className="text-xl text-slate-600">
              Log in or register to unlock your potential and access all features.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6"> {/* Increased spacing */}
              <Link
                to="/login"
                className="flex items-center justify-center w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-lg" // Increased padding & text size
              >
                <HiOutlineArrowRightOnRectangle className="mr-2.5 h-5 w-5" /> Login
              </Link>
              <Link
                to="/register"
                className="flex items-center justify-center w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-lg" // Increased padding & text size
              >
                <HiOutlineUserPlus className="mr-2.5 h-5 w-5" /> Sign Up
              </Link>
            </div>
            <p className="text-md text-slate-500 pt-2"> {/* Increased size and padding-top */}
              Representing a company? <Link to="/register-recruiter" className="text-indigo-600 hover:underline font-semibold">Register here</Link>.
            </p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: isMounted ? 1 : 0, y: isMounted ? 0 : 30 }}
          transition={{ duration: 0.8, delay: isMounted ? (currentUser ? 0.8 : 0.5) : 0 }} // Adjust delay based on login state
          className="mt-20 md:mt-32 pt-16 md:pt-24 border-t border-slate-200 w-full max-w-6xl mx-auto" // Increased spacing and max-width
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-12 sm:mb-16 text-center">Why <span className="text-indigo-600">CareerCraft AI</span>?</h2>
          <div className="grid md:grid-cols-3 gap-10 md:gap-12"> {/* Increased gap */}
            <FeatureCard
              icon={HiOutlineLightBulb}
              title="AI-Powered Insights"
              description="Leverage AI for personalized resume feedback and strategic career roadmaps."
              delay={1} // Simplified delays for cards in this section
            />
            <FeatureCard
              icon={HiOutlineAcademicCap}
              title="Skill Assessment"
              description="Sharpen your skills with mock tests tailored for various job roles and difficulties."
              delay={2}
            />
            <FeatureCard
              icon={HiOutlineBriefcase}
              title="Opportunity Gateway"
              description="Discover and apply to relevant job openings posted by innovative companies."
              delay={3}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;

