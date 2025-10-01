import express from "express";
import {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  deleteWorkspace,
  joinWorkspace,
  leaveWorkspace
} from "../controllers/workspaceController.js";

const router = express.Router();

router.post("/create", createWorkspace);
router.get("/", getWorkspaces);
router.get("/:id", getWorkspaceById);
router.delete("/:id", deleteWorkspace);
router.post("/join", joinWorkspace);
router.post("/leave", leaveWorkspace);

export default router;
