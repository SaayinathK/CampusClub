import cors from 'cors';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { adminInsightRoutes } from './routes/adminInsightRoutes.js';
import { authRoutes } from './routes/authRoutes.js';
import { communityRoutes } from './routes/communityRoutes.js';
import { eventRoutes } from './routes/eventRoutes.js';
import { feedRoutes } from './routes/feedRoutes.js';
import { healthRoutes } from './routes/healthRoutes.js';
import { notificationRoutes } from './routes/notificationRoutes.js';
import { registrationRoutes } from './routes/registrationRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js';

export const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDirectory = path.resolve(__dirname, '../uploads');

app.use(
  cors({
    origin: (process.env.CLIENT_URLS || 'http://localhost:5173')
      .split(',')
      .map((value) => value.trim()),
    credentials: true
  })
);
app.use(express.json());
app.use('/uploads', express.static(uploadsDirectory));

app.use('/api/health', healthRoutes);
app.use('/api/admin', adminInsightRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/registrations', registrationRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
