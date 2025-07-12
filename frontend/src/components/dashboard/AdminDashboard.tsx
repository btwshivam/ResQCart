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
import RealtimePredictionAnalysis from './RealtimePredictionAnalysis';
import HeatmapChart from './HeatmapChart';
import Scatter3DChart from './Scatter3DChart';

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

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    expiringItems: 0,
    wastePrevented: 0,
    revenueSaved: 0,
    environmentalImpact: 0,
  });
  const [products, setProducts] = useState<any[]>([]);
  const [atRiskProducts, setAtRiskProducts] = useState<any[]>([]);
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
              data: [40, 30, 20, 10],
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

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Comprehensive overview of food waste prevention metrics and actions.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Expiring Soon Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-yellow-500">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Items Expiring Soon</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {loading ? '...' : stats.expiringItems}
                      </div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-yellow-600">
                        <span>Needs attention</span>
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Waste Prevented Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-green-500">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Waste Prevented</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {loading ? '...' : `${stats.wastePrevented} kg`}
                      </div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        <span>This month</span>
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Saved Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-blue-500">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Revenue Saved</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {loading ? '...' : `$${stats.revenueSaved.toFixed(2)}`}
                      </div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-blue-600">
                        <span>This month</span>
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Environmental Impact Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-purple-500">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Environmental Impact</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {loading ? '...' : `${stats.environmentalImpact} kg CO₂e`}
                      </div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-purple-600">
                        <span>Emissions saved</span>
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights Card */}
        <div className="mt-8">
          <AIInsightsCard />
        </div>

        {/* Realtime Prediction Analysis */}
        <div className="mt-8">
          <RealtimePredictionAnalysis />
        </div>

        {/* Charts Section */}
        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Categories Chart */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">At-Risk Items by Category</h3>
              <div className="mt-5 h-64">
                <Bar 
                  data={categoryData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                  }} 
                />
              </div>
            </div>
          </div>

          {/* 3D Scatter Plot */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">3D Spoilage Hotspots</h3>
              <div className="mt-5">
                <Scatter3DChart />
              </div>
            </div>
          </div>
        </div>

        {/* Heatmap Chart */}
        <div className="mt-5 bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Spoilage Heatmap Analysis</h3>
            <div className="mt-5">
              <HeatmapChart />
            </div>
          </div>
        </div>

        {/* Category Distribution Card */}
        <div className="mt-8">
          <CategoryDistributionCard />
        </div>

        {/* At-Risk Products Table */}
        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">At-Risk Products</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Items requiring immediate attention</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiration
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : atRiskProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      No at-risk products found
                    </td>
                  </tr>
                ) : (
                  atRiskProducts.map((product) => (
                    <tr key={product._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(product.expirationDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.quantityInStock} {product.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${product.rescueStatus === 'none' ? 'bg-yellow-100 text-yellow-800' : 
                            product.rescueStatus === 'price-reduction' ? 'bg-blue-100 text-blue-800' :
                            product.rescueStatus === 'food-bank-alert' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'}`}>
                          {product.rescueStatus === 'none' ? 'No Action' :
                           product.rescueStatus === 'price-reduction' ? 'Price Reduced' :
                           product.rescueStatus === 'food-bank-alert' ? 'Food Bank Alert' :
                           product.rescueStatus === 'employee-discount' ? 'Employee Discount' : 'Final Sale'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                          Reduce Price
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          Donate
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 