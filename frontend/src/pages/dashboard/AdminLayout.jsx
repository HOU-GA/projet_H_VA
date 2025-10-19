// src/pages/dashboard/AdminLayout.jsx
import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const AdminLayout = () => {
  const location = useLocation();

  return (
    <div style={{ display: 'flex', minHeight: '80vh' }}>
      {/* Sidebar */}
      <div style={{ width: '250px', background: '#2c3e50', color: 'white', padding: '20px' }}>
        <h2>Admin Dashboard</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
          <Link 
            to="/admin/users" 
            style={{ 
              color: location.pathname === '/admin/users' ? '#3498db' : '#ecf0f1',
              textDecoration: 'none',
              padding: '10px 15px',
              borderRadius: '5px',
              background: location.pathname === '/admin/users' ? '#34495e' : 'transparent'
            }}
          >
            👥 Gestion Utilisateurs
          </Link>
          <Link 
            to="/admin/jobs" 
            style={{ 
              color: location.pathname === '/admin/jobs' ? '#3498db' : '#ecf0f1',
              textDecoration: 'none',
              padding: '10px 15px',
              borderRadius: '5px',
              background: location.pathname === '/admin/jobs' ? '#34495e' : 'transparent'
            }}
          >
            💼 Gestion Jobs
          </Link>
        </nav>
      </div>
      
      {/* Content */}
      <div style={{ flex: 1, padding: '20px', background: '#ecf0f1' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;