import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layout } from 'lucide-react';
import { UserPresence } from './UserPresence';
import { getSessionId, getConnectedUsers } from '../utils/collaboration';

export function Navbar() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isEditor = location.pathname.startsWith('/flat-plan');
  const isMagazines = location.pathname === '/magazines';
  const currentUserId = getSessionId();
  const connectedUsers = getConnectedUsers();

  return (
    <nav className={`${isHome ? 'absolute w-full z-50' : 'bg-white shadow-sm'} py-4 mb-0`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center space-x-4">
          <Link to="/" className="flex items-center space-x-3">
            <Layout className={`w-8 h-8 ${isHome ? 'text-white' : 'text-blue-600'}`} />
            <span className={`text-xl font-bold ${isHome ? 'text-white' : 'text-gray-900'}`}>
              FlatMag
            </span>
          </Link>
          {!isHome && (
            <UserPresence users={connectedUsers} currentUserId={currentUserId} />
          )}
          {!isHome && (
            <div className="flex items-center space-x-4">
              {isEditor && (
                <Link
                  to="/magazines"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Back to Magazines
                </Link>
              )}
              {isMagazines && (
                <Link
                  to="/"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Back to Home
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}