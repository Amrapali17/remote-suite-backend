
import express from "express";
import {
  createTask,
  getTasksByWorkspace,
  getTasksByUser,
  updateTask,
  deleteTask
} from "../controllers/tasksController.js";

const router = express.Router();


router.post("/create", createTask);


router.get("/workspace", getTasksByWorkspace);


router.get("/user", getTasksByUser);


router.put("/:id", updateTask);


router.delete("/:id", deleteTask);

export default router;
