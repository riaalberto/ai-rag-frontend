'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '../components/Sidebar'

export default function ChatPage() {
  const [messages, setMessages] = useState<Array<{id: string, text: string, isUser: boolean, timestamp: Date}>>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn')
    if (!isLoggedIn) {
      router.push('/login')
    }
  }, [router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)
    setIsTyping(true)

    try {
      const response = await fetch('https://fastapi-service-production-4f6c.up.railway.app/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: inputMessage,
          user_id: "119f7084-be9e-416f-81d6-3ffeadb062d5"
        })
      })

      const data = await response.json()

      // Simular efecto de escritura
      setTimeout(() => {
        setIsTyping(false)
        
        // 🔧 FIX PRINCIPAL: Usar data.response en lugar de data.answer
        let botMessageText = data.response || 'Lo siento, no pude procesar tu pregunta.'

        // Agregar información adicional si está disponible
        if (data.sources && data.sources.length > 0) {
          botMessageText += `\n\n📄 Fuentes: ${data.sources.join(', ')}`
        }

        if (data.processor_used) {
          botMessageText += `\n🔧 Procesado con: ${data.processor_used}`
        }

        if (data.analysis_mode) {
          botMessageText += `\n📊 Modo análisis: Activado`
        }

        const botMessage = {
          id: (Date.now() + 1).toString(),
          text: botMessageText,
          isUser: false,
          timestamp: new Date()
        }

        setMessages(prev => [...prev, botMessage])
      }, 1500)

    } catch (error) {
      console.error('Error:', error)
      setIsTyping(false)
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Error de conexión. Intenta nuevamente.',
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const exampleQuestions = [
    "¿Qué insights puedes darme del archivo Datos_Gonpal_1.xlsx?",
    "¿Cuáles son las tendencias principales en mis datos?",
    "¿Qué correlaciones encuentras en los datos de ventas?",
    "Explícame los patrones más importantes del análisis"
  ]

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="glass border-b border-white/20 backdrop-blur-xl">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="animate-slide-up">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                  AI Chat Assistant
                </h1>
                <p className="text-gray-600">Haz preguntas sobre tus documentos y obtén insights inteligentes</p>
              </div>
              <div className="flex items-center space-x-2 animate-scale-in">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600 font-medium">Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="flex-1 p-8">
          <div className="max-w-5xl mx-auto h-full">
            <div className="glass rounded-3xl border border-white/20 h-full flex flex-col backdrop-blur-xl">
              
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {messages.length === 0 && (
                  <div className="text-center py-12 animate-fade-in">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center text-white text-4xl mx-auto mb-6 shadow-xl">
                      🤖
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      ¡Hola! Soy tu asistente de análisis IA
                    </h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      Tengo acceso a tus documentos analizados. Puedes preguntarme sobre patrones, 
                      tendencias y insights específicos.
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                      {exampleQuestions.map((question, index) => (
                        <button
                          key={index}
                          onClick={() => setInputMessage(question)}
                          className="p-4 text-left bg-gradient-to-r from-white/50 to-white/30 hover:from-white/70 hover:to-white/50 rounded-xl border border-white/30 hover:border-white/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                          style={{animationDelay: `${index * 0.1}s`}}
                        >
                          <p className="text-sm text-gray-700 font-medium">{question}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-slide-up`}
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <div className={`max-w-2xl flex ${message.isUser ? 'flex-row-reverse' : 'flex-row'} items-end space-x-3`}>
                      {/* Avatar */}
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg shadow-lg ${
                        message.isUser 
                          ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white' 
                          : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700'
                      }`}>
                        {message.isUser ? '👤' : '🤖'}
                      </div>
                      
                      {/* Message Bubble */}
                      <div className={`px-6 py-4 rounded-2xl shadow-lg max-w-lg ${
                        message.isUser
                          ? 'chat-bubble-user text-white'
                          : 'chat-bubble-ai text-gray-900'
                      }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                        <p className={`text-xs mt-2 ${
                          message.isUser ? 'text-white/80' : 'text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="max-w-2xl flex items-end space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center text-lg shadow-lg">
                        🤖
                      </div>
                      <div className="chat-bubble-ai px-6 py-4 rounded-2xl shadow-lg">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-white/20 p-6">
                <div className="flex space-x-4 items-end">
                  <div className="flex-1">
                    <textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Escribe tu mensaje aquí..."
                      rows={1}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white/90 backdrop-blur-sm"
                      disabled={isLoading}
                      style={{minHeight: '48px', maxHeight: '120px'}}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement
                        target.style.height = 'auto'
                        target.style.height = `${Math.min(target.scrollHeight, 120)}px`
                      }}
                    />
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={isLoading || !inputMessage.trim()}
                    className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <span className="text-lg">🚀</span>
                    )}
                  </button>
                </div>
                
                <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span>💡 Tip: Pregúntame sobre patrones en tus datos</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Sistema activo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}