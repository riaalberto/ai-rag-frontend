'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import { Navbar } from '@/components/layout/Navbar'
import Link from 'next/link'

export default function ChatPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Array<{id: string, text: string, sender: 'user' | 'bot', sources?: string[]}>>([])
  const [input, setInput] = useState('')

  if (!user) {
    return <div>Loading...</div>
  }

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage = { id: Date.now().toString(), text: input, sender: 'user' as const }
    setMessages(prev => [...prev, userMessage])
    setInput('')

    console.log('🔄 Enviando mensaje al RAG:', input)
    console.log('👤 Usuario completo:', user)
    console.log('🆔 user_id específico:', user?.id)

    try {
      console.log('📡 Haciendo fetch a RAG service...')
      console.log('🧪 Variable entorno:', process.env.NEXT_PUBLIC_RAG_SERVICE_URL)
      console.log('🌐 Conectando a Railway:', 'https://fastapi-service-production-4f6c.up.railway.app/chat')
      
      // ✅ FETCH DIRECTO A RAILWAY - URL CORREGIDA
      const response = await fetch('https://fastapi-service-production-4f6c.up.railway.app/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: input,
          user_id: '119f7084-be9e-416f-81d6-3ffeadb062d5'  // ← Usar UUID real del usuario
        })
      })

      console.log('📥 Response status:', response.status)
      console.log('📋 Response headers:', response.headers)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ API Error:', errorText)
        throw new Error(`Error ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log('✅ Respuesta exitosa de Railway:', data)
      console.log('🔍 Contenido de data.response:', data.response)
      console.log('📋 Fuentes disponibles:', data.sources)
      
      // 🔧 FIX PRINCIPAL: Cambiar data.answer por data.response
      let botMessageText = data.response || 'Lo siento, no pude procesar tu pregunta.'
      
      // ✅ MEJORAR RESPUESTA: Agregar información de fuentes si están disponibles
      if (data.sources && data.sources.length > 0) {
        botMessageText += `\n\n📄 Fuentes: ${data.sources.join(', ')}`
      }
      
      // ✅ AGREGAR INFO DE PROCESADOR SI ESTÁ DISPONIBLE
      if (data.processor_used) {
        botMessageText += `\n🔧 Procesado con: ${data.processor_used}`
      }
      
      // ✅ MOSTRAR MODO DE ANÁLISIS SI ESTÁ ACTIVO
      if (data.analysis_mode) {
        botMessageText += `\n📊 Modo análisis: Activado`
      }
      
      const botMessage = { 
        id: (Date.now() + 1).toString(), 
        text: botMessageText,
        sender: 'bot' as const,
        sources: data.sources || []
      }
      
      console.log('🤖 Bot message creado con fix:', botMessage)
      setMessages(prev => [...prev, botMessage])
      console.log('📋 Mensaje agregado exitosamente')
      
    } catch (error) {
      console.error('❌ Error del RAG:', error)
      const errorMessage = { 
        id: (Date.now() + 1).toString(), 
        text: 'Error de conexión. Verifica que el RAG service esté funcionando.', 
        sender: 'bot' as const 
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium">
            ← Volver al Dashboard
          </Link>
        </div>
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">💬 Chat RAG</h1>
          <p className="text-gray-600">Haz preguntas sobre tus documentos y obtén respuestas inteligentes</p>
        </div>

        {/* Área de chat mejorada */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 h-[600px] flex flex-col">
          {/* Header del chat */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-xl">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
              <span className="font-medium">AI Assistant - Arquitectura Modular ✨</span>
            </div>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🤖</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">¡Hola! Soy tu asistente RAG</h3>
                <p className="text-gray-500">Conectado a Railway con arquitectura modular.</p>
                <p className="text-sm text-blue-600 mt-2">✅ Excel Processor disponible</p>
                <p className="text-sm text-green-600 mt-1">📊 Datos_Gonpal_1.xlsx analizado</p>
              </div>
            ) : (
              messages.map(message => (
                <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    message.sender === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-md' 
                      : 'bg-gray-100 text-gray-900 rounded-bl-md'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.sender === 'user' ? 'Tú' : 'AI Assistant'} • ahora
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input mejorado */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-500"
                placeholder="Pregunta sobre tus documentos..."
              />
              <button 
                onClick={sendMessage}
                disabled={!input.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                Enviar
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              🌐 Arquitectura Modular • 📊 Excel Processor • 💡 Pregunta sobre Datos_Gonpal_1.xlsx
            </p>
          </div>
        </div>

        {/* Sugerencias de ejemplo actualizadas */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Preguntas de ejemplo:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              "¿Qué insights puedes darme del archivo Datos_Gonpal_1.xlsx?",
              "¿Qué dice el artículo 32 del CFF?",
              "¿Cuáles son los patrones en mis datos de Gonpal?",
              "¿Qué gráficas se generaron del análisis Excel?"
            ].map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setInput(suggestion)}
                className="text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all text-sm text-gray-700"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}