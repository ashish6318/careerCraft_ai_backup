import React from 'react';
import { Link } from 'react-router-dom';
// Optional: Import icons if you want to add social media links later
 import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-100 border-t border-slate-200 text-slate-600 body-font">
      <div className="container px-5 py-8 mx-auto flex items-center sm:flex-row flex-col">
        <Link to="/" className="flex title-font font-medium items-center md:justify-start justify-center text-slate-900">
          {/* Optional: You can add a small logo here if you have one */}
          {/* <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-10 h-10 text-white p-2 bg-indigo-500 rounded-full" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
          </svg> */}
          <span className="ml-3 text-xl font-semibold">CareerCraft AI</span>
        </Link>
        <p className="text-sm text-slate-500 sm:ml-4 sm:pl-4 sm:border-l-2 sm:border-slate-300 sm:py-2 sm:mt-0 mt-4">
          © {currentYear} CareerCraft AI — All Rights Reserved
          @Ashish Rajput
          {/* Optional: Add your name or a link
          <a href="https://your-portfolio-link.com" className="text-indigo-500 ml-1" rel="noopener noreferrer" target="_blank">
            @yourname
          </a>
          */}
        </p>
        <div className="inline-flex sm:ml-auto sm:mt-0 mt-4 justify-center sm:justify-start space-x-4 text-sm">
          {/* Placeholder links - replace # with actual paths when pages are created */}
          <Link to="#" className="text-slate-500 hover:text-indigo-600 transition-colors">About Us</Link>
          <Link to="#" className="text-slate-500 hover:text-indigo-600 transition-colors">Contact</Link>
          <Link to="#" className="text-slate-500 hover:text-indigo-600 transition-colors">Privacy Policy</Link>
          <Link to="#" className="text-slate-500 hover:text-indigo-600 transition-colors">Terms of Service</Link>
        </div>
        
        <span className="inline-flex sm:ml-auto sm:mt-0 mt-4 justify-center sm:justify-start">
          <a href="https://linkedin.com/in/ashishrajput0904/" className="ml-3 text-slate-500 hover:text-indigo-600">
            <FaLinkedin className="w-5 h-5" />
          </a>
          <a href="https://github.com/ashish6318" className="ml-3 text-slate-500 hover:text-indigo-600">
            <FaGithub className="w-5 h-5" />
          </a>
        </span>
        
      </div>
    </footer>
  );
};

export default Footer;
