import express from 'express';
import { 
  getVideoRooms, 
  createVideoRoom, 
  endVideoCall, 
  getCallHistory 
} from '../controllers/videoRoomsController.js';

const router = express.Router();

router.get('/', getVideoRooms);
router.post('/create', createVideoRoom);


router.post('/end-call', endVideoCall);       
router.get('/history', getCallHistory);      

export default router;
