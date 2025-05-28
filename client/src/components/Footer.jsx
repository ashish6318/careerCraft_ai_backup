import React from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaLinkedin } from 'react-icons/fa'; // Keep Fa for brand icons
import { HiOutlineSparkles } from 'react-icons/hi2'; // For brand consistency with Navbar

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-100 border-t border-slate-200 text-slate-600 body-font">
      <div className="container px-5 py-10 mx-auto flex md:items-center lg:items-start md:flex-row md:flex-nowrap flex-wrap flex-col">
        {/* Left Section: Brand and Copyright */}
        <div className="w-64 flex-shrink-0 md:mx-0 mx-auto text-center md:text-left mb-6 md:mb-0">
          <Link to="/" className="flex title-font font-medium items-center justify-center md:justify-start text-slate-900">
            <HiOutlineSparkles className="w-7 h-7 text-indigo-500 mr-2" /> {/* Consistent Brand Icon */}
            <span className="text-xl font-semibold">CareerCraft AI</span>
          </Link>
          <p className="mt-3 text-sm text-slate-500">
            © {currentYear} CareerCraft AI — All Rights Reserved
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Developed by Ashish Rajput {/* Or your preferred attribution */}
          </p>
        </div>

        {/* Right Section: Links (Info & Social) */}
        <div className="flex-grow flex flex-wrap md:pl-20 -mb-10 md:mt-0 mt-10 md:text-left text-center justify-center md:justify-end">
          <div className="lg:w-1/4 md:w-1/2 w-full px-4 mb-10 md:mb-0"> {/* Column for Info Links */}
            <h2 className="title-font font-semibold text-slate-800 tracking-wider text-sm mb-3">INFO</h2>
            <nav className="list-none space-y-2">
              <li>
                <Link to="#" className="text-slate-500 hover:text-indigo-600 transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="#" className="text-slate-500 hover:text-indigo-600 transition-colors">Contact</Link>
              </li>
            </nav>
          </div>
          <div className="lg:w-1/4 md:w-1/2 w-full px-4 mb-10 md:mb-0"> {/* Column for Legal Links */}
            <h2 className="title-font font-semibold text-slate-800 tracking-wider text-sm mb-3">LEGAL</h2>
            <nav className="list-none space-y-2">
              <li>
                <Link to="#" className="text-slate-500 hover:text-indigo-600 transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="#" className="text-slate-500 hover:text-indigo-600 transition-colors">Terms of Service</Link>
              </li>
            </nav>
          </div>
          <div className="lg:w-auto md:w-1/2 w-full px-4 mb-10 md:mb-0 md:pl-6 lg:pl-8"> {/* Column for Social Links */}
            <h2 className="title-font font-semibold text-slate-800 tracking-wider text-sm mb-3 invisible md:visible">CONNECT</h2> {/* Hidden on small, visible on md+ */}
            <div className="inline-flex space-x-5 sm:ml-auto sm:mt-0 mt-2 justify-center sm:justify-start">
              <a href="https://linkedin.com/in/ashishrajput0904/" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-indigo-600 transition-colors">
                <FaLinkedin className="w-6 h-6" />
              </a>
              <a href="https://github.com/ashish6318" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-indigo-600 transition-colors">
                <FaGithub className="w-6 h-6" />
              </a>
              {/* Optional: Add Twitter or other social links here */}
              {/* <a href="#" className="text-slate-500 hover:text-indigo-600 transition-colors">
                <FaTwitter className="w-6 h-6" />
              </a> */}
            </div>
          </div>
        </div>
      </div>
      {/* Optional: A very subtle bottom bar for extra flourish if needed */}
      {/* <div className="bg-slate-200">
        <div className="container mx-auto py-2 px-5 text-xs text-slate-500 text-center">
          Striving for excellence in career development.
        </div>
      </div> */}
    </footer>
  );
};

export default Footer;
