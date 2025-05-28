import React, { useState, useEffect, useRef } from 'react';
import aiService from '../services/aiService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../context/AuthContext';

const PREDEFINED_ROLES = [
  "Software Engineer", "Data Scientist", "AI/ML Engineer", "Frontend Developer", 
  "Backend Developer", "Full Stack Developer", "DevOps Engineer", 
  "Cybersecurity Analyst", "Product Manager (Tech)"
];

const CareerRoadmapPage = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const [conversation, setConversation] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(''); // For general errors or chat errors
  
  const messagesEndRef = useRef(null);
  const [selectedRoleForInitial, setSelectedRoleForInitial] = useState(PREDEFINED_ROLES[0]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  useEffect(() => {
    // Set initial AI greeting only once when component mounts and user is loaded
    if (currentUser && conversation.length === 0) {
      setConversation([{
        sender: 'ai',
        text: "Hello! I can help you generate a career roadmap. Which role are you interested in? You can select from the dropdown or type your query (e.g., 'Roadmap for Software Engineer').",
        type: 'text'
      }]);
    }
    // Intentionally not depending on conversation.length to avoid re-triggering this message.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]); 

  const formatConversationHistoryForAPI = (chatHistory) => {
    // Ensure history sent to API only contains actual user-AI dialogue turns
    // and is correctly formatted.
    let dialogueHistory = [];
    const firstUserMessageIndex = chatHistory.findIndex(msg => msg.sender === 'user');

    if (firstUserMessageIndex !== -1) {
      dialogueHistory = chatHistory.slice(firstUserMessageIndex);
    }
    
    // Now map to the {role: 'user'/'model', parts: [{text: ''}]} structure
    return dialogueHistory.map(msg => ({
      role: msg.sender === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));
  };

  const submitQueryToAI = async (userMessageText, roleContext = null) => {
    setIsLoading(true);
    setError('');

    // Construct history from conversation state *before* adding the current userMessageText
    // This history is what the AI needs for context of *previous* turns.
    const historyToFormat = [...conversation]; 
    const formattedHistoryForAPI = formatConversationHistoryForAPI(historyToFormat);

    const payload = {
      currentMessage: userMessageText,
      conversationHistory: formattedHistoryForAPI,
    };
    if (roleContext) {
      payload.role = roleContext; // Add role if it's an initial detailed roadmap request
    }

    try {
      const response = await aiService.fetchCareerRoadmap(payload);
      setConversation(prevConv => [...prevConv, { sender: 'ai', text: response.roadmap, type: 'markdown' }]);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Sorry, I encountered an error processing your request.';
      setConversation(prevConv => [...prevConv, { sender: 'ai', text: errorMsg, type: 'error' }]);
      setError(errorMsg); 
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const userMessageText = inputValue.trim();
    if (!userMessageText) return;

    const newUserMessage = { sender: 'user', text: userMessageText, type: 'text' };
    setConversation(prevConv => [...prevConv, newUserMessage]);
    setInputValue('');
    
    // Determine if this is an initial request based on keywords,
    // this helps backend construct the detailed prompt if 'role' isn't explicitly set by a dropdown action.
    let roleForRequest = null;
    const isFirstUserInteraction = conversation.filter(m => m.sender === 'user').length === 0; // Check before adding current message
    if (isFirstUserInteraction) {
        const roleMatch = userMessageText.toLowerCase().match(/roadmap for ([\w\s\/-]+)/i);
        if (roleMatch && roleMatch[1]) {
            roleForRequest = roleMatch[1].trim();
        }
    }
    submitQueryToAI(userMessageText, roleForRequest);
  };
  
  const handleInitialRoleSelectAndSend = () => {
      if (!selectedRoleForInitial) return;
      const userMessageText = `Generate a career roadmap for a ${selectedRoleForInitial}.`;
      
      const newUserMessage = { sender: 'user', text: userMessageText, type: 'text' };
      setConversation(prevConv => [...prevConv, newUserMessage]); // Add user message to UI first
      
      submitQueryToAI(userMessageText, selectedRoleForInitial); // Pass role explicitly
  };

  if (authLoading) {
      return <div className="text-center mt-20">Loading chatbot...</div>;
  }
  if (!currentUser) {
      return <div className="container mx-auto px-4 py-8 text-center text-red-500">Please log in to use the Career Roadmap Advisor.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="bg-white shadow-xl rounded-lg flex flex-col h-[80vh] md:h-[calc(100vh-120px)]">
        <header className="bg-indigo-600 text-white p-4 rounded-t-lg">
          <h1 className="text-xl font-semibold text-center">Career Roadmap Advisor</h1>
        </header>

        {conversation.filter(m=>m.sender === 'user').length === 0 && (
            <div className="p-4 border-b">
                <label htmlFor="initialRoleSelect" className="block text-sm font-medium text-gray-700 mb-1">
                    Start with a roadmap for:
                </label>
                <div className="flex space-x-2">
                    <select 
                        id="initialRoleSelect"
                        value={selectedRoleForInitial} 
                        onChange={(e) => setSelectedRoleForInitial(e.target.value)}
                        className="flex-grow mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                        {PREDEFINED_ROLES.map(role => (<option key={role} value={role}>{role}</option>))}
                    </select>
                    <button 
                        onClick={handleInitialRoleSelectAndSend}
                        disabled={isLoading}
                        className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 disabled:opacity-50"
                    >
                        Get Initial Roadmap
                    </button>
                </div>
            </div>
        )}

        <div className="flex-grow p-4 space-y-4 overflow-y-auto bg-gray-50">
          {conversation.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-lg lg:max-w-xl px-4 py-2 rounded-xl shadow ${
                  msg.sender === 'user' ? 'bg-indigo-500 text-white' : 
                  (msg.type === 'error' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-white text-gray-700 border border-gray-200')
              }`}>
                {msg.type === 'markdown' ? (
                  <div className="prose prose-sm max-w-none link-styling"> {/* Add custom class for link styling if needed */}
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                )}
              </div>
            </div>
          ))}
         {isLoading && (
  <>
    {/* Loading dots for AI response */}
    <div className="loading-dots">Loading<span>.</span><span>.</span><span>.</span></div>
  </>
)}

          <div ref={messagesEndRef} />
        </div>

        <div className="border-t p-4 bg-white rounded-b-lg">
          <form onSubmit={handleSendMessage} className="flex space-x-3">
            <input
              type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask a follow-up or type a role (e.g., Roadmap for Data Analyst)..."
              className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || !inputValue.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm disabled:opacity-50">
              Send
            </button>
          </form>
          {error && !isLoading && <p className="text-xs text-red-500 mt-1 pl-1">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default CareerRoadmapPage;
