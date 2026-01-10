import React from 'react';
import { Bell, User, Settings } from 'lucide-react';
import '../styles/topbar.css';

const Topbar = ({ userName = 'Admin User' }) => {
  return (
    <header className="topbar">
      <div className="topbar-container">
        {/* Left side - Title */}
        <div className="topbar-left">
          <h2 className="topbar-title">HR Management System</h2>
        </div>

        {/* Right side - Actions */}
        <div className="topbar-right">
          {/* Notifications */}
          <button className="topbar-btn notification-btn">
            <Bell size={20} />
            <span className="notification-badge">3</span>
          </button>

          {/* Settings */}
          <button className="topbar-btn">
            <Settings size={20} />
          </button>

          {/* User Profile */}
          <div className="user-profile">
            <button className="user-btn">
              <User size={20} />
              <span className="user-name">{userName}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
