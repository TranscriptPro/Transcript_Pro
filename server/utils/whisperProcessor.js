/**
 * Real Whisper Model processor using Xenova/transformers
 * Supports multiple model sizes and languages for optimal transcription accuracy
 */

import { pipeline } from '@xenova/transformers';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import fs from 'node:fs';
import path from 'node:path';

// Configure FFmpeg to use the static binary
ffmpeg.setFfmpegPath(ffmpegStatic);

// Global variables for model management
let whisperPipeline = null;
let isModelLoading = false;
let currentLoadedModel = null;

/**
 * Available Whisper models with their characteristics
 */
export const WHISPER_MODELS = {
  'tiny': {
    name: 'Xenova/whisper-tiny',
    size: '39MB',
    speed: 'Fastest',
    accuracy: 'Basic',
    description: 'Fastest model, good for testing and quick transcriptions'
  },
  'base': {
    name: 'Xenova/whisper-base',
    size: '74MB',
    speed: 'Fast',
    accuracy: 'Good',
    description: 'Balanced speed and accuracy for most use cases'
  },
  'small': {
    name: 'Xenova/whisper-small',
    size: '244MB',
    speed: 'Medium',
    accuracy: 'Better',
    description: 'Better accuracy, suitable for important transcriptions'
  },
  'medium': {
    name: 'Xenova/whisper-medium',
    size: '769MB',
    speed: 'Slow',
    accuracy: 'High',
    description: 'High accuracy, requires more time and memory'
  }
};

/**
 * Language mapping from common codes to Whisper expected names
 * Simplified to only Portuguese and English
 */
export const LANGUAGE_MAPPING = {
  'pt-BR': 'portuguese',
  'pt': 'portuguese',
  'en-US': 'english',
  'en': 'english',
  'auto': null // Let Whisper auto-detect
};

/**
 * Initialize Whisper model pipeline with specified model
 * @param {string} modelName - Model name (tiny, base, small, medium)
 * @returns {Promise<Object>} - Loaded pipeline
 */
async function initializeWhisperModel(modelName = 'base') {
  // If the same model is already loaded, return it
  if (whisperPipeline && currentLoadedModel === modelName) {
    return whisperPipeline;
  }
  
  // If a different model is loaded, unload it first
  if (whisperPipeline && currentLoadedModel !== modelName) {
    console.log(`Switching from ${currentLoadedModel} to ${modelName} model...`);
    whisperPipeline = null;
    currentLoadedModel = null;
  }
  
  if (isModelLoading) {
    // Wait for model to finish loading
    while (isModelLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return whisperPipeline;
  }
  
  try {
    isModelLoading = true;
    
    const modelConfig = WHISPER_MODELS[modelName];
    if (!modelConfig) {
      throw new Error(`Unknown model: ${modelName}. Available models: ${Object.keys(WHISPER_MODELS).join(', ')}`);
    }
    
    console.log(`Loading Whisper ${modelName} model (${modelConfig.size})...`);
    
    // Create automatic speech recognition pipeline
    whisperPipeline = await pipeline(
      'automatic-speech-recognition',
      modelConfig.name,
      {
        // Configure for optimal performance
        quantized: true, // Use quantized model for faster inference
        progress_callback: (progress) => {
          if (progress.status === 'downloading') {
            const percent = Math.round((progress.loaded / progress.total) * 100);
            console.log(`Downloading Whisper ${modelName} model: ${percent}%`);
          }
        }
      }
    );
    
    currentLoadedModel = modelName;
    console.log(`Whisper ${modelName} model loaded successfully`);
    return whisperPipeline;
  } catch (error) {
    console.error(`Error loading Whisper ${modelName} model:`, error);
    whisperPipeline = null;
    currentLoadedModel = null;
    throw error;
  } finally {
    isModelLoading = false;
  }
}

/**
 * Convert audio file to Float32Array format expected by Whisper
 * @param {string} filePath - Path to the audio file
 * @returns {Promise<Float32Array>} - Audio data ready for transcription
 */
async function convertAudioToFloat32Array(filePath) {
  return new Promise((resolve, reject) => {
    const audioData = [];
    
    ffmpeg(filePath)
      .audioFrequency(16000)  // Whisper expects 16kHz sample rate
      .audioChannels(1)       // Convert to mono
      .audioCodec('pcm_f32le') // 32-bit float, little-endian
      .format('f32le')        // Raw 32-bit float format
      .on('error', (err) => {
        console.error('FFmpeg error:', err);
        reject(new Error(`Audio conversion failed: ${err.message}`));
      })
      .on('end', () => {
        try {
          // Combine all audio chunks into a single buffer
          const buffer = Buffer.concat(audioData);
          
          // Convert buffer to Float32Array
          const float32Array = new Float32Array(buffer.length / 4);
          for (let i = 0; i < float32Array.length; i++) {
            float32Array[i] = buffer.readFloatLE(i * 4);
          }
          
          console.log(`Audio converted: ${float32Array.length} samples at 16kHz`);
          resolve(float32Array);
        } catch (error) {
          reject(new Error(`Failed to process audio buffer: ${error.message}`));
        }
      })
      .pipe()
      .on('data', (chunk) => {
        audioData.push(chunk);
      });
  });
}

/**
 * Process audio file and return transcription using specified Whisper model and language
 * @param {string} filePath - Path to the audio file
 * @param {string} modelName - Model to use (tiny, base, small, medium)
 * @param {string} languageCode - Language code (pt-BR, en-US, auto)
 * @returns {Promise<string>} - Transcribed text
 */
export async function processAudioForWhisper(filePath, modelName = 'base', languageCode = 'pt-BR') {
  try {
    // Validate file exists
    if (!fs.existsSync(filePath)) {
      throw new Error('Audio file not found');
    }
    
    // Get file information
    const fileName = path.basename(filePath);
    const fileStats = fs.statSync(filePath);
    const fileSizeKB = Math.round(fileStats.size / 1024);
    
    console.log(`Processing audio file: ${fileName} (${fileSizeKB}KB) with ${modelName} model, language: ${languageCode}`);
    
    // Initialize Whisper model
    await initializeWhisperModel(modelName);
    
    // Convert audio to format expected by Whisper
    console.log('Converting audio format...');
    const audioData = await convertAudioToFloat32Array(filePath);
    
    // Map language code to Whisper expected format
    const whisperLanguage = LANGUAGE_MAPPING[languageCode] || LANGUAGE_MAPPING['pt-BR'];
    
    // Perform transcription
    console.log(`Starting transcription with Whisper ${modelName} model...`);
    const startTime = Date.now();
    
    const transcriptionOptions = {
      task: 'transcribe',
      chunk_length_s: 30,     // Process in 30-second chunks
      stride_length_s: 5,     // 5-second overlap between chunks
      return_timestamps: false // We just want the text for now
    };
    
    // Add language if specified (null means auto-detect)
    if (whisperLanguage) {
      transcriptionOptions.language = whisperLanguage;
    }
    
    const result = await whisperPipeline(audioData, transcriptionOptions);
    
    const processingTime = Date.now() - startTime;
    console.log(`Transcription completed in ${processingTime}ms`);
    
    // Extract and return the transcribed text
    const transcription = result.text || '';
    
    if (!transcription.trim()) {
      console.warn('Transcription result is empty - audio may be silent or unclear');
      return 'No speech detected in the audio file. Please ensure the audio contains clear speech and try again.';
    }
    
    console.log(`Transcription successful: ${transcription.length} characters`);
    return transcription;
    
  } catch (error) {
    console.error('Error processing audio with Whisper:', error);
    
    // Provide specific error messages based on error type
    if (error.message.includes('Audio conversion failed')) {
      throw new Error('Failed to process audio file. Please ensure the file is a valid audio format.');
    } else if (error.message.includes('Audio file not found')) {
      throw new Error('Audio file not found. Please try uploading the file again.');
    } else if (error.message.includes('model')) {
      throw new Error('Failed to load transcription model. Please try again later.');
    } else {
      throw new Error(`Transcription failed: ${error.message}`);
    }
  }
}

/**
 * Get available models information
 * @returns {Object} Available models with their characteristics
 */
export function getAvailableModels() {
  return WHISPER_MODELS;
}

/**
 * Get available languages (simplified to Portuguese and English only)
 * @returns {Object} Available language codes and their mappings
 */
export function getAvailableLanguages() {
  return {
    'pt-BR': 'Português (Brasil)',
    'en-US': 'English (US)',
    'auto': 'Auto-detect'
  };
}

/**
 * Get Whisper model status and information
 * @returns {Object} Service status information
 */
export function getProcessingStatus() {
  return {
    isLoading: isModelLoading,
    isReady: whisperPipeline !== null,
    currentModel: currentLoadedModel,
    availableModels: Object.keys(WHISPER_MODELS),
    type: 'real', // Indicates this is a real service
    supportedFormats: ['mp3', 'wav', 'flac', 'm4a'],
    supportedLanguages: Object.keys(LANGUAGE_MAPPING),
    features: [
      'Real speech-to-text transcription',
      'Multiple model sizes for speed/accuracy trade-off',
      'Portuguese and English language support',
      'Automatic language detection',
      'High accuracy for clear audio',
      'Automatic punctuation',
      'Noise handling'
    ]
  };
}

/**
 * Cleanup function to free memory
 */
export function cleanup() {
  if (whisperPipeline) {
    whisperPipeline = null;
    console.log(`Whisper ${currentLoadedModel} model unloaded`);
  }
  currentLoadedModel = null;
  isModelLoading = false;
}