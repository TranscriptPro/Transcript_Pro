import React from 'react';
import { Mail, Settings, Bot, FileText, User, Info } from 'lucide-react';

interface AuditSettingsProps {
  aiTool: string;
  auditRules: string;
  destinationEmail: string;
  onAiToolChange: (tool: string) => void;
  onAuditRulesChange: (rules: string) => void;
  onDestinationEmailChange: (email: string) => void;
}

const AI_TOOLS = {
  'chatgpt': 'ChatGPT',
  'grok': 'Grok',
  'gemini': 'Gemini'
};

const AuditSettings: React.FC<AuditSettingsProps> = ({
  aiTool,
  auditRules,
  destinationEmail,
  onAiToolChange,
  onAuditRulesChange,
  onDestinationEmailChange
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Mail className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">Configurações de Auditoria</h3>
      </div>
      
      {/* Email Service Info */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-800">Serviço de E-mail</h4>
            <p className="text-sm text-blue-700 mt-1">
              Os e-mails serão enviados através de: <strong>mg.transcriptpro@gmail.com</strong>
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Configure o e-mail de destino abaixo para receber as auditorias de transcrição.
            </p>
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* AI Tool Selection */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Bot className="h-4 w-4 text-purple-600" />
            <label className="text-sm font-medium text-gray-700">
              Ferramenta de IA
            </label>
          </div>
          
          <select
            value={aiTool}
            onChange={(e) => onAiToolChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {Object.entries(AI_TOOLS).map(([key, name]) => (
              <option key={key} value={key}>
                {name}
              </option>
            ))}
          </select>
          
          <div className="bg-purple-50 rounded-lg p-3">
            <p className="text-xs text-purple-700">
              <strong>Ferramenta selecionada:</strong> {AI_TOOLS[aiTool as keyof typeof AI_TOOLS]}
            </p>
            <p className="text-xs text-purple-600 mt-1">
              Esta ferramenta será mencionada no e-mail de auditoria como referência para análise.
            </p>
          </div>
        </div>

        {/* Audit Rules */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-orange-600" />
            <label className="text-sm font-medium text-gray-700">
              Regras de Auditoria
            </label>
          </div>
          
          <textarea
            value={auditRules}
            onChange={(e) => onAuditRulesChange(e.target.value)}
            placeholder="Descreva as regras e critérios para auditoria da transcrição..."
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-vertical"
          />
          
          <div className="bg-orange-50 rounded-lg p-3">
            <p className="text-xs text-orange-700">
              <strong>Exemplo de regras:</strong>
            </p>
            <ul className="text-xs text-orange-600 mt-1 space-y-1">
              <li>• Verificar precisão da transcrição</li>
              <li>• Identificar termos técnicos ou específicos</li>
              <li>• Avaliar clareza e coerência do conteúdo</li>
              <li>• Detectar possíveis erros de interpretação</li>
            </ul>
          </div>
        </div>

        {/* Destination Email */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-green-600" />
            <label className="text-sm font-medium text-gray-700">
              E-mail de Destino
            </label>
          </div>
          
          <input
            type="email"
            value={destinationEmail}
            onChange={(e) => onDestinationEmailChange(e.target.value)}
            placeholder="auditor@empresa.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-xs text-green-700">
              <strong>E-mail configurado:</strong> {destinationEmail || 'Nenhum e-mail configurado'}
            </p>
            <p className="text-xs text-green-600 mt-1">
              Este será o destinatário dos e-mails de auditoria das transcrições.
            </p>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-800 mb-2">📧 Prévia do E-mail</h4>
        <div className="text-xs text-gray-600 space-y-2">
          <div>
            <strong>De:</strong> mg.transcriptpro@gmail.com
          </div>
          <div>
            <strong>Para:</strong> {destinationEmail || '[E-mail não configurado]'}
          </div>
          <div>
            <strong>Assunto:</strong> Auditoria de Transcrição - [Nome do Arquivo]
          </div>
          <div>
            <strong>Ferramenta IA:</strong> {AI_TOOLS[aiTool as keyof typeof AI_TOOLS]}
          </div>
          <div>
            <strong>Regras:</strong> {auditRules || '[Regras não definidas]'}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-700">
          <strong>Como usar:</strong> Configure as informações acima e use o botão "Enviar por E-mail" 
          na seção de transcrições para enviar o conteúdo transcrito junto com as regras de auditoria 
          para o e-mail especificado. Os e-mails serão enviados através do endereço mg.transcriptpro@gmail.com.
        </p>
      </div>
    </div>
  );
};

export default AuditSettings;