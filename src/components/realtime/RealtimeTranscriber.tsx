import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Settings, Volume2, VolumeX, Wifi, WifiOff } from 'lucide-react';
import { cn } from '../../lib/utils';

interface TranscriptionResult {
  text: string;
  timestamp: number;
  isFinal: boolean;
}

interface RealtimeTranscriberProps {
  className?: string;
}

const RealtimeTranscriber: React.FC<RealtimeTranscriberProps> = ({ className }) => {
  // State management
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [transcriptionResults, setTranscriptionResults] = useState<TranscriptionResult[]>([]);
  const [currentTranscription, setCurrentTranscription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [language, setLanguage] = useState('pt-BR');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>();
  
  /**
   * Initialize WebSocket connection
   */
  const connectWebSocket = useCallback(() => {
    try {
      const wsUrl = `ws://localhost:3001/ws/realtime`;
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        setIsRecording(false);
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Erro de conexão com o servidor');
        setIsConnected(false);
      };
      
      wsRef.current = ws;
    } catch (error) {
      console.error('Error connecting WebSocket:', error);
      setError('Falha ao conectar com o servidor');
    }
  }, []);
  
  /**
   * Handle WebSocket messages
   */
  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'connection':
        console.log('Connection established:', data.message);
        break;
        
      case 'transcription_started':
        console.log('Transcription started:', data.message);
        setCurrentTranscription('');
        break;
        
      case 'transcription_stopped':
        console.log('Transcription stopped:', data.message);
        break;
        
      case 'processing':
        setIsProcessing(true);
        break;
        
      case 'transcription':
        setIsProcessing(false);
        const newResult: TranscriptionResult = {
          text: data.text,
          timestamp: data.timestamp,
          isFinal: data.isFinal
        };
        
        if (data.isFinal) {
          setTranscriptionResults(prev => [...prev, newResult]);
          setCurrentTranscription('');
        } else {
          setCurrentTranscription(data.text);
        }
        break;
        
      case 'error':
        setError(data.message);
        setIsProcessing(false);
        break;
        
      default:
        console.log('Unknown message type:', data.type);
    }
  };
  
  /**
   * Start audio recording
   */
  const startRecording = async () => {
    try {
      setError(null);
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      
      streamRef.current = stream;
      
      // Setup audio context for visualization
      const audioContext = new AudioContext({ sampleRate: 16000 });
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      // Setup MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 16000,
      });
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
          // Send audio data to server
          wsRef.current.send(event.data);
        }
      };
      
      mediaRecorder.start(250); // Send data every 250ms
      mediaRecorderRef.current = mediaRecorder;
      
      // Start transcription on server
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'start_transcription',
          language: language
        }));
      }
      
      setIsRecording(true);
      startAudioVisualization();
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Erro ao acessar o microfone. Verifique as permissões.');
    }
  };
  
  /**
   * Stop audio recording
   */
  const stopRecording = () => {
    // Stop MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    // Stop audio stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    // Stop transcription on server
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'stop_transcription'
      }));
    }
    
    // Stop visualization
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    setIsRecording(false);
    setAudioLevel(0);
    setIsProcessing(false);
  };
  
  /**
   * Start audio level visualization
   */
  const startAudioVisualization = () => {
    const updateAudioLevel = () => {
      if (analyserRef.current) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Calculate average audio level
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        setAudioLevel(average / 255); // Normalize to 0-1
      }
      
      if (isRecording) {
        animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
      }
    };
    
    updateAudioLevel();
  };
  
  /**
   * Clear transcription results
   */
  const clearResults = () => {
    setTranscriptionResults([]);
    setCurrentTranscription('');
  };
  
  /**
   * Copy all transcriptions to clipboard
   */
  const copyToClipboard = () => {
    const allText = transcriptionResults.map(result => result.text).join(' ');
    navigator.clipboard.writeText(allText);
  };
  
  // Initialize WebSocket connection on mount
  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      stopRecording();
    };
  }, [connectWebSocket]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);
  
  return (
    <div className={cn("bg-white rounded-lg border border-gray-200 p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={cn(
            "p-2 rounded-full",
            isConnected ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
          )}>
            {isConnected ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Transcrição em Tempo Real</h2>
            <p className="text-sm text-gray-500">
              {isConnected ? 'Conectado ao servidor' : 'Desconectado'}
            </p>
          </div>
        </div>
        
        {/* Language selector */}
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          disabled={isRecording}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <option value="pt-BR">Português (Brasil)</option>
          <option value="en-US">English (US)</option>
          <option value="es-ES">Español</option>
        </select>
      </div>
      
      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
      
      {/* Recording controls */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={!isConnected}
          className={cn(
            "p-4 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
            isRecording 
              ? "bg-red-500 hover:bg-red-600 text-white shadow-lg scale-110" 
              : "bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg"
          )}
        >
          {isRecording ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
        </button>
        
        {/* Audio level indicator */}
        {isRecording && (
          <div className="flex items-center space-x-2">
            <Volume2 className="h-4 w-4 text-gray-500" />
            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-100"
                style={{ width: `${audioLevel * 100}%` }}
              />
            </div>
          </div>
        )}
        
        {/* Processing indicator */}
        {isProcessing && (
          <div className="flex items-center space-x-2 text-blue-600">
            <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
            <span className="text-sm">Processando...</span>
          </div>
        )}
      </div>
      
      {/* Current transcription */}
      {currentTranscription && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-blue-800 italic">{currentTranscription}</p>
        </div>
      )}
      
      {/* Transcription results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-800">Resultados</h3>
          {transcriptionResults.length > 0 && (
            <div className="flex space-x-2">
              <button
                onClick={copyToClipboard}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
              >
                Copiar Tudo
              </button>
              <button
                onClick={clearResults}
                className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors"
              >
                Limpar
              </button>
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 min-h-32 max-h-64 overflow-y-auto">
          {transcriptionResults.length === 0 ? (
            <p className="text-gray-500 text-center">
              {isRecording ? 'Aguardando transcrição...' : 'Clique no microfone para começar a gravar'}
            </p>
          ) : (
            <div className="space-y-2">
              {transcriptionResults.map((result, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <span className="text-xs text-gray-400 mt-1 w-16 flex-shrink-0">
                    {new Date(result.timestamp).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </span>
                  <p className="text-gray-800 flex-grow">{result.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Instructions */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600">
          <strong>Instruções:</strong> Clique no microfone para iniciar a gravação. 
          O áudio será processado em tempo real e a transcrição aparecerá abaixo. 
          Certifique-se de que o microfone esteja funcionando e as permissões estejam habilitadas.
        </p>
      </div>
    </div>
  );
};

export default RealtimeTranscriber;