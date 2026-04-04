import { Router } from 'express';
import {
  createEvent,
  deleteEvent,
  getEventById,
  getEvents,
  updateEvent
} from '../controllers/eventController.js';
import {
  authenticateRequest,
  authorizeRoles
} from '../middleware/authMiddleware.js';
import { uploadEventImage } from '../middleware/uploadMiddleware.js';

export const eventRoutes = Router();

eventRoutes.get('/', getEvents);
eventRoutes.get('/:id', getEventById);
eventRoutes.post(
  '/',
  authenticateRequest,
  authorizeRoles('admin'),
  uploadEventImage,
  createEvent
);
eventRoutes.put(
  '/:id',
  authenticateRequest,
  authorizeRoles('admin'),
  uploadEventImage,
  updateEvent
);
eventRoutes.delete(
  '/:id',
  authenticateRequest,
  authorizeRoles('admin'),
  deleteEvent
);
