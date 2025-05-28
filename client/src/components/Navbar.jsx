import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineUserCircle, HiOutlineChevronDown, HiOutlineSparkles, HiOutlineArrowLeftOnRectangle, HiOutlineCog, HiOutlineDocumentText, HiOutlineAcademicCap, HiOutlineChatBubbleLeftRight, HiOutlineBriefcase, HiOutlinePlusCircle, HiOutlineWrenchScrewdriver } from 'react-icons/hi2'; // Added more icons
import { motion, AnimatePresence } from 'framer-motion'; // For dropdown animation

const Navbar = () => {
  const { currentUser, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    setIsUserDropdownOpen(false);
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Logout failed in Navbar:", error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  // Define navigation links based on role for cleaner rendering
  const seekerLinks = [
    { to: "/seeker/profile", label: "My Profile", icon: HiOutlineUserCircle },
    { to: "/my-applications", label: "My Applications", icon: HiOutlineDocumentText },
    { to: "/my-test-attempts", label: "My Test History", icon: HiOutlineAcademicCap },
    { to: "/career-roadmap", label: "Career Roadmap", icon: HiOutlineChatBubbleLeftRight, },
  ];

  const recruiterLinks = [
    { to: "/recruiter/my-jobs", label: "My Jobs", icon: HiOutlineBriefcase },
    { to: "/create-job", label: "Post Job", icon: HiOutlinePlusCircle },
    { to: "/admin/generate-test-questions", label: "Generate Questions (AI)", icon: HiOutlineWrenchScrewdriver },
  ];

  if (authLoading) {
    return ( // Simple loading state for navbar
      <nav className="bg-white text-slate-700 p-4 shadow-md">
        <div className="container mx-auto flex flex-wrap justify-between items-center">
          <div className="flex items-center text-2xl font-bold text-slate-800">
            <HiOutlineSparkles className="h-7 w-7 mr-2 text-indigo-500" />
            CareerCraft AI
          </div>
          <div className="text-sm">Loading User...</div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white text-slate-700 p-4 shadow-md sticky top-0 z-50"> {/* Light theme */}
      <div className="container mx-auto flex flex-wrap justify-between items-center">
        <Link to="/" className="flex items-center text-2xl font-bold text-slate-800 hover:text-indigo-600 transition-colors">
          <HiOutlineSparkles className="h-7 w-7 mr-2 text-indigo-500" />
          <span>CareerCraft AI</span>
        </Link>

        <div className="space-x-2 sm:space-x-3 flex items-center mt-2 md:mt-0 text-sm sm:text-base"> {/* Reduced space-x slightly */}
          <Link to="/" className="text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-md font-medium">Home</Link>
          <Link to="/jobs" className="text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-md font-medium">Find Jobs</Link>
          <Link to="/mock-tests" className="text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-md font-medium">Mock Tests</Link>

          {currentUser ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center text-slate-600 hover:text-indigo-600 focus:outline-none px-3 py-2 rounded-md font-medium"
              >
                <HiOutlineUserCircle className="h-6 w-6 mr-1.5" /> {/* User icon always visible */}
                Hi, {currentUser.fullName.split(' ')[0]}!
                <HiOutlineChevronDown className={`h-4 w-4 ml-1.5 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isUserDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-60 bg-white rounded-md shadow-xl z-20 text-slate-700 ring-1 ring-black ring-opacity-5 origin-top-right" // Increased width
                  >
                    <div className="py-1">
                      <div className="px-4 py-3 border-b border-slate-200"> {/* Enhanced header */}
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {currentUser.fullName}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {currentUser.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                      </div>
                      
                      {(currentUser.role === 'seeker' ? seekerLinks : recruiterLinks).map(link => (
                        <Link
                          key={link.to}
                          to={link.to}
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center px-4 py-2.5 text-sm hover:bg-slate-100 w-full text-left transition-colors" // Increased padding
                        >
                          <link.icon className="h-5 w-5 mr-3 text-slate-400" />
                          {link.label}
                        </Link>
                      ))}
                      
                      <div className="border-t border-slate-200"></div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                      >
                        <HiOutlineArrowLeftOnRectangle className="h-5 w-5 mr-3" />
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link to="/login" className="text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-md font-medium">Login</Link>
              <Link 
                to="/register" 
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-4 py-2 rounded-md shadow-sm transition duration-150 ease-in-out text-sm" // Standardized button padding
              >
                Sign Up
              </Link>
              {/* Optionally, you can make Recruiter Sign Up less prominent or combine into one Sign Up flow */}
              {/* <Link to="/register-recruiter" className="text-indigo-600 hover:text-indigo-700 font-semibold px-3 py-2 rounded-md text-sm border border-indigo-500 hover:bg-indigo-50">
                Recruiter Sign Up
              </Link> */}
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
// import React, { useState, useEffect, useRef } from 'react'; // Added useEffect and useRef for dropdown handling
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext'; // Ensure this path is correct
// // Optional: Add a user icon for the dropdown trigger
// import { HiOutlineUserCircle, HiOutlineChevronDown } from 'react-icons/hi2';

// const Navbar = () => {
//   const { currentUser, logout, loading: authLoading } = useAuth();
//   const navigate = useNavigate();
//   const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
//   const dropdownRef = useRef(null); // To detect clicks outside the dropdown

//   const handleLogout = async () => {
//     setIsUserDropdownOpen(false); // Close dropdown on logout
//     try {
//       await logout();
//       navigate('/login');
//     } catch (error) {
//       console.error("Logout failed in Navbar:", error.response?.data?.message || error.message);
//     }
//   };

//   // Close dropdown if clicked outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setIsUserDropdownOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [dropdownRef]);

//   if (authLoading) {
//     return (
//       <nav className="bg-gray-800 text-white p-4 shadow-md">
//         <div className="container mx-auto flex flex-wrap justify-between items-center">
//           <Link to="/" className="text-2xl font-bold hover:text-indigo-300 transition-colors">
//             CareerCraft AI
//           </Link>
//           <div className="text-sm">Loading User...</div>
//         </div>
//       </nav>
//     );
//   }

//   return (
//     <nav className="bg-gray-800 text-white p-4 shadow-md sticky top-0 z-50">
//       <div className="container mx-auto flex flex-wrap justify-between items-center">
//         <Link to="/" className="text-2xl font-bold hover:text-indigo-300 transition-colors">
//           CareerCraft AI
//         </Link>

//         <div className="space-x-3 sm:space-x-4 flex items-center mt-2 md:mt-0 text-sm sm:text-base">
//           <Link to="/" className="hover:text-indigo-300 px-2 py-1 rounded-md">Home</Link>
//           <Link to="/jobs" className="hover:text-indigo-300 px-2 py-1 rounded-md">Find Jobs</Link>
//           <Link to="/mock-tests" className="hover:text-indigo-300 px-2 py-1 rounded-md">Mock Tests</Link>

//           {currentUser ? (
//             <div className="relative" ref={dropdownRef}> {/* Dropdown container */}
//               <button
//                 onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
//                 className="flex items-center text-gray-300 hover:text-white focus:outline-none px-2 py-1 rounded-md"
//               >
//                 {/* Optional: <HiOutlineUserCircle className="h-6 w-6 mr-1 hidden sm:inline" /> */}
//                 Hi, {currentUser.fullName.split(' ')[0]}!
//                 <HiOutlineChevronDown className={`h-4 w-4 ml-1 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
//               </button>

//               {/* Dropdown Menu */}
//               {isUserDropdownOpen && (
//                 <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-xl z-20 text-gray-800 ring-1 ring-black ring-opacity-5">
//                   <div className="py-1">
//                     <div className="px-4 py-2 text-xs text-gray-500 border-b">
//                       Logged in as ({currentUser.role.replace('_', ' ')})
//                     </div>
//                     {currentUser.role === 'seeker' && (
//                       <>
//                         <Link to="/seeker/profile" onClick={() => setIsUserDropdownOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left">My Profile</Link>
//                         <Link to="/my-applications" onClick={() => setIsUserDropdownOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left">My Applications</Link>
//                         <Link to="/my-test-attempts" onClick={() => setIsUserDropdownOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left">My Test History</Link>
//                         <Link to="/career-roadmap" onClick={() => setIsUserDropdownOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left">Career Roadmap</Link>
//                       </>
//                     )}
//                     {currentUser.role === 'company_recruiter' && (
//                       <>
//                         <Link to="/recruiter/my-jobs" onClick={() => setIsUserDropdownOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left">My Jobs</Link>
//                         <Link to="/create-job" onClick={() => setIsUserDropdownOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left">Post Job</Link>
//                         <Link to="/admin/generate-test-questions" onClick={() => setIsUserDropdownOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left">Generate Questions (AI)</Link>
//                       </>
//                     )}
//                     <div className="border-t border-gray-200"></div>
//                     <button
//                       onClick={handleLogout}
//                       className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
//                     >
//                       Logout
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           ) : (
//             <>
//               <Link to="/login" className="hover:text-indigo-300 px-2 py-1 rounded-md">Login</Link>
//               <Link to="/register" className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-3 py-1.5 rounded-md shadow-sm transition duration-150 ease-in-out text-xs sm:text-sm">
//                 Seeker Sign Up
//               </Link>
//               <Link to="/register-recruiter" className="bg-green-500 hover:bg-green-600 text-white font-semibold px-3 py-1.5 rounded-md shadow-sm transition duration-150 ease-in-out text-xs sm:text-sm">
//                 Recruiter Sign Up
//               </Link>
//             </>
//           )}
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;
