import express from 'express';
import { getDb, saveDb } from '../utils/db.js';
import { processAudioForWhisper } from '../utils/whisperProcessor.js';

const router = express.Router();

// Start transcription for a file
router.post('/transcribe/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const { model = 'base', language = 'pt-BR' } = req.body;
    const db = getDb();
    
    const fileIndex = db.files.findIndex(f => f.id === fileId);
    
    if (fileIndex === -1) {
      return res.status(404).json({ message: 'Arquivo não encontrado' });
    }
    
    const file = db.files[fileIndex];
    
    if (file.status !== 'uploaded') {
      return res.status(400).json({ 
        message: 'Arquivo não pode ser transcrito no estado atual' 
      });
    }
    
    // Update status to processing
    db.files[fileIndex].status = 'processing';
    db.files[fileIndex].cliOutput = `Iniciando transcrição com modelo ${model.toUpperCase()} em ${language}...`;
    db.files[fileIndex].selectedModel = model;
    db.files[fileIndex].selectedLanguage = language;
    saveDb(db);
    
    res.status(200).json({ 
      message: 'Transcrição iniciada',
      fileId: fileId,
      model: model,
      language: language
    });
    
    // Start transcription process in background
    processTranscription(fileId, file.path, model, language);
    
  } catch (error) {
    console.error('Error starting transcription:', error);
    res.status(500).json({
      message: 'Erro ao iniciar transcrição',
      error: error.message,
    });
  }
});

// Background transcription processing
async function processTranscription(fileId, filePath, modelName, languageCode) {
  try {
    const db = getDb();
    const fileIndex = db.files.findIndex(f => f.id === fileId);
    
    if (fileIndex === -1) return;
    
    // Update CLI output with model loading info
    db.files[fileIndex].cliOutput = `Carregando modelo Whisper ${modelName.toUpperCase()}...`;
    saveDb(db);
    
    // Process the audio file with specified model and language
    const transcription = await processAudioForWhisper(filePath, modelName, languageCode);
    
    // Update with success
    db.files[fileIndex].status = 'transcribed';
    db.files[fileIndex].transcription = transcription;
    db.files[fileIndex].cliOutput = `Transcrição concluída com sucesso usando modelo ${modelName.toUpperCase()} em ${languageCode}!`;
    saveDb(db);
    
  } catch (error) {
    console.error('Transcription error:', error);
    
    // Update with error
    const db = getDb();
    const fileIndex = db.files.findIndex(f => f.id === fileId);
    
    if (fileIndex !== -1) {
      db.files[fileIndex].status = 'error';
      db.files[fileIndex].error = error.message;
      db.files[fileIndex].cliOutput = `Erro na transcrição com modelo ${db.files[fileIndex].selectedModel || 'base'}: ${error.message}`;
      saveDb(db);
    }
  }
}

export default router;