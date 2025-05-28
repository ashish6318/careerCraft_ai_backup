import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';
// import { useNavigate } from 'react-router-dom'; // If needed for redirects

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); // To check auth status on initial load
  // const navigate = useNavigate(); // If needed for redirects

  useEffect(() => {
    // Check if user is already logged in (e.g., from a previous session cookie)
    const checkLoggedInStatus = async () => {
      try {
        const user = await authService.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        setCurrentUser(null);
        console.error('Not authenticated or error fetching user:', error.response?.data?.message || error.message);
      } finally {
        setLoading(false);
      }
    };
    checkLoggedInStatus();
  }, []);

  const login = async (email, password) => {
    try {
      const user = await authService.login({ email, password });
      setCurrentUser(user);
      return user; // Return user data on successful login
    } catch (error) {
      console.error('Login failed:', error.response?.data?.message || error.message);
      setCurrentUser(null);
      throw error; // Re-throw to handle in component
    }
  };

  const register = async (fullName, email, password) => {
    try {
      const user = await authService.register({ fullName, email, password });
      setCurrentUser(user); // Optionally log in user directly after registration
      return user;
    } catch (error) {
      console.error('Registration failed:', error.response?.data?.message || error.message);
      setCurrentUser(null);
      throw error;
    }
  };

  const registerRecruiterAuth = async (fullName, email, password,companyName) => { // New method for context
    try {
      const user = await authService.registerRecruiter({ fullName, email, password, companyName});
      setCurrentUser(user); // Optionally log in recruiter directly after registration
      return user;
    } catch (error) {
      setCurrentUser(null);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setCurrentUser(null);
      // navigate('/login'); // Programmatically navigate to login page after logout
    } catch (error) {
      console.error('Logout failed:', error.response?.data?.message || error.message);
      // Handle logout error (e.g., display a message)
    }
  };

  const value = {
    currentUser,
    setCurrentUser, // Expose if direct manipulation is needed, though actions are preferred
    login,
    register,
    registerRecruiter: registerRecruiterAuth,
    logout,
    loading, // To show loading state while checking auth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
export default AuthProvider;
