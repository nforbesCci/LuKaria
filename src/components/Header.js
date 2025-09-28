import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import LogoutButton from './LogoutButton';

const Header = () => {
  const { user, isLoading } = useAuth0();

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <h1 className="logo">Svelte by LuKaria</h1>
          
          {!isLoading && user && (
            <div className="user-info">
              <img 
                src={user.picture} 
                alt={user.name} 
                className="user-avatar"
              />
              <span>{user.name}</span>
              <LogoutButton />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
