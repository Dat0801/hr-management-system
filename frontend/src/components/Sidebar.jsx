import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Clock,
  Calendar,
  Banknote,
  Settings,
  LogOut,
  Menu,
  X,
  Building2,
} from 'lucide-react';
import { useAuth } from '../store/auth';
import '../styles/sidebar.css';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/employees', label: 'Employee Directory', icon: Briefcase },
    { path: '/departments', label: 'Departments', icon: Building2 },
    { path: '/attendance', label: 'Attendance', icon: Clock },
    { path: '/leave-requests', label: 'Leave Management', icon: Calendar },
    { path: '/payroll', label: 'Payroll', icon: Banknote },
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
        {/* User Profile Section */}
        <div className="sidebar-profile">
          <div className="profile-avatar">
            <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Profile" />
          </div>
          <div className="profile-info">
            <h3 className="profile-name">Alex Rivera</h3>
            <p className="profile-role">Global Admin</p>
          </div>
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

        {/* Bottom Section */}
        <div className="sidebar-bottom">
          <Link to="/settings" className="menu-item settings-link">
            <Settings size={20} className="menu-icon" />
            <span className="menu-label">Settings</span>
          </Link>
          
          <button 
            className="menu-item logout-btn" 
            onClick={handleLogout}
            style={{ 
              width: '100%', 
              border: 'none', 
              background: 'transparent', 
              cursor: 'pointer',
              color: '#ef4444' 
            }}
          >
            <LogOut size={20} className="menu-icon" />
            <span className="menu-label">Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
