import { Router } from 'express';
import {
  cancelMyRegistration,
  createRegistration,
  getAllRegistrations,
  getMyRegistrations,
  updateRegistrationStatus
} from '../controllers/registrationController.js';
import {
  authenticateRequest,
  authorizeRoles
} from '../middleware/authMiddleware.js';

export const registrationRoutes = Router();

registrationRoutes.post(
  '/',
  authenticateRequest,
  authorizeRoles('student'),
  createRegistration
);
registrationRoutes.get(
  '/me',
  authenticateRequest,
  authorizeRoles('student'),
  getMyRegistrations
);
registrationRoutes.patch(
  '/:id/cancel',
  authenticateRequest,
  authorizeRoles('student'),
  cancelMyRegistration
);
registrationRoutes.get(
  '/',
  authenticateRequest,
  authorizeRoles('admin'),
  getAllRegistrations
);
registrationRoutes.patch(
  '/:id/status',
  authenticateRequest,
  authorizeRoles('admin'),
  updateRegistrationStatus
);
