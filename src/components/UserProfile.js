import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import LogoutButton from './LogoutButton';

const UserProfile = () => {
  const { user, isLoading, error } = useAuth0();

  if (isLoading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (error) {
    return <div className="error">Error loading profile: {error.message}</div>;
  }

  if (!user) {
    return <div>No user found</div>;
  }

  return (
    <div className="profile-section">
      <h2 className="profile-title">User Profile</h2>
      
      <div className="card">
        <div className="profile-info">
          <div className="profile-item">
            <span className="profile-label">Name:</span>
            <span className="profile-value">{user.name || 'N/A'}</span>
          </div>
          
          <div className="profile-item">
            <span className="profile-label">Email:</span>
            <span className="profile-value">{user.email || 'N/A'}</span>
          </div>
          
          <div className="profile-item">
            <span className="profile-label">Email Verified:</span>
            <span className="profile-value">
              {user.email_verified ? 'Yes' : 'No'}
            </span>
          </div>
          
          <div className="profile-item">
            <span className="profile-label">Nickname:</span>
            <span className="profile-value">{user.nickname || 'N/A'}</span>
          </div>
          
          <div className="profile-item">
            <span className="profile-label">User ID:</span>
            <span className="profile-value">{user.sub || 'N/A'}</span>
          </div>
          
          <div className="profile-item">
            <span className="profile-label">Updated At:</span>
            <span className="profile-value">
              {user.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <LogoutButton />
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
