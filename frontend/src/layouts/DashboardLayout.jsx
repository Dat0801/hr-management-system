import React from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import '../styles/dashboard-layout.css';

const DashboardLayout = ({ children, onLogout, userName }) => {
  return (
    <div className="dashboard-layout">
      <Sidebar onLogout={onLogout} />
      <div className="main-content">
        <Topbar userName={userName} />
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
