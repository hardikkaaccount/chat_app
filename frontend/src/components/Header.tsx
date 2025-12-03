import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface HeaderProps {
  username: string;
  onLogout: () => void;
  toggleSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = ({ username, onLogout, toggleSidebar }) => {
  const location = useLocation();

  return (
    <div className="header">
      <div className="header-left">
        {toggleSidebar && (
          <button className="hamburger-menu" onClick={toggleSidebar}>
            ☰
          </button>
        )}
        <h1>Mathu Kathe</h1>
      </div>
      <div className="user-info">
        <span><b>Logged in as: </b>{username}</span>
        <button onClick={onLogout} className="logout-btn">Logout</button>
      </div>
    </div>
  );
};

export default Header;
