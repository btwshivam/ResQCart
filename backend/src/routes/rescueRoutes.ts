import express from 'express';
import {
  getAllRescueRequests,
  getStoreRescueRequests,
  getFoodBankRescueRequests,
  createRescueRequest,
  updateRescueRequestStatus,
  getNearbyFoodBanks,
  runRescueCascade
} from '../controllers/rescueController';

const router = express.Router();

// Rescue request routes
router.get('/', getAllRescueRequests);
router.get('/store/:storeId', getStoreRescueRequests);
router.get('/foodbank/:foodBankId', getFoodBankRescueRequests);
router.post('/', createRescueRequest);
router.patch('/:id/status', updateRescueRequestStatus);

// Food bank routes
router.get('/foodbanks/nearby', getNearbyFoodBanks);

// Rescue cascade system
router.post('/cascade', runRescueCascade);

export default router; 