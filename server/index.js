import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { WebSocketServer } from 'ws';
import { createServer } from 'node:http';

// Routes
import uploadRoutes from './routes/upload.js';
import filesRoutes from './routes/files.js';
import transcribeRoutes from './routes/transcribe.js';
import emailRoutes from './routes/email.js';

// WebSocket handlers
import { setupRealtimeTranscription } from './websocket/realtimeHandler.js';

// Load environment variables
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)){
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Initialize data storage if it doesn't exist
const dbPath = path.join(__dirname, 'db.json');
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify({ files: [] }));
}

const app = express();
const port = process.env.PORT || 3000;

// Create HTTP server
const server = createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ 
  server,
  path: '/ws/realtime'
});

/**
 * MIME type mapping for audio files
 * This ensures proper Content-Type headers are set when serving audio files
 */
const mimeTypes = {
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.flac': 'audio/flac',
  '.m4a': 'audio/mp4',
};

// Middleware
app.use(cors());
app.use(express.json());

/**
 * Custom middleware for serving static audio files
 * - Sets proper MIME types based on file extension
 * - Adds necessary CORS and caching headers
 * - Enables cross-origin resource sharing for audio playback
 */
app.use('/uploads', (req, res, next) => {
  const ext = path.extname(req.path).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  
  // Set headers for audio files
  res.set({
    'Accept-Ranges': 'bytes',
    'Content-Type': contentType,
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Cross-Origin-Resource-Policy': 'cross-origin',
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Opener-Policy': 'same-origin'
  });
  
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Set up routes
app.use('/api', uploadRoutes);
app.use('/api', filesRoutes);
app.use('/api', transcribeRoutes);
app.use('/api', emailRoutes);

// Setup WebSocket handlers
setupRealtimeTranscription(wss);

/**
 * Global error handling middleware
 * Catches all unhandled errors and sends appropriate response
 */
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
});

// Start the server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`API URL: http://localhost:${port}/api`);
  console.log(`WebSocket URL: ws://localhost:${port}/ws/realtime`);
});

export default app;