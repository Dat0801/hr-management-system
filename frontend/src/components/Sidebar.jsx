import React from 'react';
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

const Sidebar = ({ onLogout, isCollapsed, isMobileOpen, onMobileClose }) => {
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
      {/* Mobile toggle button (handled by Topbar now, but keeping this hidden or synced if needed) */}
      {/* We are removing the sidebar-mobile-toggle button from here since Topbar handles it */}
      
      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isMobileOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Logo */}
        <div className="sidebar-header">
          <h1 className="sidebar-logo">{isCollapsed ? 'HR' : 'HR System'}</h1>
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
                    onClick={onMobileClose}
                    title={isCollapsed ? item.label : ''}
                  >
                    <Icon size={20} className="menu-icon" />
                    {!isCollapsed && <span className="menu-label">{item.label}</span>}
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
              onMobileClose();
              onLogout();
            }}
            title={isCollapsed ? 'Logout' : ''}
          >
            <LogOut size={20} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
