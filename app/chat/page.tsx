'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '../components/Sidebar'

export default function ChatPage() {
  const router = useRouter()

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn')
    if (!isLoggedIn) {
      router.push('/login')
    }
  }, [router])
  const [messages, setMessages] = useState<Array<{id: string, text: string, isUser: boolean}>>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

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
        isUser: false
      }

      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Error:', error)
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Error de conexión. Intenta nuevamente.',
        isUser: false
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Chat</h1>
            <p className="text-gray-600">Haz preguntas sobre tus documentos</p>
          </div>
        </div>

        {/* Chat Container */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto h-full">
            <div className="bg-white border border-gray-200 rounded-lg h-full flex flex-col">
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <p className="mb-4">¡Hola! Soy tu asistente de análisis de documentos.</p>
                <p className="text-sm">Pregunta sobre tu archivo Datos_Gonpal_1.xlsx o sube nuevos documentos.</p>
                <div className="mt-4 text-xs text-gray-400">
                  <p>Ejemplos:</p>
                  <p>• "¿Qué insights puedes darme del archivo Datos_Gonpal_1.xlsx?"</p>
                  <p>• "¿Cuáles son las tendencias principales en mis datos?"</p>
                </div>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.isUser
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {message.isUser ? 'Tú' : 'AI Assistant'} • ahora
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                  <p className="text-sm">Escribiendo...</p>
                </div>
              </div>
            )}
                      </div>
          </div>
        </div>
      </div>
    </div>
  )
}