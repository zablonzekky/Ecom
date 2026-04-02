import React from 'react';

function Layout({ children, className = '' }) {
  return (
    // We removed the max-width and padding that were trapping your content
    <div className={`w-full min-h-screen flex flex-col ${className}`}>
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}

export default Layout;