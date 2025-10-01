import express from "express";
import { getMessages, sendMessage } from "../controllers/chatController.js";

const router = express.Router();

// Get chat messages for a workspace
router.get("/", getMessages);

// Send a new message
router.post("/send", sendMessage);

export default router;
