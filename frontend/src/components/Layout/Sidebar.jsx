import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Users, BarChart2,
  Tag, Megaphone, Star, Bell, FileText, Settings, ChevronDown,
  ChevronRight, Store
} from 'lucide-react';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: 'admin/dashboard' },
  {
    icon: Package, label: 'Products', path: 'admin/products',
    children: [
      { label: 'Product List', path: 'admin/products' },
      { label: 'Create Product', path: 'admin/products/create' },
      { label: 'Categories', path: 'admin/products/categories' },
    ]
  },
  {
    icon: ShoppingCart, label: 'Orders', path: 'admin/orders',
    children: [
      { label: 'Order List', path: 'admin/orders' },
      { label: 'Refunds', path: 'admin/orders/refunds' },
    ]
  },
  { icon: Users, label: 'Customers', path: 'admin/customers' },
  { icon: Users, label: 'Users', path: 'admin/users' },
  {
    icon: BarChart2, label: 'Analytics', path: 'admin/analytics',
    children: [
      { label: 'Overview', path: 'admin/analytics' },
      { label: 'Sales', path: 'admin/analytics/sales' },
    ]
  },
  { icon: Tag, label: 'Discounts', path: 'admin/discounts' },
  {
    icon: Megaphone, label: 'Promotions', path: 'admin/promotions',
    children: [
      { label: 'Campaigns', path: 'admin/promotions' },
      { label: 'Banners', path: 'admin/promotions/banners' },
    ]
  },
  { icon: Star, label: 'Reviews', path: 'admin/reviews' },
  { icon: Bell, label: 'Notifications', path: 'admin/notifications' },
  { icon: FileText, label: 'Logs', path: 'admin/logs' },
  {
    icon: Settings, label: 'Settings', path: 'admin/settings',
    children: [
      { label: 'General', path: 'admin/settings' },
      { label: 'Personalization', path: 'admin/settings/personalization' },
      { label: 'Homepage Layout', path: 'admin/settings/homepage' },
      { label: 'Banners', path: 'admin/settings/banners' },
      { label: 'Themes', path: 'admin/settings/themes' },
    ]
  },
];

function NavItem({ item, collapsed }) {
  const location = useLocation();
  const [open, setOpen] = useState(() =>
    item.children?.some(c => location.pathname.startsWith(c.path))
  );
  const isActive = location.pathname === item.path ||
    location.pathname.startsWith(item.path + '/');

  if (item.children) {
    return (
      <div>
        <button
          className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
          onClick={() => setOpen(o => !o)}
        >
          <item.icon size={18} />
          {!collapsed && (
            <>
              <span className="nav-label">{item.label}</span>
              <span className="nav-chevron">
                {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </span>
            </>
          )}
        </button>
        {open && !collapsed && (
          <div className="nav-children">
            {item.children.map(child => (
              <NavLink
                key={child.path}
                to={child.path}
                className={({ isActive }) => `nav-child ${isActive ? 'nav-child-active' : ''}`}
                end
              >
                {child.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.path}
      className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
      end
    >
      <item.icon size={18} />
      {!collapsed && <span className="nav-label">{item.label}</span>}
    </NavLink>
  );
}

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Store size={20} />
          </div>
          {!collapsed && <span className="logo-text">CE-Commerce</span>}
        </div>
        <button className="sidebar-toggle" onClick={onToggle}>
          <ChevronRight size={16} className={collapsed ? '' : 'rotate-180'} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.path} item={item} collapsed={collapsed} />
        ))}
      </nav>

      <style>{`
        .sidebar {
          width: 200px;
          background: var(--sidebar-bg);
          display: flex;
          flex-direction: column;
          transition: width 0.25s ease;
          overflow: hidden;
          flex-shrink: 0;
        }
        .sidebar-collapsed { width: 60px; }

        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 12px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          overflow: hidden;
        }

        .logo-icon {
          width: 34px;
          height: 34px;
          background: var(--primary);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .logo-text {
          font-size: 15px;
          font-weight: 700;
          color: white;
          white-space: nowrap;
        }

        .sidebar-toggle {
          background: transparent;
          border: none;
          color: var(--sidebar-text);
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          display: flex;
          transition: background var(--transition);
          flex-shrink: 0;
        }
        .sidebar-toggle:hover { background: rgba(255,255,255,0.08); }
        .rotate-180 { transform: rotate(180deg); }

        .sidebar-nav {
          flex: 1;
          padding: 10px 8px;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 10px;
          border-radius: 8px;
          color: var(--sidebar-text);
          text-decoration: none;
          font-size: 13.5px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          background: transparent;
          width: 100%;
          text-align: left;
          transition: all var(--transition);
          margin-bottom: 2px;
          font-family: inherit;
        }
        .nav-item:hover { background: var(--sidebar-hover); color: white; }
        .nav-item-active { background: var(--sidebar-hover); color: var(--primary-light) !important; }

        .nav-label { flex: 1; white-space: nowrap; overflow: hidden; }
        .nav-chevron { color: var(--sidebar-text); opacity: 0.6; flex-shrink: 0; }

        .nav-children {
          padding-left: 36px;
          padding-bottom: 4px;
        }

        .nav-child {
          display: block;
          padding: 7px 10px;
          border-radius: 6px;
          color: rgba(212, 196, 176, 0.7);
          text-decoration: none;
          font-size: 13px;
          transition: all var(--transition);
          margin-bottom: 1px;
        }
        .nav-child:hover { color: white; background: rgba(255,255,255,0.06); }
        .nav-child-active { color: var(--primary-light) !important; }
      `}</style>
    </aside>
  );
}