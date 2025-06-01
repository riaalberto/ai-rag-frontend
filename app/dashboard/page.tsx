import React, { useState, useEffect } from 'react';
import { MessageCircle, Upload, FileText, BarChart3, Settings, User, Search, Bell, Home, Sparkles, Brain, Zap, TrendingUp, FileBarChart, Users, Activity, Plus, ArrowRight, ChevronRight, Bot, Database, Cpu, Cloud } from 'lucide-react';

const ModernRAGDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    { 
      title: 'Documentos Procesados', 
      value: '2,847', 
      change: '+12%', 
      icon: FileText,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    { 
      title: 'Consultas RAG', 
      value: '1,439', 
      change: '+23%', 
      icon: Brain,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    },
    { 
      title: 'Insights Generados', 
      value: '582', 
      change: '+8%', 
      icon: Sparkles,
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700'
    },
    { 
      title: 'Usuarios Activos', 
      value: '127', 
      change: '+15%', 
      icon: Users,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700'
    }
  ];

  const systemStatus = [
    { service: 'RAG Engine', status: 'online', uptime: '99.9%', icon: Brain, color: 'text-emerald-500' },
    { service: 'Vector Database', status: 'online', uptime: '99.8%', icon: Database, color: 'text-emerald-500' },
    { service: 'AI Processor', status: 'online', uptime: '98.7%', icon: Cpu, color: 'text-emerald-500' },
    { service: 'Cloud Storage', status: 'online', uptime: '99.5%', icon: Cloud, color: 'text-emerald-500' }
  ];

  const recentDocuments = [
    { name: 'Datos_Gonpal_1.xlsx', type: 'Excel', size: '2.4 MB', processed: '5 min ago', insights: 12 },
    { name: 'Financial_Report_Q4.pdf', type: 'PDF', size: '1.8 MB', processed: '1 hour ago', insights: 8 },
    { name: 'Market_Analysis.docx', type: 'Word', size: '956 KB', processed: '3 hours ago', insights: 6 },
    { name: 'Customer_Data.csv', type: 'CSV', size: '3.2 MB', processed: '1 day ago', insights: 15 }
  ];

  const quickActions = [
    { title: 'Nuevo Chat RAG', icon: MessageCircle, color: 'bg-gradient-to-r from-blue-500 to-cyan-500', action: () => setActiveTab('chat') },
    { title: 'Subir Documento', icon: Upload, color: 'bg-gradient-to-r from-purple-500 to-pink-500', action: () => setActiveTab('upload') },
    { title: 'Ver Analytics', icon: BarChart3, color: 'bg-gradient-to-r from-emerald-500 to-teal-500', action: () => setActiveTab('analytics') },
    { title: 'Gestionar Docs', icon: FileText, color: 'bg-gradient-to-r from-orange-500 to-red-500', action: () => setActiveTab('documents') }
  ];

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    const userMessage = { role: 'user', content: inputMessage, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    
    // Simular respuesta del sistema RAG
    setTimeout(() => {
      const response = {
        role: 'assistant',
        content: `Basándome en el análisis de tus documentos, he encontrado los siguientes insights sobre "${inputMessage}": \n\n• Tendencia ascendente del 23% en los últimos trimestres\n• Correlación significativa con variables de mercado\n• Recomendación: Expandir estrategia en Q2\n\n📊 Datos procesados con arquitectura modular Excel Processor\n📈 3 gráficas automáticas generadas\n📋 Análisis estadístico completado`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, response]);
    }, 1500);
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Welcome Section with Gradient */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">¡Bienvenido de vuelta! 👋</h1>
            <p className="text-indigo-100 text-lg">Tu sistema RAG ha procesado 127 documentos esta semana</p>
            <div className="mt-4 flex items-center space-x-4">
              <span className="text-sm bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                {currentTime.toLocaleDateString('es-ES')}
              </span>
              <span className="text-sm bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                {currentTime.toLocaleTimeString('es-ES')}
              </span>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="w-32 h-32 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Bot className="w-16 h-16 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
                <span className="text-emerald-500 text-sm font-medium">{stat.change}</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-gray-600 text-sm">{stat.title}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={action.action}
                className={`${action.color} text-white p-6 rounded-xl hover:scale-105 transition-all duration-300 group`}
              >
                <Icon className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold">{action.title}</h3>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* System Status */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Estado del Sistema</h2>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-emerald-600 font-medium">Todo operativo</span>
            </div>
          </div>
          <div className="space-y-4">
            {systemStatus.map((service, index) => {
              const Icon = service.icon;
              return (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-5 h-5 ${service.color}`} />
                    <span className="font-medium text-gray-900">{service.service}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">{service.uptime}</span>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Documents */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Documentos Recientes</h2>
            <button 
              onClick={() => setActiveTab('documents')}
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center space-x-1"
            >
              <span>Ver todos</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {recentDocuments.map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">{doc.name}</h3>
                    <p className="text-gray-500 text-xs">{doc.size} • {doc.processed}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-indigo-600 font-medium">{doc.insights} insights</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderChat = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-[calc(100vh-200px)] flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">AI RAG Assistant</h2>
            <p className="text-gray-600 text-sm">Pregunta sobre tus documentos y obtén insights inteligentes</p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">¡Hola! Soy tu asistente RAG</h3>
            <p className="text-gray-600 mb-6">Puedo ayudarte a analizar documentos, extraer insights y responder preguntas específicas sobre tus datos.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
              {[
                "¿Qué insights puedes darme del archivo Datos_Gonpal_1.xlsx?",
                "¿Cuáles son las tendencias principales en mis documentos?",
                "Muéstrame un resumen de los datos financieros",
                "¿Qué patrones detectas en los datos de clientes?"
              ].map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setInputMessage(suggestion)}
                  className="p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-xl text-sm transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl ${
                message.role === 'user' 
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' 
                  : 'bg-gray-50 text-gray-900'
              }`}>
                <p className="whitespace-pre-wrap">{message.content}</p>
                <span className={`text-xs mt-2 block ${
                  message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString('es-ES')}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="p-6 border-t border-gray-100">
        <div className="flex space-x-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Escribe tu pregunta sobre los documentos..."
            className="flex-1 p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-4 rounded-xl hover:opacity-90 transition-opacity"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderUpload = () => (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Subir Documentos</h2>
      <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-indigo-400 transition-colors">
        <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Arrastra archivos aquí o haz click para seleccionar</h3>
        <p className="text-gray-600 mb-6">Soporta Excel, PDF, Word, CSV y más formatos</p>
        <button className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-xl hover:opacity-90 transition-opacity">
          Seleccionar Archivos
        </button>
      </div>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center p-4">
          <FileText className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <h4 className="font-semibold text-gray-900">Documentos de Texto</h4>
          <p className="text-sm text-gray-600">PDF, Word, TXT</p>
        </div>
        <div className="text-center p-4">
          <FileBarChart className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <h4 className="font-semibold text-gray-900">Hojas de Cálculo</h4>
          <p className="text-sm text-gray-600">Excel, CSV, Numbers</p>
        </div>
        <div className="text-center p-4">
          <BarChart3 className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <h4 className="font-semibold text-gray-900">Análisis Automático</h4>
          <p className="text-sm text-gray-600">Insights en tiempo real</p>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics Dashboard</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-indigo-500 mx-auto mb-2" />
              <p className="text-gray-600">Gráfica de Tendencias</p>
            </div>
          </div>
          <div className="h-64 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <p className="text-gray-600">Análisis Comparativo</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Documentos</h2>
        <button className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-xl hover:opacity-90 transition-opacity flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Nuevo</span>
        </button>
      </div>
      
      <div className="mb-6">
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar documentos..."
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Documento</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Tipo</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Tamaño</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Procesado</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Insights</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Estado</th>
            </tr>
          </thead>
          <tbody>
            {recentDocuments.map((doc, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <span className="font-medium text-gray-900">{doc.name}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-gray-600">{doc.type}</td>
                <td className="py-4 px-4 text-gray-600">{doc.size}</td>
                <td className="py-4 px-4 text-gray-600">{doc.processed}</td>
                <td className="py-4 px-4">
                  <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-sm">
                    {doc.insights}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm">
                    Listo
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const navigation = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'documents', label: 'Documents', icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">AI RAG Agent</span>
              <span className="text-sm bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-2 py-1 rounded-full">Pro</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                      activeTab === item.id
                        ? 'bg-indigo-50 text-indigo-600 font-medium'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">Hola, admin@test.com</span>
              <button className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition-colors text-sm">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'chat' && renderChat()}
        {activeTab === 'upload' && renderUpload()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'documents' && renderDocuments()}
      </main>
    </div>
  );
};

export default ModernRAGDashboard;