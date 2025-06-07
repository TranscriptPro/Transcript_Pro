import React, { useRef, useState, useEffect } from 'react';
import { Volume2, VolumeX, Pause, Play, X } from 'lucide-react';

interface AudioPlayerProps {
  url: string;
  fileName: string;
  onClose: () => void;
}

/**
 * AudioPlayer Component
 * A fully-featured audio player with play/pause, seek, volume controls, and error handling
 * 
 * Features:
 * - Play/Pause control
 * - Time tracking and seeking
 * - Volume control with mute toggle
 * - Loading state handling
 * - Error handling with user feedback
 * - Automatic cleanup of event listeners
 */
const AudioPlayer: React.FC<AudioPlayerProps> = ({ url, fileName, onClose }) => {
  // State management for player controls and status
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Effect hook to handle audio element setup and cleanup
   * Sets up event listeners for audio playback and handles errors
   */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Event handler functions
    const setAudioData = () => {
      setDuration(audio.duration);
      setError(null);
      setIsLoading(false);
    };

    const setAudioTime = () => {
      setCurrentTime(audio.currentTime);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const onError = (e: ErrorEvent) => {
      console.error('Audio error:', e);
      setError('Erro ao carregar o áudio. Por favor, tente novamente.');
      setIsPlaying(false);
      setIsLoading(false);
    };

    const onCanPlayThrough = () => {
      setIsLoading(false);
      setError(null);
    };

    // Attach event listeners
    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError as EventListener);
    audio.addEventListener('canplaythrough', onCanPlayThrough);

    // Load the audio file
    audio.load();

    // Cleanup function to remove event listeners
    return () => {
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError as EventListener);
      audio.removeEventListener('canplaythrough', onCanPlayThrough);
    };
  }, [url]);

  /**
   * Handles play/pause toggle with error handling
   * Uses Promise-based audio.play() for better error handling
   */
  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio || isLoading) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setError(null);
          })
          .catch(err => {
            console.error('Playback error:', err);
            setError('Erro ao reproduzir o áudio. Por favor, tente novamente.');
            setIsPlaying(false);
          });
      }
    }
  };

  // Volume control handlers
  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.muted = !audio.muted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const value = parseFloat(e.target.value);
    audio.volume = value;
    setVolume(value);
    setIsMuted(value === 0);
  };

  // Time control handlers
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const time = parseFloat(e.target.value);
    audio.currentTime = time;
    setCurrentTime(time);
  };

  /**
   * Formats time in seconds to MM:SS format
   */
  const formatTime = (time: number): string => {
    if (isNaN(time)) return '0:00';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 w-full">
      {/* Header with file name and close button */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <Play className="h-5 w-5 text-blue-500 mr-2" />
          <span className="text-sm font-medium text-gray-700 truncate max-w-xs">{fileName}</span>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      {/* Audio element with cross-origin attribute for CORS support */}
      <audio 
        ref={audioRef} 
        src={url} 
        preload="metadata"
        crossOrigin="anonymous"
      />
      
      {/* Conditional rendering based on player state */}
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          <span className="ml-2 text-sm text-gray-600">Carregando áudio...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      ) : (
        <>
          {/* Playback controls and progress bar */}
          <div className="flex items-center space-x-2 mb-2">
            <button
              onClick={togglePlayPause}
              disabled={isLoading}
              className="p-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
            
            <div className="flex-grow">
              <input 
                type="range"
                min={0}
                max={duration || 0}
                value={currentTime}
                step={0.1}
                onChange={handleTimeChange}
                className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer"
                aria-label="Seek"
              />
            </div>
            
            <div className="text-xs text-gray-500 w-20 text-right">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
          
          {/* Volume controls */}
          <div className="flex items-center">
            <button
              onClick={toggleMute}
              className="text-gray-600 hover:text-gray-800"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            
            <div className="ml-2 w-24">
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={handleVolumeChange}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                aria-label="Volume"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AudioPlayer;