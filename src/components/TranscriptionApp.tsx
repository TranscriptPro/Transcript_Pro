import React, { useState } from 'react';
import { 
  Mic, 
  FileText, 
  BarChart3,
  Users,
  Settings,
  Cog,
  Mail
} from 'lucide-react';
import FileUpload from './upload/FileUpload';
import FileList from './files/FileList';
import RealtimeTranscriber from './realtime/RealtimeTranscriber';
import ModelLanguageSelector from './settings/ModelLanguageSelector';
import AuditSettings from './settings/AuditSettings';
import { sendTranscriptionEmail } from '../services/api';

const TranscriptionApp = () => {
  // Main application state
  const [currentUser, setCurrentUser] = useState({ 
    name: 'João Silva', 
    role: 'Administrador',
    projects: ['Projeto A', 'Projeto B'] 
  });
  const [activeTab, setActiveTab] = useState('files');
  const [activeSettingsTab, setActiveSettingsTab] = useState('transcription');
  
  // File management state
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Transcription settings state
  const [selectedModel, setSelectedModel] = useState('base');
  const [selectedLanguage, setSelectedLanguage] = useState('pt-BR');
  
  // Audit settings state
  const [aiTool, setAiTool] = useState('chatgpt');
  const [auditRules, setAuditRules] = useState('');
  const [destinationEmail, setDestinationEmail] = useState('');
  
  // Email sending state
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [emailMessage, setEmailMessage] = useState('');
  
  // Handle file upload completion
  const handleFileUploaded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Handle email sending
  const handleSendEmail = async (transcription: string, fileName: string) => {
    if (!destinationEmail) {
      setEmailStatus('error');
      setEmailMessage('E-mail de destino não configurado. Configure nas Configurações de Auditoria.');
      setTimeout(() => {
        setEmailStatus('idle');
        setEmailMessage('');
      }, 5000);
      return;
    }

    try {
      setEmailStatus('sending');
      setEmailMessage('Enviando e-mail...');
      
      await sendTranscriptionEmail({
        transcription,
        fileName,
        aiTool,
        auditRules,
        destinationEmail
      });
      
      setEmailStatus('success');
      setEmailMessage('E-mail enviado com sucesso!');
      
      setTimeout(() => {
        setEmailStatus('idle');
        setEmailMessage('');
      }, 5000);
    } catch (error) {
      console.error('Error sending email:', error);
      setEmailStatus('error');
      setEmailMessage('Erro ao enviar e-mail. Tente novamente.');
      
      setTimeout(() => {
        setEmailStatus('idle');
        setEmailMessage('');
      }, 5000);
    }
  };

  // Allow TabButton props to be of any type
  const TabButton = ({ id, label, icon: Icon, active, onClick, ...rest }: any) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all font-medium
        ${active
          ? 'bg-black text-white shadow-lg'
          : 'bg-black text-gray-500 hover:bg-gray-800 border border-gray-700'}
      `}
      {...rest}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );

  // Settings sub-tab button component
  const SettingsTabButton = ({ id, label, icon: Icon, active, onClick }: any) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all text-sm font-medium
        ${active
          ? 'bg-blue-100 text-blue-700 border border-blue-200'
          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'}
      `}
    >
      <Icon size={16} />
      <span>{label}</span>
    </button>
  );

  // Placeholder components for future implementation
  const ReportsTab = () => (
    <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
      <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Relatórios</h3>
      <p className="text-gray-600">Funcionalidade de relatórios será implementada em breve.</p>
    </div>
  );

  const UsersTab = () => (
    <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
      <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Gestão de Utilizadores</h3>
      <p className="text-gray-600">Funcionalidade de gestão de utilizadores será implementada em breve.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Mic className="text-white" size={20} />
                </div>
                <h1 className="text-xl font-bold text-gray-900">TranscriptPro</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{currentUser.name}</div>
                <div className="text-xs text-gray-500">{currentUser.role}</div>
              </div>
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <Users size={16} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-2 py-4 overflow-x-auto">
            <TabButton 
              id="files" 
              label="Arquivos" 
              icon={FileText} 
              active={activeTab === 'files'}
              onClick={setActiveTab}
            />
            <TabButton 
              id="realtime" 
              label="Tempo Real" 
              icon={Mic} 
              active={activeTab === 'realtime'}
              onClick={setActiveTab}
            />
            <TabButton 
              id="settings" 
              label="Configurações" 
              icon={Settings} 
              active={activeTab === 'settings'}
              onClick={setActiveTab}
            />
            <TabButton 
              id="reports" 
              label="Relatórios" 
              icon={BarChart3} 
              active={activeTab === 'reports'}
              onClick={setActiveTab}
            />
            {currentUser.role === 'Administrador' && (
              <TabButton 
                id="users" 
                label="Utilizadores" 
                icon={Users} 
                active={activeTab === 'users'}
                onClick={setActiveTab}
              />
            )}
          </div>
        </div>
      </nav>

      {/* Email Status Notification */}
      {emailStatus !== 'idle' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className={`p-3 rounded-lg flex items-center space-x-2 ${
            emailStatus === 'sending' ? 'bg-blue-50 text-blue-700' :
            emailStatus === 'success' ? 'bg-green-50 text-green-700' :
            'bg-red-50 text-red-700'
          }`}>
            {emailStatus === 'sending' && (
              <div className="animate-spin h-4 w-4 border-2 border-blue-700 border-t-transparent rounded-full" />
            )}
            <Mail className="h-4 w-4" />
            <span className="text-sm font-medium">{emailMessage}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'files' && (
          <div className="space-y-8">
            <FileUpload onFileUploaded={handleFileUploaded} />
            <FileList 
              refreshTrigger={refreshTrigger}
              selectedModel={selectedModel}
              selectedLanguage={selectedLanguage}
              onSendEmail={handleSendEmail}
              auditSettings={{
                aiTool,
                auditRules,
                destinationEmail
              }}
            />
          </div>
        )}
        {activeTab === 'realtime' && <RealtimeTranscriber />}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Settings Sub-Navigation */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex space-x-2 overflow-x-auto">
                <SettingsTabButton
                  id="transcription"
                  label="Configurações de Transcrição"
                  icon={Cog}
                  active={activeSettingsTab === 'transcription'}
                  onClick={setActiveSettingsTab}
                />
                <SettingsTabButton
                  id="audit"
                  label="Configurações de Auditoria"
                  icon={Mail}
                  active={activeSettingsTab === 'audit'}
                  onClick={setActiveSettingsTab}
                />
              </div>
            </div>

            {/* Settings Content */}
            {activeSettingsTab === 'transcription' && (
              <ModelLanguageSelector
                selectedModel={selectedModel}
                selectedLanguage={selectedLanguage}
                onModelChange={setSelectedModel}
                onLanguageChange={setSelectedLanguage}
              />
            )}
            {activeSettingsTab === 'audit' && (
              <AuditSettings
                aiTool={aiTool}
                auditRules={auditRules}
                destinationEmail={destinationEmail}
                onAiToolChange={setAiTool}
                onAuditRulesChange={setAuditRules}
                onDestinationEmailChange={setDestinationEmail}
              />
            )}
          </div>
        )}
        {activeTab === 'reports' && <ReportsTab />}
        {activeTab === 'users' && <UsersTab />}
      </main>
    </div>
  );
};

export default TranscriptionApp;