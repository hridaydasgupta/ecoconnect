import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ navItems }) {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [open, setOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => { setOpen(false); }, [location.pathname]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (!e.target.closest('.sidebar') && !e.target.closest('.hamburger-btn')) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
  const roleLabel = {
    GENERATOR:       '🌾 Generator',
    RECYCLING_PLANT: '🏭 Recycling Plant',
    LOGISTICS_AGENT: '🚛 Logistics Agent',
    ADMIN:           '⚙️ Admin',
  }[user?.role] || user?.role;

  return (
    <>
      {/* ── Hamburger button (mobile only) ── */}
      <button
        className="hamburger-btn"
        onClick={() => setOpen(o => !o)}
        aria-label="Toggle navigation"
      >
        {open ? '✕' : '☰'}
      </button>

      {/* ── Overlay (mobile) ── */}
      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)} />}

      {/* ── Sidebar ── */}
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🌿</div>
          <span className="sidebar-logo-text">EcoConnect</span>
        </div>

        <span className="sidebar-section-label">Navigation</span>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}

        <div className="sidebar-user">
          <div className="sidebar-user-info">
            <div className="user-avatar">{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
              <div className="user-role">{roleLabel}</div>
            </div>
          </div>
          <button className="nav-item" style={{ marginTop: 8, color: 'var(--accent-red)' }} onClick={handleLogout}>
            <span style={{ fontSize: 18 }}>🚪</span> Logout
          </button>
        </div>
      </aside>
    </>
  );
}
