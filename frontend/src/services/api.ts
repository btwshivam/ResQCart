import axios from 'axios';

// Create an axios instance with the base URL from environment variables
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    // Get token from local storage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      // Server responded with a status code outside the 2xx range
      console.error('API Error:', error.response.data);
      
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        // Clear local storage and redirect to login
        localStorage.removeItem('token');
        // You might want to redirect to login page here
      }
    } else if (error.request) {
      // Request was made but no response was received
      console.error('Network Error:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const productApi = {
  // Get all products
  getAll: () => api.get('/products'),
  
  // Get at-risk products
  getAtRisk: () => api.get('/products/at-risk'),
  
  // Get a product by ID
  getById: (id: string) => api.get(`/products/${id}`),
  
  // Create a new product
  create: (data: any) => api.post('/products', data),
  
  // Update a product
  update: (id: string, data: any) => api.put(`/products/${id}`, data),
  
  // Delete a product
  delete: (id: string) => api.delete(`/products/${id}`),
  
  // Apply price reduction to a product
  applyPriceReduction: (id: string, discountPercentage: number) => 
    api.post(`/products/${id}/price-reduction`, { discountPercentage }),
};

// Dashboard API endpoints
export const dashboardApi = {
  // Get dashboard statistics
  getStats: () => api.get('/dashboard/stats'),
  
  // Get AI predictions
  getPredictions: () => api.get('/dashboard/predictions'),
  
  // Get impact metrics
  getImpactMetrics: () => api.get('/dashboard/impact'),
};
export const rescueApi = {
  // Find nearby NGOs
  getNearbyNGOs: (lat: number, lng: number) => 
    api.post('/nearby-ngos', { lat, lng }),

  // Get directions to NGO
  getRoute: (originLat: number, originLng: number, destLat: number, destLng: number) =>
    api.post('/route', {
      origin_lat: originLat,
      origin_lng: originLng,
      dest_lat: destLat,
      dest_lng: destLng
    }),
};
// AI/ML API endpoints
export const aimlApi = {
  // Detect food items in image
  detectItems: (formData: FormData) => 
    axios.post('/aiml/detect', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  // Predict milk spoilage
  predictMilkSpoilage: (sku: string) => 
    axios.post('/aiml/predict_milk_spoilage', { sku }),
    
  // Get AIML service status
  getStatus: () => 
    axios.get('/aiml/'),
};

export default api;