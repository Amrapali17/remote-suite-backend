import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import { supabase } from "./supabaseClient.js";

import authRoutes from "./routes/auth.js";
import workspaceRoutes from "./routes/workspaces.js";
import taskRoutes from "./routes/tasks.js";
import docsRoutes from "./routes/docs.js";
import whiteboardsRoutes from "./routes/whiteboards.js";
import videoRoomsRoutes from "./routes/videoRooms.js";
import chatRoutes from "./routes/chat.js";
import notificationsRoutes from "./routes/notifications.js";

dotenv.config();

const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/docs", docsRoutes);
app.use("/api/whiteboards", whiteboardsRoutes);
app.use("/api/video-rooms", videoRoomsRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationsRoutes);

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const onlineUsers = {};

io.on("connection", (socket) => {
  socket.on("joinWorkspace", async (workspaceId, userId) => {
    socket.join(workspaceId);
    socket.userId = userId;

    if (!onlineUsers[workspaceId]) onlineUsers[workspaceId] = [];
    if (!onlineUsers[workspaceId].includes(userId)) {
      onlineUsers[workspaceId].push(userId);
    }

    io.to(workspaceId).emit("workspaceUsers", onlineUsers[workspaceId]);
  });

  socket.on("chatMessage", async ({ workspaceId, senderId, content, is_ai }) => {
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .insert([{ workspace_id: workspaceId, sender_id: senderId, content, is_ai: is_ai || false }])
        .select()
        .single();

      if (!error && data) io.to(workspaceId).emit("chatMessage", data);
    } catch (err) {
      console.error(err.message);
    }
  });

  socket.on("sendNotification", async ({ workspaceId, userId, type, message, link }) => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .insert([{ workspace_id: workspaceId, user_id: userId, type, message, link }])
        .select()
        .single();

      if (!error && data) io.to(workspaceId).emit("notification", data);
    } catch (err) {
      console.error(err.message);
    }
  });

  socket.on("docUpdate", async ({ workspaceId, docId, content, title }) => {
    try {
      const { data, error } = await supabase
        .from("docs")
        .update({ content, title, updated_at: new Date() })
        .eq("id", docId)
        .select()
        .single();

      if (!error && data) socket.to(workspaceId).emit("docUpdated", data);
    } catch (err) {
      console.error(err.message);
    }
  });

  socket.on("whiteboardUpdate", async ({ workspaceId, whiteboardId, drawData }) => {
    try {
      await supabase
        .from("whiteboards")
        .update({ data: drawData, updated_at: new Date() })
        .eq("id", whiteboardId);

      socket.to(workspaceId).emit("whiteboardUpdate", { whiteboardId, drawData });
    } catch (err) {
      console.error(err.message);
    }
  });

  socket.on("whiteboardClear", async ({ workspaceId, whiteboardId }) => {
    try {
      await supabase
        .from("whiteboards")
        .update({ data: null, updated_at: new Date() })
        .eq("id", whiteboardId);

      io.to(workspaceId).emit("whiteboardClear", { whiteboardId });
    } catch (err) {
      console.error(err.message);
    }
  });

  socket.on("joinRoom", async ({ roomId, userId }) => {
    socket.join(roomId);
    socket.userId = userId;

    let userName = userId;
    try {
      const { data: user, error } = await supabase
        .from("users")
        .select("id, name")
        .eq("id", userId)
        .single();

      if (!error && user) userName = user.name;
    } catch (err) {
      console.error(err.message);
    }

    io.to(roomId).emit("userJoined", { userId, name: userName });
  });

  socket.on("signal", ({ roomId, signalData, toUserId }) => {
    socket.to(toUserId).emit("signal", { signalData, fromUserId: socket.id });
  });

  socket.on("leaveRoom", ({ roomId, userId }) => {
    socket.leave(roomId);
    socket.to(roomId).emit("userLeft", { userId });
  });

  socket.on("disconnect", () => {
    for (const workspaceId in onlineUsers) {
      onlineUsers[workspaceId] = onlineUsers[workspaceId].filter(id => id !== socket.userId);
      io.to(workspaceId).emit("workspaceUsers", onlineUsers[workspaceId]);
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
