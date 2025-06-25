import { useState } from 'react'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">ResQCart</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              {['dashboard', 'predictions', 'rescue', 'analytics'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === tab
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
            <div className="flex items-center">
              <button className="ml-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700">
                Sign In
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {activeTab === 'dashboard' && (
            <div className="px-4 py-6 sm:px-0">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Milk Waste Prevention Dashboard</h2>
              
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">At-Risk Products</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">24</dd>
                    <div className="mt-2 flex items-center text-sm text-green-600">
                      <span className="text-green-500">↓ 15% from yesterday</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">Predicted Savings</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">$1,245</dd>
                    <div className="mt-2 flex items-center text-sm text-green-600">
                      <span className="text-green-500">↑ 8% from yesterday</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">Rescue Success Rate</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">78%</dd>
                    <div className="mt-2 flex items-center text-sm text-green-600">
                      <span className="text-green-500">↑ 5% from yesterday</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">Waste Reduction</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">320 kg</dd>
                    <div className="mt-2 flex items-center text-sm text-green-600">
                      <span className="text-green-500">↑ 12% from yesterday</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-md">
                <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Actions Required Today</h3>
                </div>
                <ul className="divide-y divide-gray-200">
                  <li className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-primary-600 truncate">Organic Whole Milk (1 gal) - 24 units</p>
                        <p className="mt-1 text-sm text-gray-500">Expires in 3 days</p>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <button className="px-3 py-1 bg-primary-500 text-white text-sm font-medium rounded-md">
                          Apply 15% Discount
                        </button>
                      </div>
                    </div>
                  </li>
                  <li className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-secondary-600 truncate">2% Reduced Fat Milk (1 gal) - 18 units</p>
                        <p className="mt-1 text-sm text-gray-500">Expires in 2 days</p>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <button className="px-3 py-1 bg-secondary-500 text-white text-sm font-medium rounded-md">
                          Send Food Bank Alert
                        </button>
                      </div>
                    </div>
                  </li>
                  <li className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-warning-600 truncate">Chocolate Milk (1 qt) - 12 units</p>
                        <p className="mt-1 text-sm text-gray-500">Expires tomorrow</p>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <button className="px-3 py-1 bg-warning-500 text-white text-sm font-medium rounded-md">
                          Activate 50% Discount
                        </button>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          )}
          
          {activeTab === 'predictions' && (
            <div className="px-4 py-6 sm:px-0">
              <h2 className="text-2xl font-semibold text-gray-900">Milk Expiration Predictions</h2>
              <p className="mt-2 text-gray-600">Prediction models and detailed forecasts will be displayed here.</p>
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
