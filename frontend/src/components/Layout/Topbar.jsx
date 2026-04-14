import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, ChevronDown, LogOut, User, Settings, Menu } from 'lucide-react';
import { useAuth } from '../../context/Authcontext';
import { useNotifications } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

export default function Topbar({ onMobileMenuClick }) {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('admin/login');
  };

  const initials = user
    ? (user.first_name?.[0] || '') + (user.last_name?.[0] || '')
    : 'A';

  return (
    <header className="topbar">
      {/* Left: hamburger (mobile only) + search */}
      <div className="topbar-left">
        {/* Hamburger — shown on mobile via CSS */}
        <button
          className="mobile-menu-btn"
          onClick={onMobileMenuClick}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        {/* Search — full on desktop, icon-only on mobile */}
        <div className="topbar-search" ref={searchRef}>
          <button
            className="search-icon-btn"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
          >
            <Search size={16} className="search-icon-svg" />
          </button>
          <input
            type="text"
            className={`form-control search-input ${searchOpen ? 'search-input-open' : ''}`}
            placeholder="Search..."
          />
        </div>
      </div>

      {/* Right: notifications + user */}
      <div className="topbar-actions">
        <button
          className="btn-icon notif-btn"
          onClick={() => navigate('admin/notifications')}
          aria-label="Notifications"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="notif-badge">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        <div className="user-menu" ref={menuRef}>
          <button className="user-trigger" onClick={() => setMenuOpen(o => !o)}>
            <div className="avatar-placeholder" style={{ width: 32, height: 32, fontSize: 13 }}>
              {user?.avatar
                ? <img src={user.avatar} alt="" className="avatar" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                : initials
              }
            </div>
            <span className="user-name">{user?.first_name || 'Admin'}</span>
            <ChevronDown size={14} className="chevron-icon" />
          </button>

          {menuOpen && (
            <div className="user-dropdown">
              <div className="dropdown-header">
                <div className="dropdown-name">{user?.first_name} {user?.last_name}</div>
                <div className="dropdown-email">{user?.email}</div>
              </div>
              <div className="dropdown-divider" />
              <button className="dropdown-item" onClick={() => { navigate('admin/settings'); setMenuOpen(false); }}>
                <User size={15} /> Profile
              </button>
              <button className="dropdown-item" onClick={() => { navigate('admin/settings'); setMenuOpen(false); }}>
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
          padding: 0 16px;
          height: 58px;
          background: var(--surface);
          border-bottom: 1px solid var(--border-light);
          gap: 12px;
          flex-shrink: 0;
        }

        .topbar-left {
          display: flex;
          align-items: center;
          flex: 1;
          gap: 8px;
          min-width: 0;
        }

        /* Hamburger — hidden on desktop, visible on mobile via AdminLayout CSS */
        .mobile-menu-btn {
          display: none;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          background: transparent;
          border: 1px solid var(--border-light);
          border-radius: 8px;
          cursor: pointer;
          color: var(--text-primary);
          flex-shrink: 0;
        }
        .mobile-menu-btn:hover { background: var(--surface-2); }

        @media (max-width: 767px) {
          .mobile-menu-btn { display: flex; }
        }

        /* ── Search ── */
        .topbar-search {
          position: relative;
          display: flex;
          align-items: center;
          flex: 1;
          max-width: 360px;
        }

        .search-icon-btn {
          position: absolute;
          left: 10px;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          z-index: 1;
        }

        .search-input {
          width: 100%;
          padding-left: 36px;
          background: var(--surface-2);
          border: 1px solid var(--border-light);
          border-radius: 8px;
          transition: width 0.25s ease, opacity 0.25s ease;
        }

        /* On mobile: hide text input unless opened */
        @media (max-width: 767px) {
          .topbar-search {
            max-width: 38px;
            overflow: visible;
          }
          .search-icon-btn {
            position: relative;
            left: auto;
            width: 38px;
            height: 38px;
            justify-content: center;
            border: 1px solid var(--border-light);
            border-radius: 8px;
          }
          .search-input {
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 0;
            opacity: 0;
            padding: 0;
            pointer-events: none;
            border: none;
          }
          .search-input.search-input-open {
            width: 200px;
            opacity: 1;
            padding-left: 12px;
            pointer-events: auto;
            border: 1px solid var(--border-light);
            left: 44px;
          }
        }

        /* ── Actions ── */
        .topbar-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .notif-btn { position: relative; }
        .notif-badge {
          position: absolute;
          top: 2px; right: 2px;
          min-width: 17px; height: 17px;
          background: var(--danger);
          color: #fff;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          border: 1.5px solid var(--surface);
          line-height: 1;
        }

        .user-menu { position: relative; }
        .user-trigger {
          display: flex; align-items: center; gap: 8px;
          background: transparent; border: none; cursor: pointer;
          padding: 6px 8px; border-radius: var(--radius-md);
          font-family: inherit; font-size: 14px; font-weight: 500;
          color: var(--text-primary);
          transition: background var(--transition);
        }
        .user-trigger:hover { background: var(--surface-2); }

        /* Hide name + chevron on small screens */
        @media (max-width: 480px) {
          .user-name { display: none; }
          .chevron-icon { display: none; }
          .user-trigger { padding: 4px; }
        }

        .avatar-placeholder {
          border-radius: 50%;
          background: var(--accent-orange, #d97706);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          flex-shrink: 0;
        }

        .user-dropdown {
          position: absolute; right: 0; top: calc(100% + 8px);
          background: var(--surface); border: 1px solid var(--border-light);
          border-radius: var(--radius-lg); box-shadow: var(--shadow-lg);
          min-width: 200px; z-index: 100; overflow: hidden;
        }
        .dropdown-header { padding: 14px 16px; }
        .dropdown-name { font-weight: 600; font-size: 14px; }
        .dropdown-email { font-size: 12px; color: var(--text-muted); margin-top: 2px; word-break: break-all; }
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