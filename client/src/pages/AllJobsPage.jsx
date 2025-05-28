import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom'; // useSearchParams for managing URL query params
import jobService from '../services/jobService';

// Sample options for filters - In a real app, these might come from backend or config
const CATEGORY_OPTIONS = ['Software Development', 'Data Science', 'AI/ML', 'Marketing', 'Design', 'Sales', 'Customer Support', 'HR', 'Other'];
const JOB_TYPE_OPTIONS = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Temporary', 'Remote'];
const EXPERIENCE_LEVEL_OPTIONS = ['Entry-level', 'Mid-level', 'Senior-level', 'Lead', 'Manager', 'Executive', 'Not Specified'];
const SORT_BY_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  // Add relevance if backend supports it with text search score:
  // { label: 'Relevance', value: 'relevance' }
];

const AllJobsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states - initialized from URL search params or defaults
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [locationFilter, setLocationFilter] = useState(searchParams.get('location') || '');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || '');
  const [jobTypeFilter, setJobTypeFilter] = useState(searchParams.get('jobType') || '');
  const [experienceFilter, setExperienceFilter] = useState(searchParams.get('experienceLevel') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page'), 10) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const limit = 10; // Jobs per page

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const filters = {
        search: searchTerm,
        location: locationFilter,
        category: categoryFilter,
        jobType: jobTypeFilter,
        experienceLevel: experienceFilter,
        sortBy,
        page: currentPage,
        limit,
      };

      // Remove empty filters to avoid sending empty query params
      for (const key in filters) {
        if (filters[key] === '' || filters[key] === null || filters[key] === undefined) {
          delete filters[key];
        }
      }
      
      // Update URL search params
      setSearchParams(filters, { replace: true });

      const data = await jobService.getAllOpenJobs(filters);
      setJobs(data.jobs || []);
      setCurrentPage(data.currentPage || 1);
      setTotalPages(data.totalPages || 1);
      setTotalJobs(data.totalJobs || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch jobs. Please try again.');
      console.error("Fetch All Open Jobs Error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, locationFilter, categoryFilter, jobTypeFilter, experienceFilter, sortBy, currentPage, setSearchParams]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]); // fetchJobs is memoized by useCallback and includes all filter dependencies

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setCurrentPage(1); // Reset to first page on filter change
  };
  
  const handleSearchTermChange = (e) => {
    setSearchTerm(e.target.value);
    // Optionally reset to page 1 immediately or wait for explicit search/filter apply
    // For simplicity, let's reset page on explicit search/filter actions.
  };
  
  const handleLocationChange = (e) => {
    setLocationFilter(e.target.value);
  };

  const handleApplyFilters = () => {
    setCurrentPage(1); // Reset to page 1 when applying new filters/search
    // fetchJobs will be called by useEffect due to state changes
    // For an explicit button, you might call fetchJobs() here if useEffect doesn't cover all deps
    // For this setup, changing state and resetting currentPage will trigger the useEffect.
    // Let's ensure fetchJobs is re-triggered if parameters that are part of its dependencies change
    // The setSearchParams inside fetchJobs will also trigger a re-render and potentially re-fetch if not careful,
    // but the dependency array of fetchJobs should manage this.
    // To be safe, we can call fetchJobs directly or rely on the state changes to trigger the useEffect.
    // The current setup with setCurrentPage(1) will trigger fetchJobs via useEffect.
  };
  
  const resetFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
    setCategoryFilter('');
    setJobTypeFilter('');
    setExperienceFilter('');
    setSortBy('newest');
    setCurrentPage(1);
    setSearchParams({}, { replace: true }); // Clear URL params
    // fetchJobs will be called by useEffect due to state changes
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // fetchJobs will be triggered by useEffect due to currentPage change
    }
  };

  if (loading && jobs.length === 0) { // Show initial loading only if no jobs are displayed yet
    return <div className="text-center mt-20 animate-pulse">Loading available jobs...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 text-center">Find Your Next Opportunity</h1>

      {/* --- Filter Section --- */}
      <div className="mb-8 p-4 sm:p-6 bg-white shadow-lg rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
          {/* Search Term */}
          <div>
            <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
            <input
              type="text"
              id="searchTerm"
              placeholder="Job title, skills, company"
              value={searchTerm}
              onChange={handleSearchTermChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          {/* Location */}
          <div>
            <label htmlFor="locationFilter" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              id="locationFilter"
              placeholder="City, state, or remote"
              value={locationFilter}
              onChange={handleLocationChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          {/* Category */}
          <div>
            <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select id="categoryFilter" value={categoryFilter} onChange={handleFilterChange(setCategoryFilter)}
              className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <option value="">All Categories</option>
              {CATEGORY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          {/* Job Type */}
          <div>
            <label htmlFor="jobTypeFilter" className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
            <select id="jobTypeFilter" value={jobTypeFilter} onChange={handleFilterChange(setJobTypeFilter)}
              className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <option value="">All Types</option>
              {JOB_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          {/* Experience Level */}
          <div>
            <label htmlFor="experienceFilter" className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
            <select id="experienceFilter" value={experienceFilter} onChange={handleFilterChange(setExperienceFilter)}
              className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <option value="">All Levels</option>
              {EXPERIENCE_LEVEL_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          {/* Sort By */}
          <div>
            <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select id="sortBy" value={sortBy} onChange={handleFilterChange(setSortBy)}
              className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              {SORT_BY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row sm:justify-end sm:space-x-3 space-y-2 sm:space-y-0">
            <button 
                onClick={handleApplyFilters}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm transition duration-150"
            >
                Search / Apply Filters
            </button>
            <button 
                onClick={resetFilters}
                className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-md shadow-sm transition duration-150"
            >
                Reset Filters
            </button>
        </div>
      </div>
      {/* --- End of Filter Section --- */}
      
      {loading && <p className="text-center text-gray-500 my-4">Updating job list...</p>}

      {jobs.length === 0 && !loading ? (
        <div className="text-center text-gray-600 py-10 bg-white p-6 rounded-lg shadow">
          <p className="text-xl mt-4 mb-2">No jobs found matching your criteria.</p>
          <p className="text-gray-500">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-600 mb-4">Showing {jobs.length} of {totalJobs} jobs.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              // Job Card (same as before)
              <div key={job._id} className="bg-white shadow-xl rounded-lg p-6 hover:shadow-2xl transition-shadow duration-300 flex flex-col justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-indigo-700 mb-2 truncate" title={job.title}>{job.title}</h2>
                  <p className="text-md text-gray-700 font-medium mb-1 truncate" title={job.companyName}>
                    {job.companyName || job.postedBy?.companyName || 'N/A Company'} {/* Display companyName */}
                  </p>
                  <p className="text-sm text-gray-500 mb-3 truncate" title={job.location}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1 mb-0.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                    {job.location}
                  </p>
                  <div className="mb-3">
                    <span className="text-xs inline-block py-1 px-2.5 leading-none text-center whitespace-nowrap align-baseline font-bold bg-blue-100 text-blue-700 rounded-full">{job.jobType}</span>
                    {job.category && (<span className="ml-2 text-xs inline-block py-1 px-2.5 leading-none text-center whitespace-nowrap align-baseline font-bold bg-gray-200 text-gray-700 rounded-full">{job.category}</span>)}
                  </div>
                  <p className="text-xs text-gray-400 mb-1">Posted: {new Date(job.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="mt-5 pt-4 border-t border-gray-200 text-right">
                  <Link to={`/jobs/${job._id}`} className="text-indigo-600 hover:text-indigo-800 font-semibold transition duration-150 ease-in-out">
                    View Details &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* --- Pagination UI --- */}
          {totalPages > 1 && (
            <div className="mt-10 flex justify-center items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
          {/* --- End of Pagination UI --- */}
        </>
      )}
    </div>
  );
};

export default AllJobsPage;
