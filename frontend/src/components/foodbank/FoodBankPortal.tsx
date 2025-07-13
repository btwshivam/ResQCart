import React, { useState, useEffect } from 'react';
import { 
  BuildingStorefrontIcon, 
  TruckIcon, 
  CalendarIcon, 
  ClockIcon, 
  XCircleIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

interface RescueRequest {
  _id: string;
  products: Product[];
  storeId: string | { name: string; address: string };
  status: 'pending' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';
  rescueType: string;
  scheduledPickupTime?: string;
  daysUntilExpiration: number;
  totalWeight?: number;
  totalValue?: number;
  environmentalImpact?: number;
  createdAt: string;
}

interface Product {
  _id: string;
  name: string;
  category: string;
  subCategory?: string;
  price: number;
  currentPrice?: number;
  quantityInStock: number;
  expirationDate: string;
  imageUrl?: string;
}

interface Store {
  _id: string;
  name: string;
  address: string;
  distance?: number;
}

const FoodBankPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'available' | 'claimed'>('available');
  const [rescueRequests, setRescueRequests] = useState<RescueRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<RescueRequest | null>(null);
  const [pickupDate, setPickupDate] = useState<string>('');
  const [pickupTime, setPickupTime] = useState<string>('');
  
  // Mock food bank ID for demo purposes
  const foodBankId = '65f1a1a1a1a1a1a1a1a1a1a2';
  
  useEffect(() => {
    fetchRescueRequests();
  }, [activeTab]);
  
  const fetchRescueRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, this would use the actual food bank ID from auth context
      const endpoint = activeTab === 'available' 
        ? '/api/rescue?status=pending'
        : `/api/rescue/foodbank/${foodBankId}`;
      
      const response = await axios.get(endpoint);
      
      // Filter pending requests for available tab
      let requests = response.data;
      if (activeTab === 'available') {
        requests = requests.filter((req: RescueRequest) => req.rescueType === 'food-bank-alert');
      }
      
      setRescueRequests(requests);
    } catch (err) {
      console.error('Error fetching rescue requests:', err);
      setError('Failed to load rescue requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleClaimRequest = async (requestId: string) => {
    if (!pickupDate || !pickupTime) {
      alert('Please select a pickup date and time');
      return;
    }
    
    try {
      setLoading(true);
      
      const scheduledPickupTime = new Date(`${pickupDate}T${pickupTime}`);
      
      await axios.patch(`/api/rescue/${requestId}/status`, {
        status: 'accepted',
        foodBankId,
        scheduledPickupTime
      });
      
      // Refresh the list
      fetchRescueRequests();
      setSelectedRequest(null);
      setPickupDate('');
      setPickupTime('');
    } catch (err) {
      console.error('Error claiming rescue request:', err);
      setError('Failed to claim rescue request. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCompletePickup = async (requestId: string) => {
    try {
      setLoading(true);
      
      await axios.patch(`/api/rescue/${requestId}/status`, {
        status: 'completed'
      });
      
      // Refresh the list
      fetchRescueRequests();
    } catch (err) {
      console.error('Error completing pickup:', err);
      setError('Failed to complete pickup. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const formatCurrency = (value?: number) => {
    if (value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Food Bank Portal</h1>
        <p className="text-gray-600">
          Claim and manage food rescue opportunities from local stores.
        </p>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex -mb-px space-x-8">
          <button
            onClick={() => setActiveTab('available')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'available'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Available Rescues
          </button>
          <button
            onClick={() => setActiveTab('claimed')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'claimed'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Claimed Rescues
          </button>
        </nav>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircleIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      )}
      
      {/* No requests message */}
      {!loading && rescueRequests.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="mx-auto h-12 w-12 text-gray-400">
            {activeTab === 'available' ? (
              <BuildingStorefrontIcon className="h-12 w-12" />
            ) : (
              <TruckIcon className="h-12 w-12" />
            )}
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No rescue requests</h3>
          <p className="mt-1 text-sm text-gray-500">
            {activeTab === 'available'
              ? 'There are no available rescue opportunities at the moment. Please check back later.'
              : 'You have not claimed any rescue opportunities yet.'}
          </p>
        </div>
      )}
      
      {/* Rescue requests list */}
      {!loading && rescueRequests.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {rescueRequests.map((request) => (
              <li key={request._id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <BuildingStorefrontIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {typeof request.storeId === 'object' ? request.storeId.name : 'Store #' + request.storeId.substring(0, 6)}
                      </p>
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {request.products.length} items
                      </span>
                      {request.daysUntilExpiration <= 1 && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Urgent
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <CalendarIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      <p>
                        Expires: <span className="font-medium">{formatDate(request.products[0]?.expirationDate)}</span>
                        {request.daysUntilExpiration > 0 
                          ? ` (${request.daysUntilExpiration} days left)`
                          : ' (Today)'}
                      </p>
                    </div>
                    
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <ClockIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          Posted {formatDate(request.createdAt)}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>
                          Value: {formatCurrency(request.totalValue)} • 
                          Weight: {request.totalWeight ? `${request.totalWeight.toFixed(1)} kg` : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-5 flex-shrink-0">
                    {activeTab === 'available' ? (
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Claim
                      </button>
                    ) : (
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {request.status === 'accepted' ? 'Scheduled Pickup' : 'Status'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {request.status === 'accepted' ? (
                            <>
                              {request.scheduledPickupTime ? formatDate(request.scheduledPickupTime) : 'Not scheduled'}
                              <button
                                onClick={() => handleCompletePickup(request._id)}
                                className="ml-3 inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200"
                              >
                                Complete
                              </button>
                            </>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {request.status}
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Product details */}
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <h4 className="text-sm font-medium text-gray-900">Products:</h4>
                  <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {request.products.map((product) => (
                      <div key={product._id} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                        {product.imageUrl && (
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={product.imageUrl}
                              alt={product.name}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://via.placeholder.com/40?text=N/A';
                              }}
                            />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                          <p className="text-sm text-gray-500">
                            {product.quantityInStock} {product.quantityInStock > 1 ? 'units' : 'unit'} • {product.category}
                          </p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="text-sm font-medium text-gray-900">{formatCurrency(product.currentPrice || product.price)}</p>
                          {product.currentPrice && product.currentPrice < product.price && (
                            <p className="text-xs text-gray-500 line-through">{formatCurrency(product.price)}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Claim modal */}
      {selectedRequest && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <TruckIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Claim Rescue Opportunity
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      You're about to claim {selectedRequest.products.length} items from{' '}
                      {typeof selectedRequest.storeId === 'object' 
                        ? selectedRequest.storeId.name 
                        : 'Store #' + selectedRequest.storeId.substring(0, 6)
                      }.
                      Please schedule a pickup time.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-5 sm:mt-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="pickup-date" className="block text-sm font-medium text-gray-700">
                      Pickup Date
                    </label>
                    <input
                      type="date"
                      id="pickup-date"
                      name="pickup-date"
                      min={new Date().toISOString().split('T')[0]}
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="pickup-time" className="block text-sm font-medium text-gray-700">
                      Pickup Time
                    </label>
                    <input
                      type="time"
                      id="pickup-time"
                      name="pickup-time"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  onClick={() => handleClaimRequest(selectedRequest._id)}
                  disabled={!pickupDate || !pickupTime}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:col-start-2 sm:text-sm disabled:opacity-50"
                >
                  Confirm Claim
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodBankPortal; 