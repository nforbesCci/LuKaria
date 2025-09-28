import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const LogoutButton = () => {
  const { logout, isLoading } = useAuth0();

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <button 
      className="btn btn-secondary"
      onClick={() => logout({ 
        logoutParams: { 
          returnTo: window.location.origin 
        } 
      })}
    >
      Log Out
    </button>
  );
};

export default LogoutButton;
