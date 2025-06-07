import React from 'react';
import { Settings, Cpu, Globe } from 'lucide-react';

interface ModelLanguageSelectorProps {
  selectedModel: string;
  selectedLanguage: string;
  onModelChange: (model: string) => void;
  onLanguageChange: (language: string) => void;
}

const WHISPER_MODELS = {
  'tiny': {
    size: '39MB',
    speed: 'Fastest',
    accuracy: 'Basic',
    description: 'Fastest model, good for testing and quick transcriptions'
  },
  'base': {
    size: '74MB',
    speed: 'Fast',
    accuracy: 'Good',
    description: 'Balanced speed and accuracy for most use cases'
  },
  'small': {
    size: '244MB',
    speed: 'Medium',
    accuracy: 'Better',
    description: 'Better accuracy, suitable for important transcriptions'
  },
  'medium': {
    size: '769MB',
    speed: 'Slow',
    accuracy: 'High',
    description: 'High accuracy, requires more time and memory'
  }
};

const LANGUAGES = {
  'pt-BR': 'Português (Brasil)',
  'en-US': 'English (US)',
  'auto': 'Auto-detect'
};

const ModelLanguageSelector: React.FC<ModelLanguageSelectorProps> = ({
  selectedModel,
  selectedLanguage,
  onModelChange,
  onLanguageChange
}) => {
  const currentModel = WHISPER_MODELS[selectedModel as keyof typeof WHISPER_MODELS];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Settings className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-800">Configurações de Transcrição</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Model Selection */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Cpu className="h-4 w-4 text-blue-600" />
            <label className="text-sm font-medium text-gray-700">
              Modelo Whisper
            </label>
          </div>
          
          <select
            value={selectedModel}
            onChange={(e) => onModelChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {Object.entries(WHISPER_MODELS).map(([key, model]) => (
              <option key={key} value={key}>
                {key.toUpperCase()} - {model.size} ({model.accuracy})
              </option>
            ))}
          </select>
          
          {currentModel && (
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="font-medium text-blue-800">Tamanho:</span>
                  <span className="text-blue-600 ml-1">{currentModel.size}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Velocidade:</span>
                  <span className="text-blue-600 ml-1">{currentModel.speed}</span>
                </div>
                <div className="col-span-2">
                  <span className="font-medium text-blue-800">Precisão:</span>
                  <span className="text-blue-600 ml-1">{currentModel.accuracy}</span>
                </div>
              </div>
              <p className="text-xs text-blue-700 mt-2">{currentModel.description}</p>
            </div>
          )}
        </div>

        {/* Language Selection */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Globe className="h-4 w-4 text-green-600" />
            <label className="text-sm font-medium text-gray-700">
              Idioma do Áudio
            </label>
          </div>
          
          <select
            value={selectedLanguage}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {Object.entries(LANGUAGES).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
          
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-xs text-green-700">
              <strong>Dica:</strong> Especificar o idioma correto melhora significativamente a precisão da transcrição. 
              Use "Auto-detect\" apenas se não souber o idioma do áudio.
            </p>
          </div>
        </div>
      </div>

      {/* Performance Tips */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-800 mb-2">💡 Dicas para Melhor Precisão</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• <strong>Modelo Tiny:</strong> Ideal para testes rápidos e áudios curtos</li>
          <li>• <strong>Modelo Base:</strong> Melhor custo-benefício para uso geral</li>
          <li>• <strong>Modelo Small:</strong> Recomendado para transcrições importantes</li>
          <li>• <strong>Modelo Medium:</strong> Máxima precisão, mas mais lento</li>
          <li>• <strong>Áudio limpo:</strong> Evite ruído de fundo para melhores resultados</li>
          <li>• <strong>Português ou Inglês:</strong> Especifique o idioma correto quando possível</li>
        </ul>
      </div>
    </div>
  );
};

export default ModelLanguageSelector;