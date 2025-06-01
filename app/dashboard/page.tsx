'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function WorkingDashboard() {
  const [userEmail, setUserEmail] = useState('')
  const [currentTime, setCurrentTime] = useState('')
  const [activeChat, setActiveChat] = useState(false)
  const [messages, setMessages] = useState([
    { type: 'system', content: '¡Hola! Soy tu asistente RAG. ¿En qué puedo ayudarte hoy?' }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    const email = localStorage.getItem('userEmail') || 'usuario@demo.com'
    setUserEmail(email)
    
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }))
    }
    
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return
    
    const userMessage = { type: 'user', content: inputMessage }
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    
    // Simular respuesta RAG
    setTimeout(() => {
      const responses = [
        'Basándome en los documentos analizados, puedo decirte que...',
        'He encontrado información relevante en la base de datos de conocimiento...',
        'Según los datos procesados por el sistema RAG...',
        'Mi análisis de los documentos muestra que...'
      ]
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      const systemMessage = { type: 'system', content: randomResponse }
      setMessages(prev => [...prev, systemMessage])
    }, 1000)
  }

  const handleLogout = () => {
    localStorage.removeItem('userEmail')
    router.push('/login')
  }

  const suggestedQuestions = [
    '¿Qué información tienes sobre ventas?',
    'Analiza los reportes financieros',
    '¿Cuáles son las tendencias principales?',
    'Busca datos de usuarios activos'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">AI</span>
              </div>
              <h1 className="text-xl font-bold text-white">Sistema RAG</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-white/80">{currentTime}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500/20 hover:bg-red-500/30 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Panel Principal - Chat RAG */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 h-[600px] flex flex-col">
              <div className="p-6 border-b border-white/20">
                <h2 className="text-2xl font-bold text-white mb-2">Chat Inteligente RAG</h2>
                <p className="text-white/70">Haz preguntas sobre tus documentos y datos</p>
              </div>
              
              {/* Mensajes */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white ml-auto'
                        : 'bg-white/20 text-white'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Input */}
              <div className="p-6 border-t border-white/20">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Escribe tu pregunta aquí..."
                    className="flex-1 bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
                  >
                    Enviar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-md rounded-xl p-4 border border-blue-500/30">
                <div className="text-2xl font-bold text-white">1,247</div>
                <div className="text-blue-200 text-sm">Documentos</div>
              </div>
              <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-md rounded-xl p-4 border border-green-500/30">
                <div className="text-2xl font-bold text-white">98.5%</div>
                <div className="text-green-200 text-sm">Precisión</div>
              </div>
            </div>

            {/* Sistema Status */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Estado del Sistema</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Base de Datos</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-sm">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Procesamiento IA</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-sm">Activo</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Vector Store</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-sm">Operativo</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Preguntas Sugeridas */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Preguntas Sugeridas</h3>
              <div className="space-y-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setInputMessage(question)}
                    className="w-full text-left p-3 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-all duration-200 text-sm"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Acciones Rápidas</h3>
              <div className="space-y-3">
                <Link href="/upload" className="block w-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 text-white text-center py-3 rounded-lg font-medium transition-all duration-200">
                  Subir Documentos
                </Link>
                <Link href="/analytics" className="block w-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 border border-blue-500/30 text-white text-center py-3 rounded-lg font-medium transition-all duration-200">
                  Ver Analytics
                </Link>
                <Link href="/settings" className="block w-full bg-gradient-to-r from-gray-500/20 to-slate-500/20 hover:from-gray-500/30 hover:to-slate-500/30 border border-gray-500/30 text-white text-center py-3 rounded-lg font-medium transition-all duration-200">
                  Configuración
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}