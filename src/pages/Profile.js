import React from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import UserProfile from '../components/UserProfile';

const Profile = () => {
  return (
    <ProtectedRoute>
      <div className="container">
        <UserProfile />
      </div>
    </ProtectedRoute>
  );
};

export default Profile;
