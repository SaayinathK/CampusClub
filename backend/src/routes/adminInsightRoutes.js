import { Router } from 'express';
import {
  exportReport,
  getAnalyticsSummary,
  getDashboardOverview,
  getReportsSummary
} from '../controllers/adminInsightsController.js';
import {
  authenticateRequest,
  authorizeRoles
} from '../middleware/authMiddleware.js';

export const adminInsightRoutes = Router();

adminInsightRoutes.use(authenticateRequest, authorizeRoles('admin'));

adminInsightRoutes.get('/dashboard-overview', getDashboardOverview);
adminInsightRoutes.get('/analytics-summary', getAnalyticsSummary);
adminInsightRoutes.get('/reports-summary', getReportsSummary);
adminInsightRoutes.get('/reports-export', exportReport);
