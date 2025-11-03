import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold">Project Management</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/dashboard"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/dashboard')
                    ? 'border-white'
                    : 'border-transparent hover:border-gray-300'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/reports"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/reports')
                    ? 'border-white'
                    : 'border-transparent hover:border-gray-300'
                }`}
              >
                Daily Reports
              </Link>
              <Link
                to="/kanban"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/kanban')
                    ? 'border-white'
                    : 'border-transparent hover:border-gray-300'
                }`}
              >
                Kanban Board
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <span className="mr-4 text-sm">Welcome, {user.username}</span>
            <button
              onClick={onLogout}
              className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

