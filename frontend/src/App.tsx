import { useState } from 'react'
import { AdminDashboard, AIInsightsCard, CategoryDistributionCard } from './components/dashboard';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">ResQCart</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              {['dashboard', 'predictions', 'rescue', 'analytics'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === tab
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
            <div className="flex items-center">
              <button className="ml-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                Sign In
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {activeTab === 'dashboard' && <AdminDashboard />}
          
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
          
          {activeTab === 'rescue' && (
            <div className="px-4 py-6 sm:px-0">
              <h2 className="text-2xl font-semibold text-gray-900">Rescue Network Management</h2>
              <p className="mt-2 text-gray-600">Food bank connections and rescue operation status will be displayed here.</p>
            </div>
          )}
          
          {activeTab === 'analytics' && (
            <div className="px-4 py-6 sm:px-0">
              <h2 className="text-2xl font-semibold text-gray-900">Waste Reduction Analytics</h2>
              <p className="mt-2 text-gray-600">Performance metrics and historical data will be displayed here.</p>
            </div>
          )}
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
          <div className="mt-8 md:mt-0 md:order-1">
            <p className="text-center text-base text-gray-400">&copy; 2025 ResQCart: Food Waste Prediction & Rescue Network</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
