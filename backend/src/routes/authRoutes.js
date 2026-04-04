import { Router } from 'express';
import {
  getCurrentUser,
  loginUser,
  registerUser
} from '../controllers/authController.js';
import { authenticateRequest } from '../middleware/authMiddleware.js';

export const authRoutes = Router();

authRoutes.post('/register', registerUser);
authRoutes.post('/login', loginUser);
authRoutes.get('/me', authenticateRequest, getCurrentUser);
