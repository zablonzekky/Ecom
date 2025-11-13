// src/components/PageContainer.js
import React from 'react';

/**
 * PageContainer component ensures consistent spacing on all pages
 * to prevent navbar and footer overlap
 */
function Layout({ children, className = '' }) {
  return (
    <div className={`w-full px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  );
}

export default Layout;