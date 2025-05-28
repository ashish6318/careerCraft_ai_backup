import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import aiService from '../services/aiService'; // Make sure you have this service created
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const SeekerProfilePage = () => {
  const { currentUser, setCurrentUser, loading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    bio: '',
    skills: [],
    linkedInUrl: '',
    portfolioUrl: '',
    resumeUrl: '',
    resumeFileName: '',
  });

  const [skillsInputString, setSkillsInputString] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true); // For profile text update & initial load
  const [error, setError] = useState(''); // For profile text update errors
  const [successMessage, setSuccessMessage] = useState(''); // For profile text update success

  const [selectedResumeFile, setSelectedResumeFile] = useState(null);
  const [resumeUploadError, setResumeUploadError] = useState('');
  const [resumeUploadSuccess, setResumeUploadSuccess] = useState('');
  const [isUploadingResume, setIsUploadingResume] = useState(false);

  // --- State for AI Resume Suggestions ---
  const [isAnalyzingResume, setIsAnalyzingResume] = useState(false);
  const [resumeSuggestions, setResumeSuggestions] = useState('');
  const [analyzeError, setAnalyzeError] = useState('');
  // --- End of AI Resume Suggestions State ---

  useEffect(() => {
    if (authLoading) return;
    if (!currentUser) {
      setLoading(false);
      setError('You must be logged in to view this page.');
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await userService.getSeekerProfile();
        const currentSkills = Array.isArray(data.skills) ? data.skills : [];
        setProfileData({
          fullName: data.fullName || '',
          email: data.email || '',
          bio: data.bio || '',
          skills: currentSkills,
          linkedInUrl: data.linkedInUrl || '',
          portfolioUrl: data.portfolioUrl || '',
          resumeUrl: data.resumeUrl || '',
          resumeFileName: data.resumeFileName || '',
        });
        setSkillsInputString(currentSkills.join(', '));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch profile data.');
        console.error("Fetch Profile Error:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [currentUser, authLoading]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSkillsChange = (e) => {
    const currentInput = e.target.value;
    // console.log("Raw input for skills (onChange):", currentInput);
    setSkillsInputString(currentInput);
    const skillsArray = currentInput
                         .split(',')
                         .map(skill => skill.trim())
                         .filter(skill => skill);
    setProfileData(prev => ({ ...prev, skills: skillsArray }));
  };

  const handleSkillsKeyDown = (e) => {
    // console.log(`Skills Input KeyDown: key='${e.key}', keyCode=${e.keyCode}`);
    // if (e.key === ' ') {
    //   console.log('Space key was pressed in skills input!');
    // }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);
    
    const dataToUpdate = {
      fullName: profileData.fullName,
      bio: profileData.bio,
      skills: profileData.skills,
      linkedInUrl: profileData.linkedInUrl,
      portfolioUrl: profileData.portfolioUrl,
    };
    try {
      const updatedUser = await userService.updateSeekerProfile(dataToUpdate);
      setCurrentUser(prevUser => ({...prevUser, ...updatedUser}));
      const updatedSkills = Array.isArray(updatedUser.skills) ? updatedUser.skills : [];
      setProfileData(prev => ({
        ...prev,
        fullName: updatedUser.fullName || '',
        bio: updatedUser.bio || '',
        skills: updatedSkills,
        linkedInUrl: updatedUser.linkedInUrl || '',
        portfolioUrl: updatedUser.portfolioUrl || '',
        resumeUrl: prev.resumeUrl, // Preserve resume details
        resumeFileName: prev.resumeFileName,
      }));
      setSkillsInputString(updatedSkills.join(', '));
      setSuccessMessage('Profile details updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile details.');
      console.error("Update Profile Error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResumeFileChange = (e) => {
    setSelectedResumeFile(e.target.files[0]);
    setResumeUploadError('');
    setResumeUploadSuccess('');
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!selectedResumeFile) {
      setResumeUploadError('Please select a resume file to upload.');
      return;
    }
    setResumeUploadError('');
    setResumeUploadSuccess('');
    setIsUploadingResume(true);

    const formData = new FormData();
    formData.append('resumeFile', selectedResumeFile);

    try {
      const response = await userService.uploadSeekerResume(formData);
      setProfileData(prev => ({
        ...prev,
        resumeUrl: response.resumeUrl || prev.resumeUrl,
        resumeFileName: response.resumeFileName || prev.resumeFileName,
      }));
      setCurrentUser(prevUser => ({
        ...prevUser,
        resumeUrl: response.resumeUrl || prevUser.resumeUrl,
        resumeFileName: response.resumeFileName || prevUser.resumeFileName,
      }));
      setResumeUploadSuccess(response.message || 'Resume uploaded successfully!');
      setSelectedResumeFile(null);
      if (document.getElementById('resumeFile')) {
          document.getElementById('resumeFile').value = '';
      }
    } catch (err) {
      setResumeUploadError(err.response?.data?.message || 'Failed to upload resume.');
      console.error("Resume Upload Error:", err.response?.data || err.message);
    } finally {
      setIsUploadingResume(false);
    }
  };

  // --- Handler for getting AI Resume Suggestions ---
  const handleGetResumeSuggestions = async () => {
    if (!profileData.resumeUrl) {
      setAnalyzeError('Please upload a resume first to get AI suggestions.');
      return;
    }
    setIsAnalyzingResume(true);
    setResumeSuggestions(''); // Clear previous suggestions
    setAnalyzeError('');
    try {
      const response = await aiService.fetchResumeSuggestions();
      setResumeSuggestions(response.suggestions);
    } catch (err) {
      setAnalyzeError(err.response?.data?.message || 'Failed to get AI suggestions for your resume.');
      console.error("AI Resume Suggestion Error:", err.response?.data || err.message);
    } finally {
      setIsAnalyzingResume(false);
    }
  };
  // --- End of AI handler ---

  if (authLoading || (loading && !profileData.email && !isEditing)) { // Adjusted loading condition
    return <div className="text-center mt-20">Loading profile...</div>;
  }
  // Show general page error only if not editing (form has its own error display) and initial load failed
  if (error && !isEditing && !profileData.email ) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-500 text-xl">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white shadow-xl rounded-lg p-6 md:p-8">
        {/* --- Section for Profile Details (View or Edit) --- */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">My Profile Details</h1>
          {!isEditing && (
            <button
              onClick={() => { 
                setIsEditing(true); 
                setError(''); 
                setSuccessMessage(''); 
                setResumeUploadError(''); 
                setResumeUploadSuccess('');
                setAnalyzeError(''); // Clear AI error when entering edit mode
                setResumeSuggestions(''); // Clear AI suggestions
                setSkillsInputString(Array.isArray(profileData.skills) ? profileData.skills.join(', ') : '');
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm transition duration-150"
            >
              Edit Profile Details
            </button>
          )}
        </div>

        {successMessage && !isEditing && <p className="mb-4 text-green-600 bg-green-100 p-3 rounded-md text-center">{successMessage}</p>}
        
        {!isEditing ? (
          <div className="space-y-4 pb-6 mb-6 border-b">
            <div><strong className="text-gray-600">Full Name:</strong> {profileData.fullName}</div>
            <div><strong className="text-gray-600">Email:</strong> {profileData.email}</div>
            <div><strong className="text-gray-600">Bio:</strong> <p className="whitespace-pre-wrap inline">{profileData.bio || <span className="text-gray-400">Not provided</span>}</p></div>
            <div>
              <strong className="text-gray-600">Skills:</strong>
              {profileData.skills && profileData.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-1">
                  {profileData.skills.map((skill, index) => (
                    <span key={index} className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">{skill}</span>
                  ))}
                </div>
              ) : <span className="text-gray-400 ml-1">No skills listed</span>}
            </div>
            <div><strong className="text-gray-600">LinkedIn:</strong> {profileData.linkedInUrl ? <a href={profileData.linkedInUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline break-all">{profileData.linkedInUrl}</a> : <span className="text-gray-400">Not provided</span>}</div>
            <div><strong className="text-gray-600">Portfolio/Website:</strong> {profileData.portfolioUrl ? <a href={profileData.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline break-all">{profileData.portfolioUrl}</a> : <span className="text-gray-400">Not provided</span>}</div>
          </div>
        ) : (
          <form onSubmit={handleProfileSubmit} className="space-y-6 pb-6 mb-6 border-b">
            {error && <p className="mb-4 text-red-600 bg-red-100 p-3 rounded-md text-center">{error}</p>}
            {/* Form fields for fullName, email, bio, skills, linkedIn, portfolio */}
            <div><label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name <span className="text-red-500">*</span></label><input type="text" name="fullName" id="fullName" value={profileData.fullName} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/></div>
            <div><label htmlFor="email" className="block text-sm font-medium text-gray-700">Email (Cannot be changed here)</label><input type="email" name="email" id="email" value={profileData.email} readOnly disabled className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 sm:text-sm"/></div>
            <div><label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label><textarea name="bio" id="bio" value={profileData.bio} onChange={handleChange} rows="4" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea></div>
            <div><label htmlFor="skills" className="block text-sm font-medium text-gray-700">Skills (Comma-separated)</label><input type="text" name="skills" id="skills" value={skillsInputString} onChange={handleSkillsChange} onKeyDown={handleSkillsKeyDown} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="e.g., React, Node.js, Project Management"/></div>
            <div><label htmlFor="linkedInUrl" className="block text-sm font-medium text-gray-700">LinkedIn Profile URL</label><input type="url" name="linkedInUrl" id="linkedInUrl" value={profileData.linkedInUrl} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="https://linkedin.com/in/yourprofile"/></div>
            <div><label htmlFor="portfolioUrl" className="block text-sm font-medium text-gray-700">Portfolio/Website URL</label><input type="url" name="portfolioUrl" id="portfolioUrl" value={profileData.portfolioUrl} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="https://github.com/yourusername or yourpersonalsite.com"/></div>
            <div className="flex space-x-4 pt-2">
              <button type="submit" disabled={loading} className="flex-1 justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-75">
                {loading ? 'Saving...' : 'Save Profile Details'}
              </button>
              <button type="button" onClick={() => { setIsEditing(false); setError(''); setSuccessMessage(''); setSkillsInputString(Array.isArray(profileData.skills) ? profileData.skills.join(', ') : '');}} disabled={loading} className="flex-1 justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* --- Resume Section (Always visible) --- */}
        <div className="mt-8 pt-6 border-t">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">My Resume</h2>
          {profileData.resumeUrl ? ( <div className="flex items-center space-x-3 mb-4"> <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><a href={profileData.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline font-medium break-all">{profileData.resumeFileName || 'View/Download Current Resume'}</a></div> ) : ( <p className="text-gray-500 mb-4">No resume uploaded yet.</p> )}
          <h3 className="text-lg font-medium text-gray-700 mb-2">Upload/Replace Resume</h3>
          {resumeUploadError && <p className="mb-3 text-red-600 bg-red-100 p-2 rounded-md text-center text-sm">{resumeUploadError}</p>}
          {resumeUploadSuccess && <p className="mb-3 text-green-600 bg-green-100 p-2 rounded-md text-center text-sm">{resumeUploadSuccess}</p>}
          <form onSubmit={handleResumeUpload} className="mb-4">
            <div className="mb-3">
              <label htmlFor="resumeFile" className="sr-only">Choose resume file</label>
              <input type="file" id="resumeFile" name="resumeFile" accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf" onChange={handleResumeFileChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
            </div>
            {selectedResumeFile && <p className="text-sm text-gray-500 mb-2">Selected: {selectedResumeFile.name}</p>}
            <button type="submit" disabled={isUploadingResume || !selectedResumeFile} className="w-full sm:w-auto justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50">
              {isUploadingResume ? 'Uploading...' : (profileData.resumeUrl ? 'Replace Resume' : 'Upload Resume')}
            </button>
          </form>

          {/* --- AI Resume Suggestions Section --- */}
          {profileData.resumeUrl && ( // Only show if a resume is uploaded
            <div className="mt-6 pt-6 border-t border-dashed border-gray-300"> {/* Added more spacing and a dashed border */}
              <h2 className="text-xl font-semibold text-gray-700 mb-3">AI Resume Feedback</h2>
              {analyzeError && <p className="mb-3 text-red-600 bg-red-100 p-2 rounded-md text-center text-sm">{analyzeError}</p>}
              
              <button
                onClick={handleGetResumeSuggestions}
                disabled={isAnalyzingResume}
                className="w-full sm:w-auto mb-4 justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
              >
                {isAnalyzingResume ? 'Analyzing Resume...' : 'Get AI Resume Suggestions'}
              </button>

              {isAnalyzingResume && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700 mx-auto mb-2"></div>
                  <p className="text-purple-700">Getting feedback from AI, please wait...</p>
                </div>
              )}

              {resumeSuggestions && !isAnalyzingResume && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md shadow">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Suggestions from AI:</h3>
                  <div className="prose prose-sm max-w-none text-gray-700"> {/* Added prose classes */}
                       <ReactMarkdown remarkPlugins={[remarkGfm]}>
                       {resumeSuggestions}
                   </ReactMarkdown>
                 </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeekerProfilePage;
