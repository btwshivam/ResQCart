import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Auth from './pages/Auth';
import { authService } from './services/auth.service';
import { AdminDashboard, AIInsightsCard, CategoryDistributionCard, StoreManagerInterface } from './components/dashboard';
import VideoPrediction from './components/VideoPrediction';
import RescueNetwork from './components/rescue/RescueNetwork';
import FoodBankPortal from './components/foodbank/FoodBankPortal';
import WasteReductionAnalytics from './components/analytics/WasteReductionAnalytics';
import './App.css';

// Protected Route component
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactElement, allowedRoles: string[] }) => {
  const user = authService.getCurrentUser();
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Dashboard Container with Tabs
const DashboardContainer = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>();
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/auth');
  };

  const handleNavigateToStoreManager = (productId?: string) => {
    setSelectedProductId(productId);
    setActiveTab('store');
    
    // Scroll to top when navigating to store manager
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  // Scroll to top when activeTab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'predictions', label: 'Predictions', icon: '🔮' },
    { id: 'video', label: 'Realtime Prediction', icon: '🎥' },
    { id: 'store', label: 'Store Manager', icon: '🏪' },
    { id: 'foodbank', label: 'Food Bank Portal', icon: '🍎' },
    { id: 'rescue', label: 'Rescue', icon: '🚚' },
    { id: 'analytics', label: 'Analytics', icon: '📈' }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <div className="flex items-center space-x-2 group cursor-pointer" onClick={() => setActiveTab('dashboard')}>
                <span className="text-2xl group-hover:scale-110 transition-transform duration-200">🥬</span>
                <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600 group-hover:from-green-500 group-hover:to-blue-500 transition-all duration-200">
                  ResQCart
                </h1>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex flex-1 justify-center px-2">
              <div className="flex justify-between items-center w-full max-w-5xl">
                {navItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center space-x-1 whitespace-nowrap ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-green-50 to-blue-50 text-blue-600 shadow-sm border border-blue-100 transform scale-105'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                </button>
              ))}
              </div>
            </nav>
            
            {/* User Menu & Mobile Menu Button */}
            <div className="flex items-center ml-4">
              <div className="hidden md:flex items-center">
                <div className="mr-4 px-3 py-2 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-blue-50">
                  <span className="text-sm font-medium text-gray-700">
                    Welcome, <span className="font-semibold text-blue-600">{user?.firstName}</span>
                  </span>
                </div>
              <button 
                onClick={handleLogout}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 transition-all duration-200 hover:shadow-md"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                Sign Out
                </button>
              </div>
              
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none transition-colors duration-200"
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-3 border-t border-gray-100 animate-fadeIn">
              <div className="space-y-1 px-2 pt-2 pb-3">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center px-3 py-2 text-base font-medium rounded-md transition-all duration-200 ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-green-50 to-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-3 text-xl">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center px-3 py-2">
                    <span className="text-sm font-medium text-gray-700">
                      Welcome, <span className="font-semibold text-blue-600">{user?.firstName}</span>
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="mt-2 w-full flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 transition-all duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 sm:px-0 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {navItems.find(item => item.id === activeTab)?.label}
              <span className="ml-2 text-xl">{navItems.find(item => item.id === activeTab)?.icon}</span>
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-green-500 to-blue-500 rounded mt-2"></div>
          </div>
          
          {activeTab === 'dashboard' && <AdminDashboard onNavigateToStoreManager={handleNavigateToStoreManager} />}
          
          {activeTab === 'predictions' && (
            <div className="px-4 py-6 sm:px-0">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <AIInsightsCard />
                <CategoryDistributionCard />
              </div>
              <div className="mt-6">
                <h2 className="text-2xl font-semibold text-gray-900">AI Prediction Models</h2>
                <p className="mt-2 text-gray-600">Advanced machine learning models to predict product spoilage and optimize inventory.</p>
              </div>
            </div>
          )}
          
          {activeTab === 'video' && <VideoPrediction />}
          
          {activeTab === 'store' && <StoreManagerInterface selectedProductId={selectedProductId} />}
          
          {activeTab === 'foodbank' && <FoodBankPortal />}
          
          {activeTab === 'rescue' && <RescueNetwork />} 
          
          {activeTab === 'analytics' && <WasteReductionAnalytics />}
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center md:justify-start space-x-6">
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Help</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Settings</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </a>
          </div>
          
          <div className="mt-8 md:mt-0 md:order-1">
            <p className="text-center text-base text-gray-400">
              &copy; 2024 ResQCart. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/auth" element={<Auth />} />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['user', 'rescue']}>
              <DashboardContainer />
            </ProtectedRoute>
          }
        />
        
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
