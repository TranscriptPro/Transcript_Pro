import React, { useState } from 'react';
import { 
  Mic, 
  FileText, 
  BarChart3,
  Users,
  Settings
} from 'lucide-react';
import FileUpload from './upload/FileUpload';
import FileList from './files/FileList';
import RealtimeTranscriber from './realtime/RealtimeTranscriber';
import ModelLanguageSelector from './settings/ModelLanguageSelector';

const TranscriptionApp = () => {
  // Main application state
  const [currentUser, setCurrentUser] = useState({ 
    name: 'João Silva', 
    role: 'Administrador',
    projects: ['Projeto A', 'Projeto B'] 
  });
  const [activeTab, setActiveTab] = useState('files');
  
  // File management state
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Transcription settings state
  const [selectedModel, setSelectedModel] = useState('base');
  const [selectedLanguage, setSelectedLanguage] = useState('pt-BR');
  
  // Handle file upload completion
  const handleFileUploaded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Allow TabButton props to be of any type
  const TabButton = ({ id, label, icon: Icon, active, onClick, ...rest }: any) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
        active 
          ? 'bg-blue-600 text-white shadow-lg' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
      {...rest}
    >
      <Icon size={18} />
      <span className="font-medium">{label}</span>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'files' && (
          <div className="space-y-8">
            <FileUpload onFileUploaded={handleFileUploaded} />
            <FileList 
              refreshTrigger={refreshTrigger}
              selectedModel={selectedModel}
              selectedLanguage={selectedLanguage}
            />
          </div>
        )}
        {activeTab === 'realtime' && <RealtimeTranscriber />}
        {activeTab === 'settings' && (
          <ModelLanguageSelector
            selectedModel={selectedModel}
            selectedLanguage={selectedLanguage}
            onModelChange={setSelectedModel}
            onLanguageChange={setSelectedLanguage}
          />
        )}
        {activeTab === 'reports' && <ReportsTab />}
        {activeTab === 'users' && <UsersTab />}
      </main>
    </div>
  );
};

export default TranscriptionApp;