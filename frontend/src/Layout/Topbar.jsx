import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = user
    ? (user.first_name?.[0] || '') + (user.last_name?.[0] || '')
    : 'A';

  return (
    <header className="topbar">
      <div className="topbar-search">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          className="form-control"
          placeholder="Search..."
          style={{ paddingLeft: 36, background: 'var(--surface-2)', border: '1px solid var(--border-light)' }}
        />
      </div>

      <div className="topbar-actions">
        <button
          className="btn-icon notif-btn"
          onClick={() => navigate('/notifications')}
        >
          <Bell size={18} />
          <span className="notif-dot" />
        </button>

        <div className="user-menu" ref={menuRef}>
          <button className="user-trigger" onClick={() => setMenuOpen(o => !o)}>
            <div className="avatar-placeholder" style={{ width: 32, height: 32, fontSize: 13 }}>
              {user?.avatar
                ? <img src={user.avatar} alt="" className="avatar" style={{ width: 32, height: 32 }} />
                : initials
              }
            </div>
            <span className="user-name">{user?.first_name || 'Admin'}</span>
            <ChevronDown size={14} />
          </button>

          {menuOpen && (
            <div className="user-dropdown">
              <div className="dropdown-header">
                <div className="dropdown-name">{user?.first_name} {user?.last_name}</div>
                <div className="dropdown-email">{user?.email}</div>
              </div>
              <div className="dropdown-divider" />
              <button className="dropdown-item" onClick={() => { navigate('/settings'); setMenuOpen(false); }}>
                <User size={15} /> Profile
              </button>
              <button className="dropdown-item" onClick={() => { navigate('/settings'); setMenuOpen(false); }}>
                <Settings size={15} /> Settings
              </button>
              <div className="dropdown-divider" />
              <button className="dropdown-item dropdown-danger" onClick={handleLogout}>
                <LogOut size={15} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          height: 58px;
          background: var(--surface);
          border-bottom: 1px solid var(--border-light);
          gap: 16px;
          flex-shrink: 0;
        }
        .topbar-search { flex: 1; max-width: 360px; position: relative; }
        .topbar-actions { display: flex; align-items: center; gap: 10px; }

        .notif-btn { position: relative; }
        .notif-dot {
          position: absolute;
          top: 6px; right: 6px;
          width: 7px; height: 7px;
          background: var(--primary);
          border-radius: 50%;
          border: 1px solid white;
        }

        .user-menu { position: relative; }
        .user-trigger {
          display: flex; align-items: center; gap: 8px;
          background: transparent; border: none; cursor: pointer;
          padding: 6px 10px; border-radius: var(--radius-md);
          font-family: inherit; font-size: 14px; font-weight: 500;
          color: var(--text-primary);
          transition: background var(--transition);
        }
        .user-trigger:hover { background: var(--surface-2); }
        .user-name { white-space: nowrap; }

        .user-dropdown {
          position: absolute; right: 0; top: calc(100% + 8px);
          background: var(--surface); border: 1px solid var(--border-light);
          border-radius: var(--radius-lg); box-shadow: var(--shadow-lg);
          min-width: 200px; z-index: 100; overflow: hidden;
        }
        .dropdown-header { padding: 14px 16px; }
        .dropdown-name { font-weight: 600; font-size: 14px; }
        .dropdown-email { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
        .dropdown-divider { height: 1px; background: var(--border-light); }
        .dropdown-item {
          display: flex; align-items: center; gap: 8px;
          width: 100%; padding: 10px 16px;
          background: transparent; border: none; cursor: pointer;
          font-family: inherit; font-size: 13.5px; color: var(--text-primary);
          text-align: left; transition: background var(--transition);
        }
        .dropdown-item:hover { background: var(--surface-2); }
        .dropdown-danger { color: var(--danger); }
        .dropdown-danger:hover { background: var(--danger-bg); }
      `}</style>
    </header>
  );
}