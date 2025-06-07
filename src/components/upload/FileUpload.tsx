import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { uploadFile } from '../../services/api';
import { cn } from '../../lib/utils';

interface FileUploadProps {
  onFileUploaded: () => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = {
  'audio/mpeg': ['.mp3'],
  'audio/wav': ['.wav'],
  'audio/flac': ['.flac'],
  'audio/mp4': ['.m4a'],
};

const FileUpload: React.FC<FileUploadProps> = ({ onFileUploaded }) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    
    if (file.size > MAX_FILE_SIZE) {
      setUploadStatus('error');
      setErrorMessage('Arquivo muito grande. O tamanho máximo é 10MB.');
      return;
    }
    
    try {
      setIsUploading(true);
      setUploadStatus('idle');
      setUploadProgress(0);
      
      const formData = new FormData();
      formData.append('audio', file);
      
      await uploadFile(formData, (progress) => {
        setUploadProgress(progress);
      });
      
      setUploadStatus('success');
      onFileUploaded();
      
      // Reset after 3 seconds
      setTimeout(() => {
        setUploadStatus('idle');
        setUploadProgress(0);
      }, 3000);
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus('error');
      setErrorMessage('Falha ao enviar o arquivo. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  }, [onFileUploaded]);
  
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: false,
  });
  
  const resetUpload = () => {
    setUploadStatus('idle');
    setErrorMessage('');
    setUploadProgress(0);
  };
  
  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Enviar Áudio</h2>
      
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all",
          isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400",
          isDragReject && "border-red-500 bg-red-50",
          uploadStatus === 'error' && "border-red-500",
          uploadStatus === 'success' && "border-green-500",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        )}
      >
        <input {...getInputProps()} />
        
        {uploadStatus === 'error' ? (
          <div className="space-y-2">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500" />
            <p className="text-red-600 font-medium">{errorMessage}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                resetUpload();
              }}
              className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        ) : uploadStatus === 'success' ? (
          <div className="space-y-2">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
            <p className="text-green-600 font-medium">Arquivo enviado com sucesso!</p>
          </div>
        ) : isUploading ? (
          <div className="space-y-4">
            <div className="h-12 w-12 mx-auto relative">
              <svg className="animate-spin h-12 w-12 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-500 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-gray-600">Enviando... {uploadProgress}%</p>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="h-12 w-12 mx-auto text-gray-400" />
            <p className="text-gray-600">
              Arraste e solte arquivos de áudio aqui ou clique para selecionar
            </p>
            <p className="text-sm text-gray-500">
              Formatos suportados: .mp3, .wav, .flac, .m4a (Max. 10MB)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;