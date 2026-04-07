import React from 'react';

function Layout({ children, className = '' }) {
  return (
    <div className={`w-full min-h-screen flex flex-col ${className}`}>
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}

export default Layout;