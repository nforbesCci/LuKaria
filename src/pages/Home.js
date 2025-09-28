import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import LoginButton from '../components/LoginButton';

const Home = () => {
  const { isAuthenticated, user, isLoading } = useAuth0();

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="container">
      {isAuthenticated ? (
        <div className="welcome-section">
          <h1 className="welcome-title">Welcome back, {user.name}!</h1>
          <p className="welcome-subtitle">
            You are successfully logged in to the LuKaria Auth0 app.
          </p>
          <div className="card">
            <p>
              This is a protected area of the application. Only authenticated users can see this content.
            </p>
            <p>
              You can now access all the features of the application.
            </p>
          </div>
        </div>
      ) : (
        <div className="welcome-section">
          <h1 className="welcome-title">Welcome to LuKaria</h1>
          <p className="welcome-subtitle">
            A React application with Auth0 authentication
          </p>
          <p style={{ marginBottom: '32px', color: '#666' }}>
            Please log in to access the application features.
          </p>
          <LoginButton />
        </div>
      )}
    </div>
  );
};

export default Home;
