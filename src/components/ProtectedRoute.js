import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import LoginButton from './LoginButton';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="welcome-section">
        <h1 className="welcome-title">Welcome to LuKaria</h1>
        <p className="welcome-subtitle">
          Please log in to access the protected content
        </p>
        <LoginButton />
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
