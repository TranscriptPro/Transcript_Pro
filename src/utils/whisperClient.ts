/**
 * Client-side Whisper transcription using @xenova/transformers
 * Handles model loading, initialization, and transcription operations
 */

import { pipeline, Pipeline } from '@xenova/transformers';

// Global variable to store the loaded pipeline
let whisperPipeline: Pipeline | null = null;
let isModelLoading = false;

/**
 * Model configuration options
 */
export interface WhisperConfig {
  model: string;
  language?: string;
  task?: 'transcribe' | 'translate';
  chunk_length_s?: number;
  stride_length_s?: number;
}

/**
 * Default configuration for Whisper model
 */
const DEFAULT_CONFIG: WhisperConfig = {
  model: 'Xenova/whisper-tiny',  // Start with tiny model for faster loading
  language: 'portuguese',        // Default to Portuguese
  task: 'transcribe',
  chunk_length_s: 30,           // Process in 30-second chunks
  stride_length_s: 5,           // 5-second overlap between chunks
};

/**
 * Available Whisper model sizes with their trade-offs
 */
export const WHISPER_MODELS = {
  'tiny': {
    name: 'Xenova/whisper-tiny',
    size: '~39 MB',
    speed: 'Fastest',
    accuracy: 'Basic',
    description: 'Fastest model, good for testing and quick transcriptions'
  },
  'base': {
    name: 'Xenova/whisper-base',
    size: '~74 MB',
    speed: 'Fast',
    accuracy: 'Good',
    description: 'Balanced speed and accuracy for most use cases'
  },
  'small': {
    name: 'Xenova/whisper-small',
    size: '~244 MB',
    speed: 'Medium',
    accuracy: 'Better',
    description: 'Better accuracy, suitable for important transcriptions'
  },
  'medium': {
    name: 'Xenova/whisper-medium',
    size: '~769 MB',
    speed: 'Slow',
    accuracy: 'High',
    description: 'High accuracy, requires more time and memory'
  }
} as const;

/**
 * Progress callback type for model loading and transcription
 */
export type ProgressCallback = (progress: {
  status: string;
  progress?: number;
  timeRemaining?: number;
}) => void;

/**
 * Transcription result interface
 */
export interface TranscriptionResult {
  text: string;
  chunks?: Array<{
    text: string;
    timestamp: [number, number];
  }>;
}

/**
 * Initializes the Whisper model pipeline
 * @param config - Configuration options for the model
 * @param onProgress - Progress callback for loading updates
 * @returns Promise<Pipeline> - The loaded pipeline
 */
export async function initializeWhisper(
  config: Partial<WhisperConfig> = {},
  onProgress?: ProgressCallback
): Promise<Pipeline> {
  // If model is already loaded, return it
  if (whisperPipeline) {
    return whisperPipeline;
  }
  
  // If model is currently loading, wait for it
  if (isModelLoading) {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (whisperPipeline) {
          clearInterval(checkInterval);
          resolve(whisperPipeline);
        } else if (!isModelLoading) {
          clearInterval(checkInterval);
          reject(new Error('Model loading failed'));
        }
      }, 100);
    });
  }
  
  try {
    isModelLoading = true;
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    
    onProgress?.({
      status: 'Downloading model...',
      progress: 0
    });
    
    // Create the automatic speech recognition pipeline
    whisperPipeline = await pipeline('automatic-speech-recognition', finalConfig.model, {
      progress_callback: (progress: any) => {
        if (progress.status === 'downloading') {
          const progressPercent = Math.round((progress.loaded / progress.total) * 100);
          onProgress?.({
            status: `Downloading model... ${progressPercent}%`,
            progress: progressPercent
          });
        } else if (progress.status === 'loading') {
          onProgress?.({
            status: 'Loading model into memory...',
            progress: 95
          });
        }
      }
    });
    
    onProgress?.({
      status: 'Model ready!',
      progress: 100
    });
    
    return whisperPipeline;
  } catch (error) {
    whisperPipeline = null;
    throw new Error(`Failed to initialize Whisper model: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    isModelLoading = false;
  }
}

/**
 * Transcribes audio data using the loaded Whisper model
 * @param audioData - Float32Array of audio samples (16kHz, mono)
 * @param config - Configuration options for transcription
 * @param onProgress - Progress callback for transcription updates
 * @returns Promise<TranscriptionResult> - The transcription result
 */
export async function transcribeAudio(
  audioData: Float32Array,
  config: Partial<WhisperConfig> = {},
  onProgress?: ProgressCallback
): Promise<TranscriptionResult> {
  try {
    // Ensure the model is loaded
    if (!whisperPipeline) {
      await initializeWhisper(config, onProgress);
    }
    
    if (!whisperPipeline) {
      throw new Error('Whisper model not initialized');
    }
    
    onProgress?.({
      status: 'Transcribing audio...',
      progress: 0
    });
    
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    
    // Perform transcription
    const result = await whisperPipeline(audioData, {
      language: finalConfig.language,
      task: finalConfig.task,
      chunk_length_s: finalConfig.chunk_length_s,
      stride_length_s: finalConfig.stride_length_s,
      return_timestamps: true,
    });
    
    onProgress?.({
      status: 'Transcription complete!',
      progress: 100
    });
    
    // Format the result
    return {
      text: result.text,
      chunks: result.chunks?.map((chunk: any) => ({
        text: chunk.text,
        timestamp: chunk.timestamp
      }))
    };
  } catch (error) {
    throw new Error(`Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Checks if the Whisper model is currently loaded
 * @returns boolean - True if model is loaded and ready
 */
export function isModelLoaded(): boolean {
  return whisperPipeline !== null;
}

/**
 * Checks if the model is currently loading
 * @returns boolean - True if model is being loaded
 */
export function isModelLoadingState(): boolean {
  return isModelLoading;
}

/**
 * Unloads the current model to free up memory
 */
export function unloadModel(): void {
  whisperPipeline = null;
  isModelLoading = false;
}

/**
 * Gets information about available models
 * @returns Object containing model information
 */
export function getAvailableModels() {
  return WHISPER_MODELS;
}

/**
 * Estimates the memory usage for a given model
 * @param modelSize - The model size key
 * @returns string - Estimated memory usage
 */
export function getModelMemoryUsage(modelSize: keyof typeof WHISPER_MODELS): string {
  return WHISPER_MODELS[modelSize].size;
}