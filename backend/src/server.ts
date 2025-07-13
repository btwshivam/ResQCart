import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/productRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import aimlRoutes from './routes/aimlRoutes';
import rescueRoutes from './routes/rescueRoutes';

// Load environment variables
dotenv.config();

const app = express();

// Debug middleware - log all requests
app.use((req, res, next) => {
  console.log('Incoming request:', {
    method: req.method,
    path: req.path,
    body: req.body,
    headers: req.headers
  });
  next();
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for video frames
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev')); // Add logging middleware

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/resqcart';
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Test route at root
app.get('/', (req, res) => {
  console.log('Root route hit');
  res.json({ message: 'Welcome to ResQCart API' });
});

// Auth routes
console.log('Registering auth routes at /api/auth');
app.use('/api/auth', authRoutes);

// Feature routes
app.use('/api/products', productRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/aiml', aimlRoutes);
app.use('/api/rescue', rescueRoutes);

// 404 handler
app.use((req, res) => {
  console.log('404 Not Found:', {
    method: req.method,
    path: req.path,
    body: req.body,
    headers: req.headers
  });
  res.status(404).json({ message: 'Not Found' });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Available routes:');
  console.log('- GET /');
  console.log('- POST /api/auth/register');
  console.log('- POST /api/auth/login');
  console.log('- GET /api/auth/test');
  console.log('- GET /api/products');
  console.log('- GET /api/dashboard');
  console.log('- GET /api/aiml');
  console.log('- GET /api/rescue');
  console.log('- POST /api/rescue/cascade');
}); 