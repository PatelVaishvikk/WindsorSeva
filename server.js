// server.js
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import next from 'next';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import connectDb from './lib/db.js';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

// Ensure MongoDB URI is provided
if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const PORT = process.env.PORT || 3000;

app.prepare().then(() => {
  const expressApp = express();

  // Connect to MongoDB
  connectDb().catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });

  // Body parsers for JSON and URL-encoded payloads
  expressApp.use(express.json());
  expressApp.use(express.urlencoded({ extended: true }));

  // Serve static files
  expressApp.use(express.static(path.join(__dirname, 'public')));
  expressApp.use('/styles', express.static(path.join(__dirname, 'public/styles')));

  // Let Next.js handle all other routes including API routes
  expressApp.all('*', (req, res) => handle(req, res));

  // Create HTTP server from express app
  const httpServer = createServer(expressApp);

  // Initialize Socket.IO on the HTTP server
  const io = new SocketIOServer(httpServer);
  global.io = io; // Make available to API routes

  io.on('connection', (socket) => {
    console.log('New client connected');
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  // Start the server
  httpServer.listen(PORT, err => {
    if (err) {
      console.error('Error starting server:', err);
      process.exit(1);
    }
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
