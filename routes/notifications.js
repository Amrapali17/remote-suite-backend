
import express from 'express';
import { getNotifications, createNotification, markAsRead } from '../controllers/notificationsController.js';
const router = express.Router();

router.get('/', getNotifications);                  
router.post('/create', createNotification);        
router.patch('/:id/read', markAsRead);           
export default router;
