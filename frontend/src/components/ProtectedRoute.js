import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

function    ProtectedRoute({ children }) {
  const { user,isLoading } = useAppContext();
  const location = useLocation();
 if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full border-blue-600 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  if (!user) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;