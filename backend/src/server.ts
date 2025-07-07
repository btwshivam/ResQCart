import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { connectDB } from './config/database';
import productRoutes from './routes/productRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import aimlRoutes from './routes/aimlRoutes';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB().catch(console.error);

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for video frames
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev')); // Add logging middleware

// Basic route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ResQCart API is running' });
});

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/aiml', aimlRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app; 