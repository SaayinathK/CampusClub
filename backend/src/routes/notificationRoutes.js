import { Router } from 'express';
import {
  streamNotifications,
  createNotification,
  deleteNotificationForStudent,
  getAdminNotifications,
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead
} from '../controllers/notificationController.js';
import {
  authenticateRequest,
  authenticateStreamRequest,
  authorizeRoles
} from '../middleware/authMiddleware.js';

export const notificationRoutes = Router();

notificationRoutes.get('/stream', authenticateStreamRequest, streamNotifications);

notificationRoutes.post(
  '/',
  authenticateRequest,
  authorizeRoles('admin'),
  createNotification
);
notificationRoutes.get(
  '/admin',
  authenticateRequest,
  authorizeRoles('admin'),
  getAdminNotifications
);
notificationRoutes.get(
  '/me',
  authenticateRequest,
  authorizeRoles('student'),
  getMyNotifications
);
notificationRoutes.patch(
  '/me/read-all',
  authenticateRequest,
  authorizeRoles('student'),
  markAllNotificationsAsRead
);
notificationRoutes.patch(
  '/me/:id/read',
  authenticateRequest,
  authorizeRoles('student'),
  markNotificationAsRead
);
notificationRoutes.delete(
  '/me/:id',
  authenticateRequest,
  authorizeRoles('student'),
  deleteNotificationForStudent
);
