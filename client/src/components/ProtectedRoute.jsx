import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    // Show a loading indicator while authentication status is being checked
    // You can replace this with a proper loading spinner component
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!currentUser) {
    // User not authenticated, redirect to login page
    // Pass the current location to redirect back after login (optional)
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // User is authenticated but does not have the required role
    // Redirect to a "Not Authorized" page or homepage
    // For simplicity, redirecting to homepage for now.
    // You might want a dedicated /unauthorized page.
    console.warn(`User role ${currentUser.role} not in allowed roles: ${allowedRoles.join(', ')}`);
    return <Navigate to="/" replace />;
  }

  // User is authenticated and has the required role (if specified)
  return <Outlet />; // Render the child route's component
};

export default ProtectedRoute;
