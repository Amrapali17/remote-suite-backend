// routes/whiteboards.js
import express from 'express';
import {
  getWhiteboards,
  createWhiteboard,
  updateWhiteboard,
  deleteWhiteboard,
} from '../controllers/whiteboardsController.js';

const router = express.Router();

router.get('/', getWhiteboards);
router.post('/create', createWhiteboard);
router.put('/:id', updateWhiteboard);
router.delete('/:id', deleteWhiteboard);

export default router;
