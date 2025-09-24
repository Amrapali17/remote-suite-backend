import express from "express";
import {
  createWorkspace,
  getWorkspaces,
  joinWorkspace,
  leaveWorkspace,
} from "../controllers/workspaceController.js";

const router = express.Router();

router.post("/", createWorkspace);
router.get("/", getWorkspaces);
router.post("/join", joinWorkspace);
router.post("/leave", leaveWorkspace);

export default router;
