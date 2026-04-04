import { Router } from 'express';
import {
  createCommunity,
  deleteCommunity,
  getCommunities,
  updateCommunity
} from '../controllers/communityController.js';
import {
  authenticateRequest,
  authorizeRoles
} from '../middleware/authMiddleware.js';
import { uploadCommunityImage } from '../middleware/uploadMiddleware.js';

export const communityRoutes = Router();

communityRoutes.get('/', getCommunities);
communityRoutes.post(
  '/',
  authenticateRequest,
  authorizeRoles('admin'),
  uploadCommunityImage,
  createCommunity
);
communityRoutes.put(
  '/:id',
  authenticateRequest,
  authorizeRoles('admin'),
  uploadCommunityImage,
  updateCommunity
);
communityRoutes.delete(
  '/:id',
  authenticateRequest,
  authorizeRoles('admin'),
  deleteCommunity
);
