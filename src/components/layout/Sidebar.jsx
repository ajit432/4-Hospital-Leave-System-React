import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import {
  HomeIcon,
  UserIcon,
  DocumentTextIcon,
  ClockIcon,
  UsersIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  CalendarDaysIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user } = useAuth();

  const navigation = [
    // Common routes
    { name: 'Dashboard', href: user?.role === 'admin' ? '/admin/dashboard' : '/dashboard', icon: HomeIcon, roles: ['doctor', 'admin'] },
    { name: 'My Profile', href: '/profile', icon: UserIcon, roles: ['doctor', 'admin'] },
    
    // Doctor routes
    { name: 'Apply Leave', href: '/leave/apply', icon: DocumentTextIcon, roles: ['doctor'] },
    { name: 'Leave History', href: '/leave/history', icon: ClockIcon, roles: ['doctor'] },
    
    // Admin routes
    { name: 'Manage Leaves', href: '/admin/leaves', icon: CalendarDaysIcon, roles: ['admin'] },
    { name: 'Leave Allocation', href: '/admin/leave-allocation', icon: UserGroupIcon, roles: ['admin'] },
    { name: 'All Doctors', href: '/doctors', icon: UsersIcon, roles: ['admin'] },
    
    // Common routes
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon, roles: ['doctor', 'admin'] },
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <>
      {/* Mobile menu overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-600 dark:bg-gray-900 bg-opacity-75 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={clsx(
          'fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 bg-primary-600">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-primary-600 font-bold text-sm">HLS</span>
              </div>
              <span className="ml-2 text-white font-semibold">
                Leave System
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={clsx(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-700'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                  )}
                >
                  <item.icon
                    className={clsx(
                      'w-5 h-5 mr-3',
                      isActive ? 'text-primary-700' : 'text-gray-400 dark:text-gray-500'
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              {user?.profile_picture ? (
                <img
                  className="w-10 h-10 rounded-full object-cover"
                  src={`http://localhost:5000${user.profile_picture}`}
                  alt={user.name}
                />
              ) : (
                <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              )}
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.department}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
