import { useState, useEffect } from 'react';
import { aimlApi, dashboardApi } from '../../services/api';

interface AIInsight {
  title: string;
  description: string;
  impact: string;
  actionType: 'info' | 'warning' | 'success';
}

interface MilkSpoilageData {
  sku: string;
  prediction: string;
  probability: number;
  spoilage_data: {
    production_date: string;
    expiry_date: string;
    days_past_expiry: number;
    pH: number;
    bacterial_load_log_cfu_ml: number;
    storage_temperature_c: number;
  };
  pricing: {
    action: string;
    discount_applied: boolean;
    discount_percent: number;
    price_usd: number;
    message: string | null;
  };
  explanation: string;
}

const AIInsightsCard = () => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [milkSpoilageData, setMilkSpoilageData] = useState<MilkSpoilageData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedSku, setSelectedSku] = useState('whole_milk_1gal');
  const [error, setError] = useState<string | null>(null);

  const milkSkuOptions = [
    { value: 'whole_milk_1gal', label: 'Whole Milk (1 Gallon)' },
    { value: 'skim_milk_1gal', label: 'Skim Milk (1 Gallon)' },
    { value: 'lowfat_milk_1gal', label: 'Low-Fat Milk (1 Gallon)' },
    { value: 'uht_milk_1qt', label: 'UHT Milk (1 Quart)' },
  ];

  // Fetch AI insights from the backend
  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setInsightsLoading(true);
        const response = await dashboardApi.getPredictions();
        setInsights(response.data.insights || []);
      } catch (err) {
        console.error('Error fetching AI insights:', err);
        // Fallback data in case of error
        setInsights([
          {
            title: 'Milk Spoilage Detection',
            description: 'AI detected milk products that may spoil within 3 days based on pH levels and bacterial analysis.',
            impact: 'Potential revenue loss',
            actionType: 'warning',
          },
          {
            title: 'Apple Freshness Analysis',
            description: 'Computer vision identified apple inventory showing early signs of deterioration.',
            impact: 'Recommend discount to accelerate sales',
            actionType: 'info',
          }
        ]);
      } finally {
        setInsightsLoading(false);
      }
    };

    fetchInsights();
  }, []);

  const handleMilkPrediction = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await aimlApi.predictMilkSpoilage(selectedSku);
      setMilkSpoilageData(response.data);
    } catch (err) {
      console.error('Error predicting milk spoilage:', err);
      setError('Failed to get milk spoilage prediction. Please ensure the AIML service is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">AI-Powered Insights</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Machine learning predictions to optimize inventory management
            </p>
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800">
            ML-Powered
          </span>
        </div>
      </div>
      
      {/* Milk Spoilage Prediction Section */}
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h4 className="text-md font-medium text-gray-900">Realtime Milk Spoilage Prediction</h4>
        <div className="mt-4 flex items-end">
          <div className="w-64">
            <label htmlFor="milk-sku" className="block text-sm font-medium text-gray-700">
              Select Milk Product
            </label>
            <select
              id="milk-sku"
              name="milk-sku"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={selectedSku}
              onChange={(e) => setSelectedSku(e.target.value)}
              disabled={loading}
            >
              {milkSkuOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={handleMilkPrediction}
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Predicting...
              </>
            ) : (
              'Run Prediction'
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {milkSpoilageData && (
          <div className="mt-4 border border-gray-200 rounded-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-lg font-medium text-gray-900">
                  {milkSkuOptions.find(option => option.value === milkSpoilageData.sku)?.label}
                </h5>
                <p className="text-sm text-gray-500">
                  Expiry Date: {new Date(milkSpoilageData.spoilage_data.expiry_date).toLocaleDateString()}
                </p>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium ${
                milkSpoilageData.prediction === 'fresh' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {milkSpoilageData.prediction === 'fresh' ? 'Fresh' : 'Spoiled'}
              </span>
            </div>
            
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <h6 className="text-sm font-medium text-gray-700">Spoilage Indicators</h6>
                <ul className="mt-2 text-sm text-gray-600 space-y-1">
                  <li>Days Past Expiry: {milkSpoilageData.spoilage_data.days_past_expiry}</li>
                  <li>pH Level: {milkSpoilageData.spoilage_data.pH}</li>
                  <li>Bacterial Load: {milkSpoilageData.spoilage_data.bacterial_load_log_cfu_ml} log CFU/ml</li>
                  <li>Storage Temperature: {milkSpoilageData.spoilage_data.storage_temperature_c}°C</li>
                </ul>
              </div>
              <div>
                <h6 className="text-sm font-medium text-gray-700">Recommended Action</h6>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
                    milkSpoilageData.pricing.action === 'sell' ? 'bg-green-100 text-green-800' :
                    milkSpoilageData.pricing.action === 'donate' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {milkSpoilageData.pricing.action === 'sell' ? 'Sell' :
                     milkSpoilageData.pricing.action === 'donate' ? 'Donate' : 'Dispose'}
                  </span>
                  
                  {milkSpoilageData.pricing.discount_applied && (
                    <p className="mt-2 text-sm">
                      Recommended Price: <span className="font-medium">${milkSpoilageData.pricing.price_usd.toFixed(2)}</span>
                      <span className="ml-2 text-xs text-red-500">
                        (-{milkSpoilageData.pricing.discount_percent}% discount)
                      </span>
                    </p>
                  )}
                  
                  {milkSpoilageData.pricing.message && (
                    <p className="mt-2 text-sm text-gray-600">{milkSpoilageData.pricing.message}</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <h6 className="text-sm font-medium text-gray-700">AI Analysis</h6>
              <p className="mt-1 text-xs text-gray-600">
                {milkSpoilageData.explanation}
              </p>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Apply Recommendation
              </button>
            </div>
          </div>
        )}
      </div>
      
      <ul className="divide-y divide-gray-200">
        {insightsLoading ? (
          <li className="px-4 py-4 sm:px-6 text-center">
            <div className="flex justify-center items-center">
              <svg className="animate-spin h-5 w-5 text-indigo-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Loading insights...</span>
            </div>
          </li>
        ) : insights.length === 0 ? (
          <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
            No AI insights available at this time
          </li>
        ) : (
          insights.map((insight, index) => (
            <li key={index} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
              <div className="flex items-start">
                <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                  insight.actionType === 'warning' ? 'bg-yellow-100' : 
                  insight.actionType === 'success' ? 'bg-green-100' : 'bg-blue-100'
                }`}>
                  {insight.actionType === 'warning' && (
                    <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )}
                  {insight.actionType === 'success' && (
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {insight.actionType === 'info' && (
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">{insight.title}</p>
                  <p className="mt-1 text-sm text-gray-500">{insight.description}</p>
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
                      insight.actionType === 'warning' ? 'bg-yellow-100 text-yellow-800' : 
                      insight.actionType === 'success' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {insight.impact}
                    </span>
                  </div>
                </div>
                <div className="ml-4">
                  <button 
                    type="button" 
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Take Action
                  </button>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
      <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
        <button 
          type="button" 
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          View All Insights
        </button>
      </div>
    </div>
  );
};

export default AIInsightsCard; 