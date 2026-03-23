import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  console.log('📍 Sidebar rendered, current path:', location.pathname);

  const handleNavigation = (path) => {
    console.log('🚀 Navigating to:', path);
    console.log('📍 Current path before navigation:', location.pathname);
    
    // Use React Router's navigate - this preserves auth context
    navigate(path);
  };

  const handleLogout = () => {
    console.log('🚪 Logging out...');
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const menuItems = [
    { path: '/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
    { path: '/quotes', icon: 'bi-file-text', label: 'Quotes' },
    { path: '/policies', icon: 'bi-shield-check', label: 'Policies' },
    { path: '/claims', icon: 'bi-exclamation-triangle', label: 'Claims' },
    { path: '/products', icon: 'bi-grid', label: 'Products' },
    { path: '/profile', icon: 'bi-person', label: 'Profile' },
  ];

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo-container">
          {!collapsed && <span className="logo-text">InsuranceApp</span>}
          <button className="toggle-btn" onClick={toggleSidebar}>
            <i className={`bi ${collapsed ? 'bi-chevron-right' : 'bi-chevron-left'}`}></i>
          </button>
        </div>
      </div>

      <div className="user-info">
        <div className="avatar">
          {user?.picture ? (
            <img src={user.picture} alt={user?.name} />
          ) : (
            <div className="avatar-placeholder">
              {user?.name?.charAt(0) || 'U'}
            </div>
          )}
        </div>
        {!collapsed && (
          <div className="user-details">
            <div className="user-name">{user?.name || 'User'}</div>
            <div className="user-email">{user?.email || 'user@example.com'}</div>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => handleNavigation(item.path)}
            className={`nav-item w-100 text-start border-0 bg-transparent ${isActive(item.path) ? 'active' : ''}`}
            style={{ cursor: 'pointer' }}
          >
            <i className={`bi ${item.icon}`}></i>
            {!collapsed && <span className="nav-label">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right"></i>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;