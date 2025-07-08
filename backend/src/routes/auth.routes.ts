import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';
import { RequestHandler } from 'express';

const router = Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes are working' });
});

// Registration routes
router.post('/register', register as RequestHandler);

// Login routes
router.post('/login', login as RequestHandler);

export default router; 