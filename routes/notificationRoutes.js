import express from 'express';
import { sendNotification, getNotifications } from '../controllers/notificationController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Send a new notification
router.post('/notifications', authenticateToken, sendNotification);

// View user notifications
router.get('/notifications', authenticateToken, getNotifications);

export default router;
