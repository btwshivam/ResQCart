import express from 'express';
import * as dashboardController from '../controllers/dashboardController';

const router = express.Router();

// GET dashboard statistics
router.get('/stats', dashboardController.getStats);

// GET AI predictions
router.get('/predictions', dashboardController.getPredictions);

// GET environmental impact metrics
router.get('/impact', dashboardController.getImpactMetrics);

export default router; 