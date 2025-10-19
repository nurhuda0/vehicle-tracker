import React from 'react';
import { 
  HomeIcon, 
  TruckIcon, 
  ChartBarIcon, 
  DocumentTextIcon,
  Cog6ToothIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

interface SidebarProps {
  currentPage?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage = 'dashboard' }) => {
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, current: currentPage === 'dashboard' },
    { name: 'Vehicles', href: '/vehicles', icon: TruckIcon, current: currentPage === 'vehicles' },
    { name: 'Reports', href: '/reports', icon: ChartBarIcon, current: currentPage === 'reports' },
    { name: 'Documents', href: '/documents', icon: DocumentTextIcon, current: currentPage === 'documents' },
    { name: 'Users', href: '/users', icon: UserGroupIcon, current: currentPage === 'users' },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon, current: currentPage === 'settings' },
  ];

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
        {/* Logo */}
        <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center">
              <TruckIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Vehicle Tracker</h1>
              <p className="text-xs text-blue-100">Fleet Management</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    item.current
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      item.current ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </a>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">VT</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Vehicle Tracker</p>
              <p className="text-xs text-gray-500 truncate">v1.0.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
