import { Router } from 'express';
import { getStudentFeed } from '../controllers/feedController.js';
import {
  authenticateRequest,
  authorizeRoles
} from '../middleware/authMiddleware.js';

export const feedRoutes = Router();

feedRoutes.get(
  '/student',
  authenticateRequest,
  authorizeRoles('student'),
  getStudentFeed
);
