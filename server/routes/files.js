import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { getDb, saveDb } from '../utils/db.js';

const router = express.Router();

// Get all files
router.get('/files', (req, res) => {
  try {
    const db = getDb();
    
    // Return simplified file data for frontend
    const files = db.files.map(file => ({
      id: file.id,
      name: file.name,
      size: file.size,
      createdAt: file.createdAt,
      status: file.status,
      url: file.url,
      transcription: file.transcription,
      error: file.error,
      cliOutput: file.cliOutput,
    }));
    
    res.status(200).json(files);
  } catch (error) {
    console.error('Error getting files:', error);
    res.status(500).json({
      message: 'Erro ao obter arquivos',
      error: error.message,
    });
  }
});

// Get single file
router.get('/files/:fileId', (req, res) => {
  try {
    const { fileId } = req.params;
    const db = getDb();
    
    const file = db.files.find(f => f.id === fileId);
    
    if (!file) {
      return res.status(404).json({ message: 'Arquivo não encontrado' });
    }
    
    // Return simplified file data for frontend
    const fileData = {
      id: file.id,
      name: file.name,
      size: file.size,
      createdAt: file.createdAt,
      status: file.status,
      url: file.url,
      transcription: file.transcription,
      error: file.error,
      cliOutput: file.cliOutput,
    };
    
    res.status(200).json(fileData);
  } catch (error) {
    console.error('Error getting file:', error);
    res.status(500).json({
      message: 'Erro ao obter arquivo',
      error: error.message,
    });
  }
});

// Delete single file
router.delete('/files/:fileId', (req, res) => {
  try {
    const { fileId } = req.params;
    const db = getDb();
    
    const fileIndex = db.files.findIndex(f => f.id === fileId);
    
    if (fileIndex === -1) {
      return res.status(404).json({ message: 'Arquivo não encontrado' });
    }
    
    const file = db.files[fileIndex];
    
    // Delete physical file
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    
    // Remove from database
    db.files.splice(fileIndex, 1);
    saveDb(db);
    
    res.status(200).json({ message: 'Arquivo excluído com sucesso' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({
      message: 'Erro ao excluir arquivo',
      error: error.message,
    });
  }
});

// Clear all files
router.delete('/files', (req, res) => {
  try {
    const db = getDb();
    
    // Delete all physical files
    for (const file of db.files) {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }
    
    // Clear database
    db.files = [];
    saveDb(db);
    
    res.status(200).json({ message: 'Todos os arquivos foram excluídos' });
  } catch (error) {
    console.error('Error clearing files:', error);
    res.status(500).json({
      message: 'Erro ao limpar arquivos',
      error: error.message,
    });
  }
});

export default router;