import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  Building2,
  Clock,
  FileText,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import '../styles/sidebar.css';

const Sidebar = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/employees', label: 'Employees', icon: Users },
    { path: '/departments', label: 'Departments', icon: Building2 },
    { path: '/attendance', label: 'Attendance', icon: Clock },
    { path: '/leave-requests', label: 'Leave Requests', icon: FileText },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="sidebar-mobile-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-header">
          <h1 className="sidebar-logo">HR System</h1>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          <ul className="menu-list">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`menu-item ${isActive(item.path) ? 'active' : ''}`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon size={20} className="menu-icon" />
                    <span className="menu-label">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="sidebar-footer">
          <button
            className="logout-btn"
            onClick={() => {
              setIsOpen(false);
              onLogout();
            }}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
