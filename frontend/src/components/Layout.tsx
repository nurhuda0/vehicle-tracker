import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  currentPage?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title = "Dashboard", 
  subtitle = "Fleet Management Overview",
  currentPage = 'dashboard'
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} />
      
      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <Header title={title} subtitle={subtitle} />
        
        {/* Page content */}
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
