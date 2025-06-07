/**
 * Audio processing utilities for client-side transcription
 * Handles audio file decoding, resampling, and format conversion for Whisper model
 */

/**
 * Decodes an audio file into an AudioBuffer
 * @param file - The audio file to decode
 * @returns Promise<AudioBuffer> - The decoded audio buffer
 */
export async function decodeAudioFile(file: File): Promise<AudioBuffer> {
  const arrayBuffer = await file.arrayBuffer();
  const audioContext = new AudioContext();
  
  try {
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    return audioBuffer;
  } catch (error) {
    throw new Error(`Failed to decode audio file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    // Clean up the audio context
    await audioContext.close();
  }
}

/**
 * Resamples audio buffer to the target sample rate (16kHz for Whisper)
 * @param audioBuffer - The original audio buffer
 * @param targetSampleRate - Target sample rate (default: 16000 Hz)
 * @returns Float32Array - Resampled audio data
 */
export function resampleAudio(audioBuffer: AudioBuffer, targetSampleRate: number = 16000): Float32Array {
  const originalSampleRate = audioBuffer.sampleRate;
  const originalLength = audioBuffer.length;
  
  // If already at target sample rate, just return the first channel
  if (originalSampleRate === targetSampleRate) {
    return audioBuffer.getChannelData(0);
  }
  
  // Calculate the new length after resampling
  const newLength = Math.round(originalLength * targetSampleRate / originalSampleRate);
  const resampledData = new Float32Array(newLength);
  
  // Get the first channel data (mono)
  const channelData = audioBuffer.getChannelData(0);
  
  // Simple linear interpolation resampling
  const ratio = originalLength / newLength;
  
  for (let i = 0; i < newLength; i++) {
    const originalIndex = i * ratio;
    const index = Math.floor(originalIndex);
    const fraction = originalIndex - index;
    
    if (index + 1 < originalLength) {
      // Linear interpolation between two samples
      resampledData[i] = channelData[index] * (1 - fraction) + channelData[index + 1] * fraction;
    } else {
      // Use the last sample if we're at the end
      resampledData[i] = channelData[index] || 0;
    }
  }
  
  return resampledData;
}

/**
 * Converts audio file to the format expected by Whisper model
 * @param file - The audio file to process
 * @returns Promise<Float32Array> - Processed audio data ready for transcription
 */
export async function processAudioForWhisper(file: File): Promise<Float32Array> {
  try {
    // Decode the audio file
    const audioBuffer = await decodeAudioFile(file);
    
    // Resample to 16kHz (Whisper's expected sample rate)
    const resampledAudio = resampleAudio(audioBuffer, 16000);
    
    return resampledAudio;
  } catch (error) {
    throw new Error(`Failed to process audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Gets the duration of an audio file in seconds
 * @param file - The audio file
 * @returns Promise<number> - Duration in seconds
 */
export async function getAudioDuration(file: File): Promise<number> {
  try {
    const audioBuffer = await decodeAudioFile(file);
    return audioBuffer.duration;
  } catch (error) {
    throw new Error(`Failed to get audio duration: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validates if a file is a supported audio format
 * @param file - The file to validate
 * @returns boolean - True if the file is a supported audio format
 */
export function isValidAudioFile(file: File): boolean {
  const supportedTypes = [
    'audio/mpeg',     // mp3
    'audio/wav',      // wav
    'audio/flac',     // flac
    'audio/mp4',      // m4a
    'audio/x-m4a',    // m4a alternative
    'audio/ogg',      // ogg
    'audio/webm',     // webm
  ];
  
  return supportedTypes.includes(file.type);
}

/**
 * Formats file size in human-readable format
 * @param bytes - Size in bytes
 * @returns string - Formatted size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}