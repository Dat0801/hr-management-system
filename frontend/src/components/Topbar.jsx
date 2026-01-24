import React from 'react';
import { Bell, MessageSquare, Search, Layout } from 'lucide-react';
import '../styles/topbar.css';

const Topbar = () => {
  return (
    <header className="topbar">
      <div className="topbar-container">
        {/* Left side - Title */}
        <div className="topbar-left">
          <Layout className="brand-icon" size={24} />
          <h2 className="topbar-title">HR Console</h2>
        </div>

        {/* Middle - Search */}
        <div className="topbar-search">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search employees, files..." 
            className="search-input"
          />
        </div>

        {/* Right side - Actions */}
        <div className="topbar-right">
          <button className="icon-btn">
            <Bell size={20} />
            <span className="notification-dot"></span>
          </button>

          <button className="icon-btn">
            <MessageSquare size={20} />
          </button>

          <div className="user-profile-small">
            <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Profile" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
