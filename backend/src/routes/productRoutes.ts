import express from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getAtRiskProducts,
  applyPriceReduction
} from '../controllers/productController';

const router = express.Router();

// Custom routes for food waste management
router.get('/at-risk', getAtRiskProducts);

// Basic CRUD routes
router.get('/', getAllProducts);
router.post('/', createProduct);

export default router;