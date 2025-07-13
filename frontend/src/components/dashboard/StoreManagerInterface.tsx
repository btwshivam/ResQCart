import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusCircleIcon,
  ClockIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

interface Product {
  _id: string;
  name: string;
  category: string;
  subCategory?: string;
  price: number;
  currentPrice?: number;
  discountPercentage: number;
  quantityInStock: number;
  expirationDate: string;
  atRisk: boolean;
  rescueStatus: string;
  imageUrl?: string;
}

interface RescueRequest {
  _id: string;
  products: Product[];
  status: string;
  rescueType: string;
  foodBankId?: any;
  scheduledPickupTime?: string;
  createdAt: string;
  daysUntilExpiration: number;
}

const StoreManagerInterface: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'at-risk' | 'rescue-requests' | 'cascade'>('at-risk');
  const [products, setProducts] = useState<Product[]>([]);
  const [rescueRequests, setRescueRequests] = useState<RescueRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [discountPercentage, setDiscountPercentage] = useState<number>(15);
  const [cascadeResults, setCascadeResults] = useState<any>(null);
  const [cascadeLoading, setCascadeLoading] = useState(false);
  
  // Mock store ID for demo purposes
  const storeId = '65f1a1a1a1a1a1a1a1a1a1a1';
  
  useEffect(() => {
    if (activeTab === 'at-risk') {
      fetchAtRiskProducts();
    } else if (activeTab === 'rescue-requests') {
      fetchRescueRequests();
    }
  }, [activeTab]);
  
  const fetchAtRiskProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/api/products/at-risk');
      setProducts(response.data);
    } catch (err) {
      console.error('Error fetching at-risk products:', err);
      setError('Failed to load at-risk products. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchRescueRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`/api/rescue/store/${storeId}`);
      setRescueRequests(response.data);
    } catch (err) {
      console.error('Error fetching rescue requests:', err);
      setError('Failed to load rescue requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleApplyPriceReduction = async () => {
    if (selectedProducts.length === 0) {
      setError('Please select at least one product.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Apply price reduction to each selected product
      for (const productId of selectedProducts) {
        await axios.post(`/api/products/${productId}/price-reduction`, {
          discountPercentage
        });
      }
      
      setSuccessMessage(`Price reduction of ${discountPercentage}% applied to ${selectedProducts.length} products.`);
      setSelectedProducts([]);
      
      // Refresh products list
      fetchAtRiskProducts();
    } catch (err) {
      console.error('Error applying price reduction:', err);
      setError('Failed to apply price reduction. Please try again.');
    } finally {
      setLoading(false);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    }
  };
  
  const handleCreateFoodBankAlert = async () => {
    if (selectedProducts.length === 0) {
      setError('Please select at least one product.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Create a rescue request for food bank alert
      await axios.post('/api/rescue', {
        products: selectedProducts,
        storeId,
        rescueType: 'food-bank-alert',
        rescueCascadeStage: 3,
        status: 'pending',
        daysUntilExpiration: 2, // Assuming 2 days until expiration for food bank alerts
      });
      
      setSuccessMessage(`Food bank alert created for ${selectedProducts.length} products.`);
      setSelectedProducts([]);
      
      // Refresh products list
      fetchAtRiskProducts();
    } catch (err) {
      console.error('Error creating food bank alert:', err);
      setError('Failed to create food bank alert. Please try again.');
    } finally {
      setLoading(false);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    }
  };
  
  const handleRunRescueCascade = async () => {
    try {
      setCascadeLoading(true);
      setError(null);
      
      const response = await axios.post('/api/rescue/cascade', {
        storeId
      });
      
      setCascadeResults(response.data);
      setSuccessMessage('Rescue cascade completed successfully.');
    } catch (err) {
      console.error('Error running rescue cascade:', err);
      setError('Failed to run rescue cascade. Please try again.');
    } finally {
      setCascadeLoading(false);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    }
  };
  
  const handleToggleProductSelection = (productId: string) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };
  
  const getDaysUntilExpiration = (expirationDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const expDate = new Date(expirationDate);
    expDate.setHours(0, 0, 0, 0);
    
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'price-reduction':
        return 'bg-blue-100 text-blue-800';
      case 'food-bank-alert':
        return 'bg-green-100 text-green-800';
      case 'employee-discount':
        return 'bg-yellow-100 text-yellow-800';
      case 'final-sale':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Store Manager Interface</h1>
        <p className="text-gray-600">
          Manage at-risk products and coordinate rescue operations.
        </p>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex -mb-px space-x-8">
          <button
            onClick={() => setActiveTab('at-risk')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'at-risk'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
              At-Risk Products
            </div>
          </button>
          <button
            onClick={() => setActiveTab('rescue-requests')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'rescue-requests'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <TruckIcon className="h-5 w-5 mr-2" />
              Rescue Requests
            </div>
          </button>
          <button
            onClick={() => setActiveTab('cascade')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'cascade'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              Rescue Cascade
            </div>
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
      
      {/* Success message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* At-Risk Products Tab */}
      {activeTab === 'at-risk' && !loading && (
        <>
          {/* Action buttons */}
          <div className="mb-6 flex flex-wrap gap-4">
            <div className="flex-1">
              <label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-1">
                Discount Percentage
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="number"
                  name="discount"
                  id="discount"
                  min="1"
                  max="90"
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                  className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                  placeholder="15"
                />
                <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  %
                </span>
              </div>
            </div>
            
            <div className="flex items-end space-x-4">
              <button
                onClick={handleApplyPriceReduction}
                disabled={selectedProducts.length === 0}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Apply Price Reduction
              </button>
              
              <button
                onClick={handleCreateFoodBankAlert}
                disabled={selectedProducts.length === 0}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                Create Food Bank Alert
              </button>
            </div>
          </div>
          
          {/* Products table */}
          {products.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No at-risk products</h3>
              <p className="mt-1 text-sm text-gray-500">
                There are no products at risk of expiration at the moment.
              </p>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {products.map((product) => {
                  const daysLeft = getDaysUntilExpiration(product.expirationDate);
                  return (
                    <li key={product._id}>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <input
                              id={`product-${product._id}`}
                              name={`product-${product._id}`}
                              type="checkbox"
                              checked={selectedProducts.includes(product._id)}
                              onChange={() => handleToggleProductSelection(product._id)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <div className="ml-3 flex items-center">
                              {product.imageUrl && (
                                <img
                                  className="h-10 w-10 rounded-full object-cover mr-3"
                                  src={product.imageUrl}
                                  alt={product.name}
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = 'https://via.placeholder.com/40?text=N/A';
                                  }}
                                />
                              )}
                              <div>
                                <p className="text-sm font-medium text-gray-900">{product.name}</p>
                                <p className="text-xs text-gray-500">{product.category} • {product.subCategory || 'General'}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">
                                {product.currentPrice ? (
                                  <>
                                    {formatCurrency(product.currentPrice)}
                                    <span className="ml-1 text-xs line-through text-gray-500">
                                      {formatCurrency(product.price)}
                                    </span>
                                  </>
                                ) : (
                                  formatCurrency(product.price)
                                )}
                              </p>
                              <p className="text-xs text-gray-500">
                                {product.quantityInStock} in stock
                              </p>
                            </div>
                            
                            <div>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                daysLeft <= 1 ? 'bg-red-100 text-red-800' : 
                                daysLeft <= 3 ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {daysLeft > 0 ? `${daysLeft} days left` : 'Expires today'}
                              </span>
                            </div>
                            
                            {product.rescueStatus !== 'none' && (
                              <div>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(product.rescueStatus)}`}>
                                  {product.rescueStatus.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </>
      )}
      
      {/* Rescue Requests Tab */}
      {activeTab === 'rescue-requests' && !loading && (
        <>
          {rescueRequests.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No rescue requests</h3>
              <p className="mt-1 text-sm text-gray-500">
                There are no active rescue requests at the moment.
              </p>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {rescueRequests.map((request) => (
                  <li key={request._id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              request.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                              request.status === 'completed' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </span>
                            <span className="ml-2 text-sm font-medium text-gray-900">
                              {request.rescueType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </span>
                            <span className="ml-2 text-xs text-gray-500">
                              {request.products.length} items
                            </span>
                          </div>
                          
                          <div className="mt-1 flex items-center text-xs text-gray-500">
                            <ClockIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            <p>Created on {formatDate(request.createdAt)}</p>
                            
                            {request.status === 'accepted' && request.scheduledPickupTime && (
                              <p className="ml-4">
                                <span className="text-gray-900 font-medium">Pickup:</span> {formatDate(request.scheduledPickupTime)}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="ml-2">
                          {request.status === 'accepted' && request.foodBankId && (
                            <div className="text-sm">
                              <p className="font-medium text-gray-900">
                                {typeof request.foodBankId === 'object' ? request.foodBankId.name : 'Food Bank'}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Product summary */}
                      <div className="mt-2 text-sm text-gray-500">
                        <p>Products: {request.products.map(p => p.name).join(', ')}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
      
      {/* Rescue Cascade Tab */}
      {activeTab === 'cascade' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Rescue Cascade System</h2>
              <p className="mt-1 text-sm text-gray-500">
                Automatically process products through the rescue cascade based on days until expiration.
              </p>
            </div>
            <button
              onClick={handleRunRescueCascade}
              disabled={cascadeLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {cascadeLoading ? (
                <>
                  <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Processing...
                </>
              ) : (
                <>
                  <ArrowPathIcon className="-ml-1 mr-2 h-4 w-4" />
                  Run Rescue Cascade
                </>
              )}
            </button>
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-base font-medium text-gray-900 mb-4">Rescue Cascade Stages:</h3>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">Stage 1: Rebalance Inventory</h4>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    7-5 days
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Products with 5-7 days until expiration get a 10% price reduction.
                </p>
                {cascadeResults && (
                  <p className="mt-2 text-sm font-medium text-gray-900">
                    {cascadeResults.results.stage1} products processed
                  </p>
                )}
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">Stage 2: Dynamic Pricing</h4>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    4-3 days
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Products with 3-4 days until expiration get a 30% price reduction.
                </p>
                {cascadeResults && (
                  <p className="mt-2 text-sm font-medium text-gray-900">
                    {cascadeResults.results.stage2} products processed
                  </p>
                )}
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">Stage 3: Food Bank Alerts</h4>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    2-1 days
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Products with 1-2 days until expiration are offered to food banks.
                </p>
                {cascadeResults && (
                  <p className="mt-2 text-sm font-medium text-gray-900">
                    {cascadeResults.results.stage3} products processed
                  </p>
                )}
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">Stage 4: Flash Sales</h4>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    0 days
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Products expiring today get a 70% price reduction.
                </p>
                {cascadeResults && (
                  <p className="mt-2 text-sm font-medium text-gray-900">
                    {cascadeResults.results.stage4} products processed
                  </p>
                )}
              </div>
            </div>
            
            {cascadeResults && (
              <div className="mt-6 bg-blue-50 rounded-lg p-4">
                <div className="flex items-center">
                  <ChartBarIcon className="h-5 w-5 text-blue-400 mr-2" />
                  <h3 className="text-sm font-medium text-blue-900">Cascade Results Summary</h3>
                </div>
                <div className="mt-2 text-sm">
                  <p className="text-blue-700">
                    Total products processed: <span className="font-medium">{cascadeResults.totalProductsProcessed}</span>
                  </p>
                  <p className="text-blue-700">
                    Total products rescued: <span className="font-medium">{cascadeResults.totalProductsRescued}</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreManagerInterface; 