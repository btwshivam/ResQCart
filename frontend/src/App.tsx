import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Auth from './pages/Auth';
import DashboardLayout from './components/DashboardLayout';
import { authService } from './services/auth.service';

// Protected Route component
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactElement, allowedRoles: string[] }) => {
  const user = authService.getCurrentUser();
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

// Placeholder dashboard components
const UserDashboard = () => (
  <div className="bg-white shadow rounded-lg p-6">
    <h2 className="text-2xl font-bold mb-4">User Dashboard</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">My Donations</h3>
        <p className="text-gray-600">Track and manage your food donations</p>
      </div>
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Impact</h3>
        <p className="text-gray-600">See the impact of your contributions</p>
      </div>
      <div className="bg-purple-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Notifications</h3>
        <p className="text-gray-600">Stay updated on rescue activities</p>
      </div>
    </div>
  </div>
);

const RescueDashboard = () => (
  <div className="bg-white shadow rounded-lg p-6">
    <h2 className="text-2xl font-bold mb-4">Rescue Dashboard</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Active Rescues</h3>
        <p className="text-gray-600">View and manage ongoing rescue operations</p>
      </div>
      <div className="bg-red-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Route Planning</h3>
        <p className="text-gray-600">Optimize your rescue routes</p>
      </div>
      <div className="bg-indigo-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Resources</h3>
        <p className="text-gray-600">Access rescue resources and guidelines</p>
      </div>
    </div>
  </div>
);

const AdminDashboard = () => (
  <div className="bg-white shadow rounded-lg p-6">
    <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="bg-pink-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">User Management</h3>
        <p className="text-gray-600">Manage users and permissions</p>
      </div>
      <div className="bg-orange-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Analytics</h3>
        <p className="text-gray-600">Platform statistics and insights</p>
      </div>
      <div className="bg-teal-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">System Settings</h3>
        <p className="text-gray-600">Configure platform settings</p>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/auth" element={<Auth />} />
        
        <Route
          path="/user-dashboard"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/rescue-dashboard"
          element={
            <ProtectedRoute allowedRoles={['rescue']}>
              <RescueDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route path="/" element={<Navigate to="/auth" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
