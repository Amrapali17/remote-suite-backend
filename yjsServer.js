import WebSocket, { WebSocketServer } from 'ws';
import { setupWSConnection } from 'y-websocket/bin/utils.js';
import http from 'http';
import dotenv from 'dotenv';
import express from 'express';
import { saveDocSnapshot } from './controllers/docsController.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });


wss.on('connection', (conn, req) => {
  const docName = req.url.slice(1); 
  setupWSConnection(conn, req, {
    docName: docName,

    onUpdate: async (update) => {
      try {
        
        const doc_id = docName.split('-')[1]; 
        await saveDocSnapshot(doc_id, update);
      } catch (err) {
        console.error('Error saving doc snapshot:', err);
      }
    },
  });
});

const PORT = process.env.YJS_PORT || 1234;
server.listen(PORT, () => console.log(`Yjs WebSocket Server running on port ${PORT}`));
