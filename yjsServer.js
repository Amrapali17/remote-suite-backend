
import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import { setupWSConnection } from "y-websocket/dist/utils.js"; 

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on("connection", (conn, req) => {
  const urlObj = new URL(req.url, `http://${req.headers.host}`);
  const room = urlObj.searchParams.get("room") || "default-room";
  setupWSConnection(conn, req, { docName: room });
});

const PORT = 1234;
server.listen(PORT, () => {
  console.log(`✅ Yjs WebSocket Server running on port ${PORT}`);
});
