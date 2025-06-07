import express from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { v4 as uuidv4 } from 'uuid';
import { getDb, saveDb } from '../utils/db.js';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '..', 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const fileId = uuidv4();
    const ext = path.extname(file.originalname);
    const fileName = `${fileId}${ext}`;
    req.fileId = fileId; // Store the fileId for later use
    cb(null, fileName);
  },
});

// File type filter
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = [
    'audio/mpeg', // mp3
    'audio/wav', // wav
    'audio/flac', // flac
    'audio/mp4', // m4a
    'audio/x-m4a', // m4a alternative MIME type
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não suportado. Por favor, envie um arquivo .mp3, .wav, .flac ou .m4a'), false);
  }
};

// Configure multer with size limits
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// Handle file upload
router.post('/upload', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo foi enviado' });
    }

    const fileId = req.fileId;
    const originalName = req.file.originalname;
    const serverUrl = `http://localhost:${process.env.PORT || 3001}`;
    
    // Add file to database
    const db = getDb();
    const newFile = {
      id: fileId,
      name: originalName,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.file.path,
      url: `${serverUrl}/uploads/${req.file.filename}`,
      status: 'uploaded',
      createdAt: new Date().toISOString(),
    };
    
    db.files.push(newFile);
    saveDb(db);

    res.status(201).json({
      message: 'Arquivo enviado com sucesso',
      file: {
        id: fileId,
        name: originalName,
        size: req.file.size,
        url: `${serverUrl}/uploads/${req.file.filename}`,
      },
    });
  } catch (error) {
    console.error('Error in file upload:', error);
    res.status(500).json({
      message: 'Erro ao enviar arquivo',
      error: error.message,
    });
  }
});

export default router;