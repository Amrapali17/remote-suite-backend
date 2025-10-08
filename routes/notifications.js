// routes/notifications.js
import express from 'express';
import { getNotifications, createNotification, markAsRead } from '../controllers/notificationsController.js';
const router = express.Router();

router.get('/', getNotifications);                  // Get all notifications for a user
router.post('/create', createNotification);        // Create a new notification
router.patch('/:id/read', markAsRead);            // Mark notification as read

export default router;
