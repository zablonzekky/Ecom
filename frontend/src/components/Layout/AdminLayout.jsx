import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Layout/Sidebar';
import Topbar from '../../components/Layout/Topbar';

function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <style>{`
        div.admin-layout {
          display: flex !important;
          flex-direction: row !important;
          height: 100vh !important;
          width: 100% !important;
        }
        div.admin-layout > aside.sidebar {
          flex-shrink: 0 !important;
          height: 100vh !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
        }
        div.admin-layout > div.main-content {
          flex: 1 !important;
          min-width: 0 !important;
          display: flex !important;
          flex-direction: column !important;
          height: 100vh !important;
        }
        div.admin-layout > div.main-content > header.topbar {
          flex-shrink: 0 !important;
        }
        div.admin-layout > div.main-content > div.page-content {
          flex: 1 !important;
          overflow-y: auto !important;
          min-height: 0 !important;
        }
      `}</style>

      <div className="admin-layout">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        <div className="main-content">
          <Topbar />
          <div className="page-content">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
              <div className="max-w-7xl mx-auto">
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminLayout;