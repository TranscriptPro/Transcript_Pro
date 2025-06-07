/**
 * Real-time Whisper Base Model processing for WebContainer environment
 * Simulates Whisper Base model for real-time transcription
 */

let isModelLoading = false;
let modelLoaded = false;

/**
 * Initialize Whisper Base model for real-time processing
 */
async function initializeRealtimeWhisper() {
  if (modelLoaded) {
    return true;
  }
  
  if (isModelLoading) {
    // Wait for model to finish loading
    while (isModelLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return modelLoaded;
  }
  
  try {
    isModelLoading = true;
    console.log('Loading Whisper Base model for real-time transcription...');
    
    // Simulate Base model loading time (faster than larger models)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    modelLoaded = true;
    console.log('Whisper Base model ready for real-time transcription');
    return true;
  } catch (error) {
    console.error('Error loading Whisper Base model:', error);
    throw error;
  } finally {
    isModelLoading = false;
  }
}

/**
 * Process audio chunk for real-time transcription using Base model
 * @param {Buffer} audioChunk - Raw audio data
 * @param {string} language - Language code (e.g., 'pt-BR')
 * @returns {Promise<string>} - Transcribed text
 */
export async function processAudioChunk(audioChunk, language = 'pt-BR') {
  try {
    // Initialize Base model if needed
    await initializeRealtimeWhisper();
    
    // Simulate Base model processing time (faster than larger models)
    // Base model processes chunks in 50-200ms typically
    const processingTime = Math.min(200, Math.max(50, audioChunk.length / 2000));
    await new Promise(resolve => setTimeout(resolve, processingTime));
    
    // Generate realistic mock transcription based on language
    const mockPhrases = {
      'pt-BR': [
        "Olá, como você está hoje?",
        "Este é um teste do modelo Whisper Base.",
        "O sistema está funcionando perfeitamente.",
        "Processando áudio em tempo real.",
        "Transcrição rápida e precisa.",
        "Modelo Base carregado com sucesso.",
        "Reconhecimento de voz ativo.",
        "Qualidade de áudio excelente.",
        "Sistema operacional e responsivo.",
        "Captura de voz em andamento.",
        "Processamento eficiente do áudio.",
        "Transcrição automática funcionando."
      ],
      'en-US': [
        "Hello, how are you today?",
        "This is a Whisper Base model test.",
        "The system is working perfectly.",
        "Processing audio in real-time.",
        "Fast and accurate transcription.",
        "Base model loaded successfully.",
        "Voice recognition is active.",
        "Excellent audio quality detected.",
        "System operational and responsive.",
        "Voice capture in progress.",
        "Efficient audio processing.",
        "Automatic transcription working."
      ],
      'es-ES': [
        "Hola, ¿cómo estás hoy?",
        "Esta es una prueba del modelo Whisper Base.",
        "El sistema está funcionando perfectamente.",
        "Procesando audio en tiempo real.",
        "Transcripción rápida y precisa.",
        "Modelo Base cargado exitosamente.",
        "Reconocimiento de voz activo.",
        "Excelente calidad de audio detectada.",
        "Sistema operacional y responsivo.",
        "Captura de voz en progreso.",
        "Procesamiento eficiente del audio.",
        "Transcripción automática funcionando."
      ]
    };
    
    // Get phrases for the specified language, fallback to Portuguese
    const phrases = mockPhrases[language] || mockPhrases['pt-BR'];
    
    // Simulate realistic behavior - Base model has good accuracy
    // Sometimes return empty (silence) but less frequently than tiny model
    if (Math.random() < 0.2) {
      return ''; // Simulate silence or unclear audio
    }
    
    // Return a random phrase to simulate transcription
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    
    console.log(`[Whisper Base - ${language}] Transcribed: ${randomPhrase}`);
    return randomPhrase;
    
  } catch (error) {
    console.error('Error processing audio chunk with Whisper Base:', error);
    throw new Error(`Erro ao processar áudio: ${error.message}`);
  }
}

/**
 * Get Whisper Base model service status
 * @returns {Object} Service status information
 */
export function getServiceStatus() {
  return {
    isLoading: isModelLoading,
    isReady: modelLoaded,
    model: 'whisper-base',
    modelSize: '74MB',
    type: 'mock', // Indicates this is a mock service
    supportedLanguages: ['pt-BR', 'en-US', 'es-ES'],
    processingSpeed: 'Fast (50-200ms per chunk)',
    accuracy: 'Good quality for general use'
  };
}

/**
 * Cleanup function to free memory
 */
export function cleanup() {
  isModelLoading = false;
  modelLoaded = false;
  console.log('Whisper Base model cleaned up');
}