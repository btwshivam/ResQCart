import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/auth.service';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/auth');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'user':
        return '🏪';
      case 'rescue':
        return '🚚';
      case 'admin':
        return '⚡';
      default:
        return '👋';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <nav className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <span className="text-2xl mr-2">🥬</span>
                <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  ResQCart
                </h1>
              </Link>
              <div className="hidden md:flex space-x-8 ml-10">
                <Link
                  to="/analytics"
                  className="text-gray-600 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Analytics
                </Link>
                <Link
                  to="/inventory"
                  className="text-gray-600 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Inventory
                </Link>
                <Link
                  to="/predictions"
                  className="text-gray-600 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Predictions
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex flex-col items-end">
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">{getGreeting()},</span>
                  <span className="text-sm font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </span>
                  <span className="ml-2 text-xl" title={user?.role}>
                    {getRoleIcon()}
                  </span>
                </div>
                <span className="text-xs text-gray-500 capitalize">{user?.role} Account</span>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
              >
                <span className="mr-2">👋</span>
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                  <span className="text-2xl">🥛</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900">Milk Products</h3>
                  <p className="text-2xl font-semibold text-gray-700">24</p>
                  <p className="text-sm text-green-600">↓ 15% waste this week</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                  <span className="text-2xl">🥬</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900">Fresh Produce</h3>
                  <p className="text-2xl font-semibold text-gray-700">156</p>
                  <p className="text-sm text-green-600">↓ 8% waste this week</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                  <span className="text-2xl">💰</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900">Savings</h3>
                  <p className="text-2xl font-semibold text-gray-700">$1,245</p>
                  <p className="text-sm text-green-600">↑ 12% this month</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
                  <span className="text-2xl">🎯</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900">Rescue Rate</h3>
                  <p className="text-2xl font-semibold text-gray-700">92%</p>
                  <p className="text-sm text-green-600">↑ 5% this week</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
} 