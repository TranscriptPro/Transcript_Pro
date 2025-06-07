import React, { useState } from 'react';
import { Copy, Check, FileText, Download } from 'lucide-react';

interface TranscriptionResultProps {
  transcription: string;
  fileName: string;
}

const TranscriptionResult: React.FC<TranscriptionResultProps> = ({ transcription, fileName }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(transcription).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const downloadTranscription = () => {
    const element = document.createElement('a');
    const file = new Blob([transcription], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    
    // Get the filename without extension
    const nameWithoutExtension = fileName.split('.').slice(0, -1).join('.') || fileName;
    element.download = `${nameWithoutExtension}_transcricao.txt`;
    
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <FileText className="h-5 w-5 text-green-500 mr-2" />
          <span className="text-sm font-medium text-gray-700">Transcrição</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={copyToClipboard}
            className="p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            title="Copiar transcrição"
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </button>
          <button
            onClick={downloadTranscription}
            className="p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            title="Baixar transcrição"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="bg-gray-50 rounded-md p-3 max-h-60 overflow-y-auto">
        <p className="text-sm text-gray-700 whitespace-pre-line">{transcription}</p>
      </div>
    </div>
  );
};

export default TranscriptionResult;