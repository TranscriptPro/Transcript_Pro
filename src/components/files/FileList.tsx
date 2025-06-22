import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { fetchFiles, startTranscription, deleteFile, clearAllFiles } from '../../services/api';
import { Headphones, FileAudio, FileText, AlertCircle, Play, RefreshCw, Terminal, Trash2, X, Cpu, Globe } from 'lucide-react';
import AudioPlayer from './AudioPlayer';
import { cn } from '../../lib/utils';
import TranscriptionResult from './TranscriptionResult';

interface FileListProps {
  refreshTrigger: number;
  selectedModel: string;
  selectedLanguage: string;
  onSendEmail?: (transcription: string, fileName: string) => void;
  auditSettings?: {
    aiTool: string;
    auditRules: string;
    destinationEmail: string;
  };
}

interface AudioFile {
  id: string;
  name: string;
  size: number;
  createdAt: string;
  status: 'uploaded' | 'processing' | 'transcribed' | 'error';
  url?: string;
  transcription?: string;
  error?: string;
  cliOutput?: string;
  selectedModel?: string;
  selectedLanguage?: string;
}

const FileList: React.FC<FileListProps> = ({ 
  refreshTrigger, 
  selectedModel, 
  selectedLanguage, 
  onSendEmail,
  auditSettings 
}) => {
  const [expandedFile, setExpandedFile] = useState<string | null>(null);
  const [playingFile, setPlayingFile] = useState<string | null>(null);
  const [showCliOutput, setShowCliOutput] = useState<Record<string, boolean>>({});
  const [isDeleting, setIsDeleting] = useState(false);

  const { 
    data: files, 
    isLoading, 
    error, 
    refetch,
    isFetching
  } = useQuery<AudioFile[]>(
    ['files'], 
    fetchFiles, 
    { 
      refetchInterval: 5000,
      enabled: false
    }
  );

  useEffect(() => {
    refetch();
  }, [refreshTrigger, refetch]);

  const handleTranscribe = async (fileId: string) => {
    try {
      await startTranscription(fileId, selectedModel, selectedLanguage);
      refetch();
    } catch (error) {
      console.error('Error starting transcription:', error);
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      await deleteFile(fileId);
      refetch();
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Tem certeza que deseja excluir todos os arquivos?')) {
      return;
    }

    try {
      setIsDeleting(true);
      await clearAllFiles();
      refetch();
    } catch (error) {
      console.error('Error clearing files:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleExpand = (fileId: string) => {
    setExpandedFile(expandedFile === fileId ? null : fileId);
  };

  const togglePlay = (fileId: string) => {
    setPlayingFile(playingFile === fileId ? null : fileId);
  };

  const toggleCliOutput = (fileId: string) => {
    setShowCliOutput(prev => ({
      ...prev,
      [fileId]: !prev[fileId]
    }));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const getModelDisplayName = (model?: string) => {
    if (!model) return 'Base';
    return model.toUpperCase();
  };

  const getLanguageDisplayName = (language?: string) => {
    const languages: Record<string, string> = {
      'pt-BR': 'Português (BR)',
      'en-US': 'English (US)',
      'auto': 'Auto-detect'
    };
    return languages[language || 'pt-BR'] || 'Português (BR)';
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Seus Arquivos</h2>
        <div className="flex items-center space-x-2">
          {files && files.length > 0 && (
            <button
              onClick={handleClearAll}
              disabled={isDeleting || isFetching}
              className={cn(
                "inline-flex items-center px-3 py-2 rounded-md text-sm font-medium",
                "bg-red-50 text-red-600 hover:bg-red-100 transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar Tudo
            </button>
          )}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className={cn(
              "inline-flex items-center px-3 py-2 rounded-md text-sm font-medium",
              "bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <RefreshCw className={cn(
              "h-4 w-4 mr-2",
              isFetching && "animate-spin"
            )} />
            Atualizar
          </button>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <p className="text-red-700 font-medium">Erro ao carregar arquivos</p>
            <p className="text-red-600 text-sm">Por favor, tente novamente mais tarde.</p>
          </div>
        </div>
      ) : !files || files.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <FileAudio className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600">Nenhum arquivo enviado ainda</p>
          <p className="text-sm text-gray-500 mt-1">Arquivos enviados aparecerão aqui</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arquivo</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tamanho</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {files.map((file) => (
                  <React.Fragment key={file.id}>
                    <tr 
                      className={cn(
                        "hover:bg-gray-50 cursor-pointer transition-colors",
                        expandedFile === file.id && "bg-blue-50 hover:bg-blue-50"
                      )}
                      onClick={() => toggleExpand(file.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileAudio className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <span className="text-sm font-medium text-gray-900">{file.name}</span>
                            {(file.selectedModel || file.selectedLanguage) && (
                              <div className="flex items-center space-x-2 mt-1">
                                {file.selectedModel && (
                                  <div className="flex items-center space-x-1">
                                    <Cpu className="h-3 w-3 text-blue-500" />
                                    <span className="text-xs text-blue-600">{getModelDisplayName(file.selectedModel)}</span>
                                  </div>
                                )}
                                {file.selectedLanguage && (
                                  <div className="flex items-center space-x-1">
                                    <Globe className="h-3 w-3 text-green-500" />
                                    <span className="text-xs text-green-600">{getLanguageDisplayName(file.selectedLanguage)}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatFileSize(file.size)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(file.createdAt).toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={cn(
                          "px-2 py-1 text-xs font-medium rounded-full",
                          file.status === 'uploaded' && "bg-blue-100 text-blue-800",
                          file.status === 'processing' && "bg-yellow-100 text-yellow-800",
                          file.status === 'transcribed' && "bg-green-100 text-green-800",
                          file.status === 'error' && "bg-red-100 text-red-800",
                        )}>
                          {file.status === 'uploaded' && "Enviado"}
                          {file.status === 'processing' && "Processando"}
                          {file.status === 'transcribed' && "Transcrito"}
                          {file.status === 'error' && "Erro"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePlay(file.id);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="Reproduzir áudio"
                          >
                            <Play className="h-5 w-5" />
                          </button>
                          {file.status === 'uploaded' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTranscribe(file.id);
                              }}
                              className="text-green-600 hover:text-green-900"
                              title={`Transcrever com ${getModelDisplayName(selectedModel)} em ${getLanguageDisplayName(selectedLanguage)}`}
                            >
                              <FileText className="h-5 w-5" />
                            </button>
                          )}
                          {file.status === 'processing' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCliOutput(file.id);
                              }}
                              className={cn(
                                "text-gray-600 hover:text-gray-900",
                                showCliOutput[file.id] && "text-blue-600 hover:text-blue-900"
                              )}
                              title="Mostrar/ocultar saída do processo"
                            >
                              <Terminal className="h-5 w-5" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm('Tem certeza que deseja excluir este arquivo?')) {
                                handleDelete(file.id);
                              }
                            }}
                            className="text-red-600 hover:text-red-900"
                            title="Excluir arquivo"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedFile === file.id && (
                      <tr className="bg-blue-50">
                        <td colSpan={5} className="px-6 py-4">
                          <div className="space-y-4">
                            {playingFile === file.id && file.url && (
                              <AudioPlayer 
                                url={file.url} 
                                fileName={file.name}
                                onClose={() => setPlayingFile(null)}
                              />
                            )}
                            
                            {file.status === 'transcribed' && file.transcription && (
                              <TranscriptionResult 
                                transcription={file.transcription} 
                                fileName={file.name}
                                onSendEmail={onSendEmail}
                              />
                            )}
                            
                            {file.status === 'processing' && (
                              <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                  <div className="h-5 w-5 relative">
                                    <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                                  </div>
                                  <span className="text-sm text-blue-700">
                                    Transcrevendo com modelo {getModelDisplayName(file.selectedModel)} em {getLanguageDisplayName(file.selectedLanguage)}...
                                  </span>
                                </div>
                                
                                {showCliOutput[file.id] && file.cliOutput && (
                                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                                    <pre className="text-gray-100 text-sm font-mono whitespace-pre-wrap">
                                      {file.cliOutput}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {file.status === 'error' && (
                              <div className="bg-red-50 border border-red-200 rounded p-3">
                                <div className="flex items-start">
                                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                                  <div>
                                    <p className="text-red-700 font-medium">Erro na transcrição</p>
                                    <p className="text-red-600 text-sm">{file.error || 'Ocorreu um erro ao processar este arquivo.'}</p>
                                    {(file.selectedModel || file.selectedLanguage) && (
                                      <p className="text-red-500 text-xs mt-1">
                                        Configuração usada: {getModelDisplayName(file.selectedModel)} - {getLanguageDisplayName(file.selectedLanguage)}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileList;