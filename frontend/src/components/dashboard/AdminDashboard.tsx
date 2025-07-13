import { useState, useEffect } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import type { ChartData } from 'chart.js';
import { productApi, dashboardApi } from '../../services/api';
import AIInsightsCard from './AIInsightsCard';
import CategoryDistributionCard from './CategoryDistributionCard';
import ImagePrediction from './ImagePrediction';
import ProductManagement from './ProductManagement';
import Sidebar from './Sidebar';
import HeatmapChart from './HeatmapChart';
import GeoChart from './GeoChart';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Define chart data types
type BarChartData = ChartData<'bar', number[], string>;
type DoughnutChartData = ChartData<'doughnut', number[], string>;
type LineChartData = ChartData<'line', number[], string>;

interface Product {
  _id: string;
  name: string;
  category: string;
  subCategory: string;
  price: number;
  currentPrice: number;
  discountPercentage: number;
  expirationDate: string;
  atRisk: boolean;
  rescueStatus: string;
  imageUrl: string;
  quantityInStock: number;
}

interface AdminDashboardProps {
  onNavigateToStoreManager?: (selectedProductId?: string) => void;
}

const AdminDashboard = ({ onNavigateToStoreManager }: AdminDashboardProps) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    expiringItems: 0,
    wastePrevented: 0,
    revenueSaved: 0,
    environmentalImpact: 0,
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [atRiskProducts, setAtRiskProducts] = useState<Product[]>([]);
  const [categoryData, setCategoryData] = useState<BarChartData>({
    labels: [],
    datasets: [{
      label: 'At-Risk Items by Category',
      data: [],
      backgroundColor: [],
      borderColor: [],
      borderWidth: 1,
    }],
  });
  const [rescueData, setRescueData] = useState<DoughnutChartData>({
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
      borderColor: [],
      borderWidth: 1,
    }],
  });
  const [trendsData, setTrendsData] = useState<LineChartData>({
    labels: [],
    datasets: [],
  });
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard stats
        const dashboardResponse = await dashboardApi.getStats();
        const dashboardData = dashboardResponse.data;
        
        // Update stats
        setStats({
          expiringItems: dashboardData.stats.atRiskProducts,
          wastePrevented: dashboardData.stats.wastePrevented,
          revenueSaved: dashboardData.stats.revenueSaved,
          environmentalImpact: dashboardData.stats.environmentalImpact,
        });
        
        // Fetch products and at-risk products
        const productsResponse = await productApi.getAll();
        const atRiskResponse = await productApi.getAtRisk();
        
        setProducts(productsResponse.data);
        setAtRiskProducts(atRiskResponse.data);
        
        // Update category chart data
        if (dashboardData.categoryDistribution && dashboardData.categoryDistribution.length > 0) {
          const categoryColors: Record<string, string[]> = {
            'Dairy': ['rgba(54, 162, 235, 0.6)', 'rgba(54, 162, 235, 1)'],
            'Produce': ['rgba(75, 192, 192, 0.6)', 'rgba(75, 192, 192, 1)'],
            'Bakery': ['rgba(255, 206, 86, 0.6)', 'rgba(255, 206, 86, 1)'],
            'Meat': ['rgba(255, 99, 132, 0.6)', 'rgba(255, 99, 132, 1)'],
            'Seafood': ['rgba(153, 102, 255, 0.6)', 'rgba(153, 102, 255, 1)'],
            'Deli': ['rgba(255, 159, 64, 0.6)', 'rgba(255, 159, 64, 1)'],
            'Other': ['rgba(201, 203, 207, 0.6)', 'rgba(201, 203, 207, 1)'],
          };
          
          const labels = dashboardData.categoryDistribution.map((item: any) => item.category);
          const data = dashboardData.categoryDistribution.map((item: any) => item.atRiskCount);
          const backgroundColors = labels.map((label: string) => categoryColors[label]?.[0] || 'rgba(201, 203, 207, 0.6)');
          const borderColors = labels.map((label: string) => categoryColors[label]?.[1] || 'rgba(201, 203, 207, 1)');
          
          setCategoryData({
            labels,
            datasets: [{
              label: 'At-Risk Items by Category',
              data,
              backgroundColor: backgroundColors,
              borderColor: borderColors,
              borderWidth: 1,
            }],
          });
        }
        
        // Update rescue action chart data
        if (dashboardData.rescueActionDistribution && dashboardData.rescueActionDistribution.length > 0) {
          const actionColors: Record<string, string[]> = {
            'price-reduction': ['rgba(54, 162, 235, 0.6)', 'rgba(54, 162, 235, 1)'],
            'food-bank-alert': ['rgba(75, 192, 192, 0.6)', 'rgba(75, 192, 192, 1)'],
            'employee-discount': ['rgba(255, 206, 86, 0.6)', 'rgba(255, 206, 86, 1)'],
            'final-sale': ['rgba(255, 99, 132, 0.6)', 'rgba(255, 99, 132, 1)'],
          };
          
          const actionLabels: Record<string, string> = {
            'price-reduction': 'Price Reduction',
            'food-bank-alert': 'Food Bank',
            'employee-discount': 'Employee Discount',
            'final-sale': 'Final Sale',
          };
          
          const labels = dashboardData.rescueActionDistribution.map((item: any) => actionLabels[item.status] || item.status);
          const data = dashboardData.rescueActionDistribution.map((item: any) => item.count);
          const backgroundColors = dashboardData.rescueActionDistribution.map((item: any) => 
            actionColors[item.status]?.[0] || 'rgba(201, 203, 207, 0.6)');
          const borderColors = dashboardData.rescueActionDistribution.map((item: any) => 
            actionColors[item.status]?.[1] || 'rgba(201, 203, 207, 1)');
          
          setRescueData({
            labels,
            datasets: [{
              data,
              backgroundColor: backgroundColors,
              borderColor: borderColors,
              borderWidth: 1,
            }],
          });
        }
        
        // Update trends chart data
        if (dashboardData.monthlyTrends && dashboardData.monthlyTrends.length > 0) {
          const months = dashboardData.monthlyTrends.map((item: any) => {
            const [year, month] = item.month.split('-');
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${monthNames[parseInt(month) - 1]} ${year}`;
          });
          
          const wasteData = dashboardData.monthlyTrends.map((item: any) => item.count * 1.2); // kg
          const revenueData = dashboardData.monthlyTrends.map((item: any) => item.savedRevenue);
          
          setTrendsData({
            labels: months,
            datasets: [
              {
                label: 'Waste Prevented (kg)',
                data: wasteData,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.4,
                fill: true,
              },
              {
                label: 'Revenue Saved ($)',
                data: revenueData,
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                tension: 0.4,
                fill: true,
              },
            ],
          });
        } else {
          // Fallback data if no trends are available
          setTrendsData({
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
              {
                label: 'Waste Prevented (kg)',
                data: [65, 78, 90, 81, 95, 110],
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.4,
                fill: true,
              },
              {
                label: 'Revenue Saved ($)',
                data: [28, 48, 40, 59, 76, 85],
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                tension: 0.4,
                fill: true,
              },
            ],
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
        
        // Set fallback data in case of error
        setCategoryData({
          labels: ['Dairy', 'Produce', 'Bakery', 'Meat', 'Seafood', 'Deli'],
          datasets: [
            {
              label: 'At-Risk Items by Category',
              data: [12, 8, 5, 7, 3, 2],
              backgroundColor: [
                'rgba(54, 162, 235, 0.6)',
                'rgba(75, 192, 192, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(255, 99, 132, 0.6)',
                'rgba(153, 102, 255, 0.6)',
                'rgba(255, 159, 64, 0.6)',
              ],
              borderColor: [
                'rgba(54, 162, 235, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(255, 99, 132, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
              ],
              borderWidth: 1,
            },
          ],
        });
        
        setRescueData({
          labels: ['Price Reduction', 'Food Bank', 'Employee Discount', 'Final Sale'],
          datasets: [
            {
              data: [15, 8, 4, 2],
              backgroundColor: [
                'rgba(54, 162, 235, 0.6)',
                'rgba(75, 192, 192, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(255, 99, 132, 0.6)',
              ],
              borderColor: [
                'rgba(54, 162, 235, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(255, 99, 132, 1)',
              ],
              borderWidth: 1,
            },
          ],
        });
      }
    };

    fetchData();
  }, []);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  // Get status badge color
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

  // Get days until expiration
  const getDaysUntilExpiration = (dateString: string) => {
    const expirationDate = new Date(dateString);
    const today = new Date();
    const diffTime = expirationDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleTakeAction = (productId: string) => {
    if (onNavigateToStoreManager) {
      onNavigateToStoreManager(productId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex gap-4 p-4">
        {/* Sidebar */}
        <div className="flex-shrink-0">
          <div className="sticky top-4">
            <Sidebar activeItem={activeTab} onItemSelect={handleTabChange} />
        </div>
      </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
      {loading ? (
            <div className="flex justify-center items-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Loading dashboard data...</p>
              </div>
        </div>
      ) : (
            <div className="space-y-8">
              {/* Page Header */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                      {activeTab === 'overview' && 'Dashboard Overview'}
                      {activeTab === 'products' && 'Product Management'}
                      {activeTab === 'image' && 'Image Prediction'}
                      {activeTab === 'insights' && 'AI Insights'}
                    </h1>
                    <p className="text-gray-600 mt-1">
                      {activeTab === 'overview' && 'Monitor your inventory and track waste prevention metrics'}
                      {activeTab === 'products' && 'Manage product inventory and rescue actions'}
                      {activeTab === 'image' && 'Analyze product images with AI-powered detection'}
                      {activeTab === 'insights' && 'Get intelligent insights and recommendations'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      Live
                    </div>
                    <div className="text-sm text-gray-500">
                      Last updated: {new Date().toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
                <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white overflow-hidden shadow-lg rounded-2xl p-6 border-l-4 border-blue-500 transition-all hover:shadow-xl hover:transform hover:scale-105">
                  <div className="flex items-center">
                        <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-5">
                      <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Expiring Soon</p>
                      <p className="text-3xl font-bold text-gray-800">{stats.expiringItems}</p>
                    </div>
                  </div>
                </div>
                
                    <div className="bg-white overflow-hidden shadow-lg rounded-2xl p-6 border-l-4 border-green-500 transition-all hover:shadow-xl hover:transform hover:scale-105">
                  <div className="flex items-center">
                        <div className="p-3 rounded-xl bg-green-100 text-green-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                      </svg>
                    </div>
                    <div className="ml-5">
                      <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Waste Prevented</p>
                      <p className="text-3xl font-bold text-gray-800">{stats.wastePrevented} kg</p>
                    </div>
                  </div>
                </div>
                
                    <div className="bg-white overflow-hidden shadow-lg rounded-2xl p-6 border-l-4 border-yellow-500 transition-all hover:shadow-xl hover:transform hover:scale-105">
                  <div className="flex items-center">
                        <div className="p-3 rounded-xl bg-yellow-100 text-yellow-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-5">
                      <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Revenue Saved</p>
                      <p className="text-3xl font-bold text-gray-800">{formatCurrency(stats.revenueSaved)}</p>
                    </div>
                  </div>
                </div>
                
                    <div className="bg-white overflow-hidden shadow-lg rounded-2xl p-6 border-l-4 border-purple-500 transition-all hover:shadow-xl hover:transform hover:scale-105">
                  <div className="flex items-center">
                        <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-5">
                      <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">CO₂ Saved</p>
                      <p className="text-3xl font-bold text-gray-800">{stats.environmentalImpact} kg</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-2xl shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">At-Risk Items by Category</h3>
                  <div className="h-64">
                    <Bar 
                      data={categoryData} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false
                          }
                        }
                      }} 
                    />
                  </div>
                </div>
                
                    <div className="bg-white p-6 rounded-2xl shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Rescue Actions Distribution</h3>
                  <div className="h-64 flex justify-center">
                    <Doughnut 
                      data={rescueData} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'right'
                          }
                        }
                      }} 
                    />
                  </div>
                </div>
              </div>

              {/* Trends Chart */}
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Trends</h3>
                <div className="h-80">
                  <Line 
                    data={trendsData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top'
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true
                        }
                      }
                    }} 
                  />
                </div>
              </div>

              {/* Heatmap and Geo Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                  <HeatmapChart />
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                  <GeoChart />
                </div>
              </div>

              {/* Product Gallery */}
                  <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">At-Risk Products</h3>
                  <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                    {atRiskProducts.length} Items
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {atRiskProducts.slice(0, 8).map((product) => (
                        <div key={product._id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-200 hover:transform hover:scale-105">
                      <div className="h-48 overflow-hidden relative">
                        <img 
                          src={product.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                          }}
                        />
                        {product.discountPercentage > 0 && (
                          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md">
                            {product.discountPercentage}% OFF
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="text-sm font-semibold text-gray-800 line-clamp-2">{product.name}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClass(product.rescueStatus)}`}>
                            {product.rescueStatus === 'none' ? 'No Action' : product.rescueStatus.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <div>
                            <p className="text-xs text-gray-500">{product.category} • {product.subCategory}</p>
                            <div className="flex items-center mt-1">
                              {product.currentPrice !== product.price ? (
                                <>
                                  <span className="text-sm font-bold text-gray-800">{formatCurrency(product.currentPrice)}</span>
                                  <span className="text-xs text-gray-500 line-through ml-2">{formatCurrency(product.price)}</span>
                                </>
                              ) : (
                                <span className="text-sm font-bold text-gray-800">{formatCurrency(product.price)}</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Expires</p>
                            <p className={`text-xs font-medium ${getDaysUntilExpiration(product.expirationDate) <= 3 ? 'text-red-600' : 'text-gray-700'}`}>
                              {formatDate(product.expirationDate)}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex justify-between items-center">
                          <div className="text-xs text-gray-500">
                            Stock: <span className="font-medium">{product.quantityInStock}</span>
                          </div>
                          <button 
                            onClick={() => handleTakeAction(product._id)}
                            className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                          >
                            Take Action
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {atRiskProducts.length > 8 && (
                  <div className="mt-6 text-center">
                    <button 
                      onClick={() => setActiveTab('products')}
                      className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                    >
                      View All {atRiskProducts.length} At-Risk Products
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
                <div className="bg-white rounded-2xl shadow-lg">
            <ProductManagement onNavigateToStoreManager={onNavigateToStoreManager} />
                </div>
          )}

              {/* Image Prediction Tab */}
              {activeTab === 'image' && (
                <div className="bg-white rounded-2xl shadow-lg">
                  <ImagePrediction />
                </div>
          )}

          {/* Insights Tab */}
          {activeTab === 'insights' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <AIInsightsCard />
              <CategoryDistributionCard />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 