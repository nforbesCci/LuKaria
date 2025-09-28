import React from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth0 } from '@auth0/auth0-react';

const Dashboard = () => {
  const { user } = useAuth0();

  return (
    <ProtectedRoute>
      <div className="container">
        <div className="welcome-section">
          <h1 className="welcome-title">Dashboard</h1>
          <p className="welcome-subtitle">
            Welcome to your dashboard, {user?.name}!
          </p>
          
          <div className="card">
            <h3 style={{ marginTop: 0, color: '#333' }}>Quick Stats</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
              <div style={{ textAlign: 'center', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#007bff' }}>1</div>
                <div style={{ color: '#666' }}>Active Sessions</div>
              </div>
              <div style={{ textAlign: 'center', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#28a745' }}>✓</div>
                <div style={{ color: '#666' }}>Account Status</div>
              </div>
              <div style={{ textAlign: 'center', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffc107' }}>!</div>
                <div style={{ color: '#666' }}>Notifications</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginTop: 0, color: '#333' }}>Recent Activity</h3>
            <div style={{ color: '#666' }}>
              <p>• Successfully logged in via Auth0</p>
              <p>• Profile information loaded</p>
              <p>• Dashboard accessed</p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;
