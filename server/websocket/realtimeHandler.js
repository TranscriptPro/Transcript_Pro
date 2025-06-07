import { processAudioChunk, getServiceStatus } from '../utils/realtimeWhisper.js';

/**
 * WebSocket connection management for real-time transcription
 */
const activeConnections = new Map();

/**
 * Setup WebSocket server for real-time transcription
 * @param {WebSocketServer} wss - WebSocket server instance
 */
export function setupRealtimeTranscription(wss) {
  wss.on('connection', (ws, req) => {
    const connectionId = generateConnectionId();
    console.log(`New WebSocket connection: ${connectionId}`);
    
    // Store connection with metadata
    activeConnections.set(connectionId, {
      ws,
      audioBuffer: [],
      isTranscribing: false,
      language: 'pt-BR',
      lastActivity: Date.now(),
      totalAudioReceived: 0
    });
    
    // Send connection confirmation with service status
    const serviceStatus = getServiceStatus();
    ws.send(JSON.stringify({
      type: 'connection',
      status: 'connected',
      connectionId,
      serviceStatus,
      message: 'Conectado ao servidor de transcrição em tempo real'
    }));
    
    // Handle incoming messages
    ws.on('message', async (data) => {
      try {
        await handleWebSocketMessage(connectionId, data);
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Erro ao processar mensagem',
          error: error.message
        }));
      }
    });
    
    // Handle connection close
    ws.on('close', () => {
      console.log(`WebSocket connection closed: ${connectionId}`);
      activeConnections.delete(connectionId);
    });
    
    // Handle connection errors
    ws.on('error', (error) => {
      console.error(`WebSocket error for ${connectionId}:`, error);
      activeConnections.delete(connectionId);
    });
  });
  
  // Cleanup inactive connections periodically
  setInterval(cleanupInactiveConnections, 30000); // Every 30 seconds
  
  console.log('Real-time transcription WebSocket server initialized');
}

/**
 * Handle incoming WebSocket messages
 * @param {string} connectionId - Connection identifier
 * @param {Buffer} data - Raw message data
 */
async function handleWebSocketMessage(connectionId, data) {
  const connection = activeConnections.get(connectionId);
  if (!connection) return;
  
  const { ws } = connection;
  
  try {
    // Try to parse as JSON first (for control messages)
    const message = JSON.parse(data.toString());
    
    switch (message.type) {
      case 'start_transcription':
        await handleStartTranscription(connectionId, message);
        break;
        
      case 'stop_transcription':
        await handleStopTranscription(connectionId);
        break;
        
      case 'config':
        await handleConfigUpdate(connectionId, message);
        break;
        
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        break;
        
      default:
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Tipo de mensagem não reconhecido'
        }));
    }
  } catch (jsonError) {
    // If not JSON, treat as binary audio data
    await handleAudioData(connectionId, data);
  }
}

/**
 * Handle start transcription command
 * @param {string} connectionId - Connection identifier
 * @param {Object} message - Start message
 */
async function handleStartTranscription(connectionId, message) {
  const connection = activeConnections.get(connectionId);
  if (!connection) return;
  
  const { ws } = connection;
  
  connection.isTranscribing = true;
  connection.language = message.language || 'pt-BR';
  connection.audioBuffer = [];
  connection.lastActivity = Date.now();
  connection.totalAudioReceived = 0;
  
  console.log(`Started transcription for ${connectionId} in language: ${connection.language}`);
  
  ws.send(JSON.stringify({
    type: 'transcription_started',
    message: 'Transcrição em tempo real iniciada',
    language: connection.language,
    timestamp: Date.now()
  }));
}

/**
 * Handle stop transcription command
 * @param {string} connectionId - Connection identifier
 */
async function handleStopTranscription(connectionId) {
  const connection = activeConnections.get(connectionId);
  if (!connection) return;
  
  const { ws } = connection;
  
  const totalAudio = connection.totalAudioReceived;
  connection.isTranscribing = false;
  connection.audioBuffer = [];
  
  console.log(`Stopped transcription for ${connectionId}. Total audio received: ${totalAudio} bytes`);
  
  ws.send(JSON.stringify({
    type: 'transcription_stopped',
    message: 'Transcrição em tempo real parada',
    stats: {
      totalAudioReceived: totalAudio,
      duration: Date.now() - connection.lastActivity
    }
  }));
}

/**
 * Handle configuration updates
 * @param {string} connectionId - Connection identifier
 * @param {Object} message - Config message
 */
async function handleConfigUpdate(connectionId, message) {
  const connection = activeConnections.get(connectionId);
  if (!connection) return;
  
  const { ws } = connection;
  
  if (message.language) {
    connection.language = message.language;
    console.log(`Updated language for ${connectionId} to: ${connection.language}`);
  }
  
  ws.send(JSON.stringify({
    type: 'config_updated',
    message: 'Configuração atualizada',
    config: {
      language: connection.language
    }
  }));
}

/**
 * Handle incoming audio data
 * @param {string} connectionId - Connection identifier
 * @param {Buffer} audioData - Raw audio data
 */
async function handleAudioData(connectionId, audioData) {
  const connection = activeConnections.get(connectionId);
  if (!connection || !connection.isTranscribing) return;
  
  const { ws } = connection;
  
  try {
    connection.lastActivity = Date.now();
    connection.totalAudioReceived += audioData.length;
    
    // Add audio data to buffer
    connection.audioBuffer.push(audioData);
    
    // Process audio when we have enough data (approximately 1 second worth)
    const totalBufferSize = connection.audioBuffer.reduce((sum, chunk) => sum + chunk.length, 0);
    
    // Process every ~32KB (roughly 1 second of 16kHz 16-bit mono audio)
    if (totalBufferSize >= 32000) {
      const audioChunk = Buffer.concat(connection.audioBuffer);
      connection.audioBuffer = [];
      
      // Send processing status
      ws.send(JSON.stringify({
        type: 'processing',
        message: 'Processando áudio...',
        audioSize: audioChunk.length
      }));
      
      // Process the audio chunk
      const transcription = await processAudioChunk(audioChunk, connection.language);
      
      if (transcription && transcription.trim()) {
        ws.send(JSON.stringify({
          type: 'transcription',
          text: transcription,
          timestamp: Date.now(),
          isFinal: false,
          language: connection.language
        }));
        
        console.log(`Transcription for ${connectionId}: ${transcription.substring(0, 50)}...`);
      }
    }
  } catch (error) {
    console.error('Error processing audio data:', error);
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Erro ao processar áudio',
      error: error.message
    }));
  }
}

/**
 * Generate unique connection ID
 * @returns {string} - Unique connection identifier
 */
function generateConnectionId() {
  return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Cleanup inactive connections
 */
function cleanupInactiveConnections() {
  const now = Date.now();
  const timeout = 5 * 60 * 1000; // 5 minutes
  
  for (const [connectionId, connection] of activeConnections.entries()) {
    if (now - connection.lastActivity > timeout) {
      console.log(`Cleaning up inactive connection: ${connectionId}`);
      try {
        connection.ws.close();
      } catch (error) {
        console.error('Error closing inactive connection:', error);
      }
      activeConnections.delete(connectionId);
    }
  }
  
  if (activeConnections.size > 0) {
    console.log(`Active connections: ${activeConnections.size}`);
  }
}

/**
 * Get active connections count
 * @returns {number} - Number of active connections
 */
export function getActiveConnectionsCount() {
  return activeConnections.size;
}

/**
 * Get connection statistics
 * @returns {Object} - Connection statistics
 */
export function getConnectionStats() {
  const connections = Array.from(activeConnections.values());
  return {
    total: connections.length,
    transcribing: connections.filter(c => c.isTranscribing).length,
    languages: [...new Set(connections.map(c => c.language))],
    totalAudioReceived: connections.reduce((sum, c) => sum + c.totalAudioReceived, 0)
  };
}