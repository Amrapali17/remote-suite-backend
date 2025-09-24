import express from 'express';
import { createTask, getTasks, updateTask, deleteTask } from '../controllers/tasksController.js';

const router = express.Router();

// Create a new task
router.post('/', createTask);

// Get tasks for a workspace
router.get('/:workspace_id', getTasks);

// Update a task
router.put('/:id', updateTask);

// Delete a task
router.delete('/:id', deleteTask);

export default router;
