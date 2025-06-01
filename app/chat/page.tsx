'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Conditional Supabase import
let supabase = null

const initSupabase = async () => {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('⚠️ Supabase credentials not configured')
      return null
    }

    const { createClient } = await import('@supabase/supabase-js')
    return createClient(supabaseUrl, supabaseAnonKey)
  } catch (error) {
    console.error('❌ Error initializing Supabase:', error)
    return null
  }
}

export default function CompleteRAGChat() {
  const [currentTime, setCurrentTime] = useState('')
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: '¡Hola! Soy tu asistente RAG conectado a tu base de datos real de Supabase. Puedo responder preguntas específicas sobre tus documentos, incluyendo artículos del CFF, manuales, FAQ y políticas. ¿En qué puedo ayudarte?',
      timestamp: new Date().toLocaleTimeString()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [supabaseClient, setSupabaseClient] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState('connecting')
  const messagesEndRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
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

  useEffect(() => {
    initializeSupabase()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const initializeSupabase = async () => {
    try {
      setConnectionStatus('connecting')
      console.log('🔄 Inicializando conexión Supabase...')
      
      const client = await initSupabase()
      setSupabaseClient(client)
      
      if (client) {
        // Test connection
        const { data, error } = await client
          .from('documents')
          .select('count')
          .limit(1)
        
        if (error) {
          console.error('❌ Error de conexión:', error)
          setConnectionStatus('error')
        } else {
          setConnectionStatus('connected')
          console.log('✅ Chat RAG conectado a Supabase exitosamente')
        }
      } else {
        setConnectionStatus('mock')
        console.log('⚠️ Chat usando modo demostración')
      }
    } catch (error) {
      console.error('❌ Error conectando chat a Supabase:', error)
      setConnectionStatus('error')
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const searchInDocuments = async (query) => {
    if (!supabaseClient) {
      console.warn('⚠️ Cliente Supabase no disponible')
      return null
    }

    try {
      console.log('🔍 Buscando en documentos:', query)
      
      // Buscar en el contenido de los documentos con múltiples estrategias
      const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2)
      
      let searchQuery = supabaseClient
        .from('documents')
        .select('name, content')
      
      // Si es una búsqueda específica de artículos CFF
      if (query.toLowerCase().includes('articulo') || query.toLowerCase().includes('artículo')) {
        searchQuery = searchQuery.or('content.ilike.%artículo%,content.ilike.%código fiscal%,name.ilike.%cff%')
      } else {
        // Búsqueda general en contenido
        const searchPattern = searchTerms.map(term => `content.ilike.%${term}%`).join(',')
        searchQuery = searchQuery.or(searchPattern)
      }
      
      const { data, error } = await searchQuery.limit(5)

      if (error) {
        console.error('❌ Error buscando:', error)
        return null
      }

      console.log('📊 Documentos encontrados:', data?.length || 0)
      return data
    } catch (error) {
      console.error('❌ Error en búsqueda:', error)
      return null
    }
  }

  const extractArticleContent = (content, articleNumber) => {
    if (!content) return null
    
    try {
      // Buscar el artículo específico con diferentes patrones
      const patterns = [
        new RegExp(`art[íi]culo\\s*${articleNumber}[^\\d].*?(?=art[íi]culo\\s*\\d|$)`, 'is'),
        new RegExp(`art\\.?\\s*${articleNumber}[^\\d].*?(?=art\\.?\\s*\\d|$)`, 'is'),
        new RegExp(`${articleNumber}\\.[^\\d].*?(?=\\d+\\.|$)`, 'is')
      ]
      
      for (const pattern of patterns) {
        const match = content.match(pattern)
        if (match) {
          return match[0].trim()
        }
      }
      
      return null
    } catch (error) {
      console.error('❌ Error extrayendo artículo:', error)
      return null
    }
  }

  const generateRAGResponse = async (query, documents) => {
    if (!documents || documents.length === 0) {
      return `No encontré información específica sobre "${query}" en tu base de datos. 

📚 **Documentos disponibles:**
- Datos_Gonpal_1.xlsx
- ANALYSIS_Datos_Gonpal_1.xlsx  
- FAQ_Sistema.txt
- Manual_Usuario.pdf
- CFF.pdf
- Guia_Procesos.pdf
- Politicas_Empresa.docx

¿Podrías ser más específico sobre qué información necesitas de estos documentos?`
    }

    // Buscar específicamente artículos del CFF
    const articleMatch = query.match(/articulo\s*(\d+)/i) || query.match(/art[íi]culo\s*(\d+)/i)
    
    if (articleMatch && query.toLowerCase().includes('cff')) {
      const articleNum = articleMatch[1]
      const cffDoc = documents.find(doc => 
        doc.name.toLowerCase().includes('cff') || 
        doc.content?.toLowerCase().includes('codigo fiscal') ||
        doc.content?.toLowerCase().includes('código fiscal')
      )
      
      if (cffDoc) {
        const articleContent = extractArticleContent(cffDoc.content, articleNum)
        
        if (articleContent) {
          const truncatedContent = articleContent.length > 800 
            ? articleContent.substring(0, 800) + '...' 
            : articleContent
            
          return `📋 **Artículo ${articleNum} del Código Fiscal de la Federación:**

${truncatedContent}

*📄 Fuente: ${cffDoc.name}*

¿Te gustaría que busque algún artículo específico relacionado o necesitas más información sobre este tema?`
        } else {
          return `❌ No encontré el artículo ${articleNum} en el documento CFF.pdf. 

El documento CFF está disponible pero no pude localizar ese artículo específico. ¿Podrías verificar el número del artículo o intentar con una búsqueda más general sobre el tema que te interesa?`
        }
      }
    }

    // Respuesta general basada en contexto de documentos encontrados
    const context = documents.map(doc => {
      const preview = doc.content ? doc.content.substring(0, 300) : 'Sin contenido disponible'
      return `📄 **${doc.name}**:\n${preview}...`
    }).join('\n\n')

    return `📊 **Información encontrada en tus documentos:**

${context}

🔍 **¿Te gustaría que:**
- Busque información más específica en alguno de estos documentos?
- Extraiga algún artículo particular del CFF?
- Analice algún aspecto específico de estos contenidos?`
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString()
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = inputMessage
    setInputMessage('')
    setIsLoading(true)

    try {
      console.log('🚀 Procesando pregunta:', currentInput)
      
      // Buscar en documentos reales
      const documents = await searchInDocuments(currentInput)
      
      // Generar respuesta RAG
      const response = await generateRAGResponse(currentInput, documents)

      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: response,
        timestamp: new Date().toLocaleTimeString()
      }

      setMessages(prev => [...prev, assistantMessage])
      console.log('✅ Respuesta RAG generada exitosamente')
      
    } catch (error) {
      console.error('❌ Error generando respuesta:', error)
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: '❌ Disculpa, hubo un error al procesar tu pregunta. El sistema está conectado a Supabase pero ocurrió un problema temporal. ¿Podrías intentarlo de nuevo?',
        timestamp: new Date().toLocaleTimeString()
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSuggestedQuestion = (question) => {
    setInputMessage(question)
    // Auto-send suggested questions
    setTimeout(() => {
      handleSendMessage()
    }, 100)
  }

  const suggestedQuestions = [
    "¿Qué dice el artículo 32 del CFF?",
    "Explícame el contenido del Manual de Usuario",
    "¿Qué información hay en el FAQ del Sistema?",
    "Resumen de las políticas de la empresa",
    "Artículo 42 del CFF",
    "¿Qué contiene Guía de Procesos?"
  ]

  const handleLogout = () => {
    localStorage.removeItem('userEmail')
    router.push('/login')
  }

  const getConnectionBadge = () => {
    const styles = {
      connecting: { bg: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24', text: '🔄 Conectando...', pulse: true },
      connected: { bg: 'rgba(16, 185, 129, 0.2)', color: '#10b981', text: '🔗 RAG Conectado', pulse: false },
      mock: { bg: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', text: '📋 Demo', pulse: false },
      error: { bg: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', text: '❌ Error', pulse: false }
    }
    
    const style = styles[connectionStatus]
    return (
      <div style={{
        background: style.bg,
        color: style.color,
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        animation: style.pulse ? 'pulse 2s infinite' : 'none'
      }}>
        {style.text}
      </div>
    )
  }

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%)', 
      minHeight: '100vh',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
    }}>
      {/* Header */}
      <header style={{ 
        background: 'rgba(255, 255, 255, 0.1)', 
        backdropFilter: 'blur(20px)', 
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '20px 0'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: 'bold'
              }}>
                AI
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Sistema RAG Avanzado</h1>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <span style={{ fontSize: '14px', opacity: '0.8' }}>{currentTime}</span>
              <button
                onClick={handleLogout}
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ padding: '20px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Link href="/dashboard" style={{ color: 'rgba(255, 255, 255, 0.8)', textDecoration: 'none', padding: '8px 16px', borderRadius: '8px', marginRight: '12px' }}>Dashboard</Link>
          <Link href="/chat" style={{ background: 'rgba(139, 92, 246, 0.3)', color: 'white', textDecoration: 'none', padding: '8px 16px', borderRadius: '8px', marginRight: '12px' }}>Chat</Link>
          <Link href="/analyzer" style={{ color: 'rgba(255, 255, 255, 0.8)', textDecoration: 'none', padding: '8px 16px', borderRadius: '8px', marginRight: '12px' }}>📊 Excel Analyzer</Link>
          <Link href="/analytics" style={{ color: 'rgba(255, 255, 255, 0.8)', textDecoration: 'none', padding: '8px 16px', borderRadius: '8px', marginRight: '12px' }}>Analytics</Link>
          <Link href="/upload" style={{ color: 'rgba(255, 255, 255, 0.8)', textDecoration: 'none', padding: '8px 16px', borderRadius: '8px', marginRight: '12px' }}>Upload</Link>
          <Link href="/documents" style={{ color: 'rgba(255, 255, 255, 0.8)', textDecoration: 'none', padding: '8px 16px', borderRadius: '8px', marginRight: '12px' }}>Documents</Link>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        
        {/* Header Section */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '32px' }}>💬</div>
              <h1 style={{ fontSize: '36px', fontWeight: 'bold' }}>Chat RAG Inteligente</h1>
              {getConnectionBadge()}
            </div>
          </div>
          <p style={{ fontSize: '18px', opacity: '0.8' }}>
            {connectionStatus === 'connected' 
              ? '🔗 Conectado a Supabase: peeljvqscrkqmdbvfeag.supabase.co - Consulta tus 7 documentos reales'
              : connectionStatus === 'mock' 
                ? '📋 Modo demostración - Configura Supabase para acceso real'
                : connectionStatus === 'error'
                ? '❌ Error de conexión - Verifica configuración de Supabase'
                : '🔄 Conectando a base de datos'
            }
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px' }}>
          
          {/* Chat Area */}
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            backdropFilter: 'blur(20px)', 
            border: '1px solid rgba(255, 255, 255, 0.2)', 
            borderRadius: '20px', 
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            padding: '30px',
            height: '600px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
              🤖 Conversación RAG Real
            </h2>
            
            {/* Messages */}
            <div style={{ 
              flex: 1, 
              overflowY: 'auto', 
              marginBottom: '20px',
              padding: '10px'
            }}>
              {messages.map((message) => (
                <div key={message.id} style={{
                  display: 'flex',
                  justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    background: message.type === 'user' 
                      ? 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)'
                      : 'rgba(255, 255, 255, 0.1)',
                    padding: '12px 16px',
                    borderRadius: '16px',
                    maxWidth: '80%',
                    border: message.type === 'assistant' ? '1px solid rgba(255, 255, 255, 0.2)' : 'none'
                  }}>
                    <div style={{ fontSize: '14px', marginBottom: '4px', whiteSpace: 'pre-line' }}>
                      {message.content}
                    </div>
                    <div style={{ fontSize: '10px', opacity: '0.6' }}>
                      {message.timestamp}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '16px' }}>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    padding: '12px 16px',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    <div style={{ fontSize: '14px' }}>
                      🔍 Buscando en tu base de datos de Supabase...
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Pregunta sobre tus documentos (ej: artículo 32 del CFF)..."
                disabled={isLoading}
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  color: 'white',
                  fontSize: '16px'
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
                style={{
                  background: isLoading || !inputMessage.trim() 
                    ? 'rgba(139, 92, 246, 0.5)' 
                    : 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                  border: 'none',
                  color: 'white',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  cursor: isLoading || !inputMessage.trim() ? 'not-allowed' : 'pointer',
                  fontWeight: '600'
                }}
              >
                {isLoading ? '⏳' : '🚀'}
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Suggested Questions */}
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              backdropFilter: 'blur(20px)', 
              border: '1px solid rgba(255, 255, 255, 0.2)', 
              borderRadius: '20px', 
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              padding: '24px', 
              marginBottom: '24px' 
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>
                💡 Preguntas Sugeridas
              </h3>
              
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedQuestion(question)}
                  disabled={isLoading}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    padding: '12px',
                    color: 'white',
                    width: '100%',
                    marginBottom: '12px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    textAlign: 'left' as const,
                    fontSize: '14px',
                    transition: 'all 0.3s ease',
                    opacity: isLoading ? 0.5 : 1
                  }}
                  onMouseOver={(e) => {
                    if (!isLoading) {
                      const target = e.target as HTMLButtonElement
                      target.style.background = 'rgba(255, 255, 255, 0.2)'
                    }
                  }}
                  onMouseOut={(e) => {
                    const target = e.target as HTMLButtonElement
                    target.style.background = 'rgba(255, 255, 255, 0.1)'
                  }}
                >
                  {question}
                </button>
              ))}
            </div>

            {/* Session Info */}
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              backdropFilter: 'blur(20px)', 
              border: '1px solid rgba(255, 255, 255, 0.2)', 
              borderRadius: '20px', 
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              padding: '24px' 
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>
                📊 Estado de la Sesión
              </h3>
              
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    background: connectionStatus === 'connected' ? '#10b981' : connectionStatus === 'connecting' ? '#fbbf24' : '#ef4444' 
                  }}></div>
                  <span style={{ fontSize: '14px' }}>
                    {connectionStatus === 'connected' ? 'Conectado a Supabase' : 
                     connectionStatus === 'connecting' ? 'Conectando...' : 
                     connectionStatus === 'error' ? 'Error de conexión' : 'Modo demostración'}
                  </span>
                </div>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                  <span style={{ fontSize: '14px' }}>Mensajes: {messages.length}</span>
                </div>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                  <span style={{ fontSize: '14px' }}>RAG Activo</span>
                </div>
              </div>

              {connectionStatus === 'connected' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                    <span style={{ fontSize: '14px' }}>7 documentos disponibles</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}