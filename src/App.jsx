import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Upload, 
  Download, 
  Edit3, 
  Trash2, 
  Save, 
  FileText, 
  BarChart3,
  Users,
  Settings,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Eye,
  Bot
} from 'lucide-react';

const TranscriptionApp = () => {
  // Estados principais
  const [currentUser, setCurrentUser] = useState({ 
    name: 'João Silva', 
    role: 'Administrador',
    projects: ['Projeto A', 'Projeto B'] 
  });
  const [activeTab, setActiveTab] = useState('transcription');
  const [selectedProject, setSelectedProject] = useState('Projeto A');
  
  // Estados de transcrição
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptionMode, setTranscriptionMode] = useState('auto'); // 'auto' ou 'manual'
  const [transcribedText, setTranscribedText] = useState('');
  const [summary, setSummary] = useState('');
  const [audioFiles, setAudioFiles] = useState([
    { id: 1, name: 'chamada_cliente_001.mp3', duration: '2:34', status: 'transcrito', project: 'Projeto A' },
    { id: 2, name: 'reuniao_equipe_002.mp3', duration: '15:22', status: 'pendente', project: 'Projeto A' },
    { id: 3, name: 'feedback_cliente_003.mp3', duration: '4:12', status: 'transcrito', project: 'Projeto B' }
  ]);
  
  // Estados de análise
  const [analysisResults, setAnalysisResults] = useState({
    repeatedWords: [
      { word: 'cliente', count: 12 },
      { word: 'problema', count: 8 },
      { word: 'solução', count: 6 }
    ],
    complaints: [
      'Demora no atendimento',
      'Falta de comunicação',
      'Produto defeituoso'
    ],
    sentiment: 'Neutro',
    offensiveLanguage: false,
    qualityScore: 85
  });

  // Estados de usuários
  const [users, setUsers] = useState([
    { id: 1, name: 'João Silva', role: 'Administrador', email: 'joao@empresa.com' },
    { id: 2, name: 'Maria Santos', role: 'Supervisor', email: 'maria@empresa.com' },
    { id: 3, name: 'Pedro Costa', role: 'Agente', email: 'pedro@empresa.com' }
  ]);

  // Refs
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  // Simulação de transcrição em tempo real
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      setIsRecording(true);
      mediaRecorder.start();
      
      // Simulação de transcrição
      const simulateTranscription = () => {
        const sampleTexts = [
          'Olá, como posso ajudá-lo hoje?',
          'Entendo a sua preocupação com o produto.',
          'Vamos resolver esta situação rapidamente.',
          'Obrigado pela sua paciência.',
          'Existe mais alguma coisa que posso fazer por si?'
        ];
        
        let currentIndex = 0;
        const interval = setInterval(() => {
          if (currentIndex < sampleTexts.length && isRecording) {
            setTranscribedText(prev => prev + ' ' + sampleTexts[currentIndex]);
            currentIndex++;
          } else {
            clearInterval(interval);
          }
        }, 2000);
      };
      
      simulateTranscription();
      
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
    
    // Gerar resumo automático
    setTimeout(() => {
      setSummary('Resumo: Conversa de atendimento ao cliente sobre questões de produto. Cliente expressou preocupações que foram abordadas pela equipe de suporte. Resolução positiva alcançada.');
    }, 1000);
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newAudioFiles = files.map((file, index) => ({
      id: audioFiles.length + index + 1,
      name: file.name,
      duration: '0:00',
      status: 'pendente',
      project: selectedProject,
      file: file
    }));
    
    setAudioFiles([...audioFiles, ...newAudioFiles]);
  };

  const auditWithChatGPT = () => {
    // Simulação de auditoria com ChatGPT
    setTimeout(() => {
      setAnalysisResults({
        ...analysisResults,
        sentiment: 'Positivo',
        qualityScore: Math.floor(Math.random() * 20) + 80,
        offensiveLanguage: Math.random() > 0.8
      });
    }, 2000);
  };

  const TabButton = ({ id, label, icon: Icon, active, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
        active 
          ? 'bg-blue-600 text-white shadow-lg' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      <Icon size={18} />
      <span className="font-medium">{label}</span>
    </button>
  );

  const TranscriptionTab = () => (
    <div className="space-y-6">
      {/* Controles de Projeto e Modo */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Projeto Ativo
            </label>
            <select 
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {currentUser.projects.map(project => (
                <option key={project} value={project}>{project}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Modo de Transcrição
            </label>
            <select 
              value={transcriptionMode}
              onChange={(e) => setTranscriptionMode(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="auto">Automático (por silêncio)</option>
              <option value="manual">Manual (botão)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Controles de Gravação */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
              isRecording 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
            <span>{isRecording ? 'Parar Gravação' : 'Iniciar Gravação'}</span>
          </button>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
          >
            <Upload size={20} />
            <span>Carregar Áudio</span>
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
        
        {isRecording && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center space-x-2 text-red-600">
              <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
              <span className="font-medium">Gravando...</span>
            </div>
          </div>
        )}
      </div>

      {/* Transcrição e Resumo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Transcrição</h3>
            <button
              onClick={auditWithChatGPT}
              className="flex items-center space-x-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm"
            >
              <Bot size={16} />
              <span>Auditar com ChatGPT</span>
            </button>
          </div>
          <textarea
            value={transcribedText}
            onChange={(e) => setTranscribedText(e.target.value)}
            placeholder="A transcrição aparecerá aqui..."
            className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumo Automático</h3>
          <div className="h-64 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-700">{summary || 'O resumo será gerado automaticamente após a transcrição.'}</p>
          </div>
        </div>
      </div>

      {/* Análise de Qualidade */}
      {analysisResults.qualityScore > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Análise de Qualidade</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{analysisResults.qualityScore}%</div>
              <div className="text-sm text-gray-600">Pontuação de Qualidade</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                analysisResults.sentiment === 'Positivo' ? 'text-green-600' : 
                analysisResults.sentiment === 'Negativo' ? 'text-red-600' : 'text-yellow-600'
              }`}>
                {analysisResults.sentiment}
              </div>
              <div className="text-sm text-gray-600">Sentimento</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${analysisResults.offensiveLanguage ? 'text-red-600' : 'text-green-600'}`}>
                {analysisResults.offensiveLanguage ? 'Detectado' : 'Limpo'}
              </div>
              <div className="text-sm text-gray-600">Linguagem Ofensiva</div>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Palavras Mais Repetidas</h4>
              <ul className="space-y-1">
                {analysisResults.repeatedWords.map((word, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    {word.word}: {word.count}x
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Reclamações Frequentes</h4>
              <ul className="space-y-1">
                {analysisResults.complaints.map((complaint, index) => (
                  <li key={index} className="text-sm text-gray-600">• {complaint}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const FilesTab = () => (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold text-gray-800">Gestão de Áudios</h3>
      </div>
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Nome do Arquivo</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Duração</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Projeto</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {audioFiles.map((file) => (
                <tr key={file.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{file.name}</td>
                  <td className="py-3 px-4">{file.duration}</td>
                  <td className="py-3 px-4">{file.project}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      file.status === 'transcrito' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {file.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                        <Play size={16} />
                      </button>
                      <button className="p-1 text-green-600 hover:bg-green-100 rounded">
                        <Download size={16} />
                      </button>
                      <button className="p-1 text-orange-600 hover:bg-orange-100 rounded">
                        <Edit3 size={16} />
                      </button>
                      <button className="p-1 text-red-600 hover:bg-red-100 rounded">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const ReportsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
          <div className="text-3xl font-bold text-blue-600">{audioFiles.length}</div>
          <div className="text-sm text-gray-600">Total de Áudios</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
          <div className="text-3xl font-bold text-green-600">
            {audioFiles.filter(f => f.status === 'transcrito').length}
          </div>
          <div className="text-sm text-gray-600">Transcritos</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
          <div className="text-3xl font-bold text-orange-600">3</div>
          <div className="text-sm text-gray-600">Auditorias Feitas</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
          <div className="text-3xl font-bold text-purple-600">85%</div>
          <div className="text-sm text-gray-600">Qualidade Média</div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Exportar Relatórios</h3>
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-sm">
              PDF
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm">
              Excel
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm">
              CSV
            </button>
          </div>
        </div>
        <p className="text-gray-600">
          Relatórios detalhados incluindo métricas de qualidade, análise sentimental e insights de negócio.
        </p>
      </div>
    </div>
  );

  const UsersTab = () => (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Gestão de Utilizadores</h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all">
            Adicionar Utilizador
          </button>
        </div>
      </div>
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Nome</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Função</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{user.name}</td>
                  <td className="py-3 px-4 text-gray-600">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'Administrador' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'Supervisor' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                        <Eye size={16} />
                      </button>
                      <button className="p-1 text-orange-600 hover:bg-orange-100 rounded">
                        <Edit3 size={16} />
                      </button>
                      <button className="p-1 text-red-600 hover:bg-red-100 rounded">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
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
              id="transcription" 
              label="Transcrição" 
              icon={Mic} 
              active={activeTab === 'transcription'}
              onClick={setActiveTab}
            />
            <TabButton 
              id="files" 
              label="Arquivos" 
              icon={FileText} 
              active={activeTab === 'files'}
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
        {activeTab === 'transcription' && <TranscriptionTab />}
        {activeTab === 'files' && <FilesTab />}
        {activeTab === 'reports' && <ReportsTab />}
        {activeTab === 'users' && <UsersTab />}
      </main>
    </div>
  );
};

export default TranscriptionApp;
