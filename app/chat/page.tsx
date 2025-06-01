'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ModernChatPage() {
  const [currentTime, setCurrentTime] = useState('')
  const [messages, setMessages] = useState([
    { 
      type: 'system', 
      content: '¡Hola! Soy tu asistente RAG inteligente. Puedo ayudarte a analizar documentos, buscar información específica y responder preguntas basándome en tu base de conocimiento. ¿En qué te puedo ayudar hoy?',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [chatSessions, setChatSessions] = useState([
    { id: 1, name: 'Análisis Financiero Q4', date: '2024-12-15', messages: 15 },
    { id: 2, name: 'Consulta sobre Ventas', date: '2024-12-14', messages: 8 },
    { id: 3, name: 'Revisión de Políticas', date: '2024-12-13', messages: 22 }
  ])
  const [activeSession, setActiveSession] = useState(1)
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
    scrollToBottom()
  }, [messages])

  const handleLogout = () => {
    localStorage.removeItem('userEmail')
    router.push('/login')
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return
    
    const userMessage = { 
      type: 'user', 
      content: inputMessage,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)
    
    // Simular respuesta RAG más realista
    setTimeout(() => {
      const responses = [
        {
          content: `Basándome en el análisis de los documentos financieros, puedo informarte que los ingresos del Q4 2024 muestran un crecimiento del 23% comparado con el mismo período del año anterior. 

Los principales factores que contribuyeron a este crecimiento fueron:
• Expansión en mercados internacionales (+15%)
• Nuevos productos digitales (+8%)
• Optimización de costos operativos

¿Te gustaría que profundice en algún aspecto específico?`,
          timestamp: new Date()
        },
        {
          content: `He encontrado información relevante en la base de datos de conocimiento sobre las métricas de ventas:

**Resumen de Ventas Q4 2024:**
- Ventas totales: $2.4M (+18% vs Q3)
- Nuevos clientes: 347 (+25%)
- Tasa de conversión: 12.3% (+2.1%)
- Ticket promedio: $6,920 (+5%)

Los sectores con mejor rendimiento fueron tecnología y servicios financieros. ¿Necesitas detalles sobre algún sector específico?`,
          timestamp: new Date()
        },
        {
          content: `Según el análisis de los documentos procesados, las tendencias principales para 2025 incluyen:

🔹 **Digitalización Acelerada**: 78% de las empresas planean incrementar inversión en tecnología
🔹 **Sostenibilidad**: Enfoque en ESG y prácticas ambientales responsables  
🔹 **IA y Automatización**: Adopción masiva de herramientas inteligentes
🔹 **Trabajo Híbrido**: Consolidación de modelos flexibles

Esta información se basa en el análisis de 15 reportes industriales y estudios de mercado en nuestra base de datos.`,
          timestamp: new Date()
        }
      ]
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      const systemMessage = { type: 'system', ...randomResponse }
      
      setMessages(prev => [...prev, systemMessage])
      setIsTyping(false)
    }, 2000)
  }

  const suggestedQuestions = [
    "¿Cuáles fueron los resultados financieros del último trimestre?",
    "Analiza las tendencias de ventas por región",
    "¿Qué insights puedes extraer sobre retención de clientes?",
    "Busca información sobre la competencia en el mercado",
    "¿Cuáles son las proyecciones para el próximo año?",
    "Analiza el rendimiento de los nuevos productos"
  ]

  const createNewSession = () => {
    const newSession = {
      id: Date.now(),
      name: `Nueva Conversación ${chatSessions.length + 1}`,
      date: new Date().toISOString().split('T')[0],
      messages: 0
    }
    setChatSessions(prev => [newSession, ...prev])
    setActiveSession(newSession.id)
    setMessages([{
      type: 'system',
      content: '¡Nueva conversación iniciada! ¿En qué puedo ayudarte?',
      timestamp: new Date()
    }])
  }

  return (
    <>
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          background: linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%);
          min-height: 100vh;
          color: white;
        }
        
        .glass-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        
        .header-glass {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .user-message {
          background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
          color: white;
          padding: 16px 20px;
          border-radius: 20px 20px 4px 20px;
          margin-left: auto;
          max-width: 70%;
          margin-bottom: 16px;
          box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
          word-wrap: break-word;
        }
        
        .system-message {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          color: white;
          padding: 16px 20px;
          border-radius: 20px 20px 20px 4px;
          max-width: 80%;
          margin-bottom: 16px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          word-wrap: break-word;
          line-height: 1.6;
        }
        
        .chat-input {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 16px;
          padding: 16px 20px;
          color: white;
          width: 100%;
          font-size: 16px;
          resize: none;
          min-height: 60px;
          max-height: 120px;
        }
        
        .chat-input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }
        
        .chat-input:focus {
          outline: none;
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
          border: none;
          color: white;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          transform: translateY(0);
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(139, 92, 246, 0.4);
        }
        
        .btn-secondary {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        
        .session-item {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .session-item:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(139, 92, 246, 0.3);
        }
        
        .session-item.active {
          background: rgba(139, 92, 246, 0.2);
          border-color: rgba(139, 92, 246, 0.4);
        }
        
        .suggested-question {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          padding: 12px 16px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
          text-align: left;
          width: 100%;
          color: white;
        }
        
        .suggested-question:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(139, 92, 246, 0.4);
          transform: translateX(4px);
        }
        
        .nav-link {
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          padding: 8px 16px;
          border-radius: 8px;
          transition: all 0.3s ease;
          margin-right: 12px;
        }
        
        .nav-link:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }
        
        .nav-link.active {
          background: rgba(139, 92, 246, 0.3);
          color: white;
        }
        
        .typing-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 16px 20px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          max-width: 120px;
          margin-bottom: 16px;
        }
        
        .typing-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.6);
          animation: typing 1.4s infinite ease-in-out;
        }
        
        .typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .typing-dot:nth-child(2) { animation-delay: -0.16s; }
        
        @keyframes typing {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
        
        @media (max-width: 768px) {
          .chat-layout {
            grid-template-columns: 1fr !important;
          }
          
          .sidebar {
            display: none;
          }
        }
      `}</style>

      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%)', minHeight: '100vh' }}>
        {/* Header */}
        <header className="header-glass">
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '70px' }}>
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
                <button onClick={handleLogout} className="btn-secondary">
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <div className="container">
          <div style={{ padding: '20px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <Link href="/dashboard" className="nav-link">Dashboard</Link>
            <Link href="/chat" className="nav-link active">Chat</Link>
            <Link href="/analytics" className="nav-link">Analytics</Link>
            <Link href="/upload" className="nav-link">Upload</Link>
            <Link href="/documents" className="nav-link">Documents</Link>
          </div>
        </div>

        <div className="container" style={{ padding: '30px 20px' }}>
          <div className="chat-layout" style={{ display: 'grid', gridTemplateColumns: '300px 1fr 300px', gap: '30px', height: 'calc(100vh - 200px)' }}>
            
            {/* Sidebar - Sessions */}
            <div className="sidebar">
              <div className="glass-card" style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '20px' }}>
                  <button onClick={createNewSession} className="btn-primary" style={{ width: '100%' }}>
                    ➕ Nueva Conversación
                  </button>
                </div>
                
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Conversaciones</h3>
                
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {chatSessions.map((session) => (
                    <div
                      key={session.id}
                      className={`session-item ${activeSession === session.id ? 'active' : ''}`}
                      onClick={() => setActiveSession(session.id)}
                    >
                      <div style={{ fontWeight: '600', marginBottom: '4px', fontSize: '14px' }}>{session.name}</div>
                      <div style={{ fontSize: '12px', opacity: '0.7' }}>
                        {session.messages} mensajes • {new Date(session.date).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Chat Main */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ padding: '30px 30px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>💬 Chat Inteligente RAG</h2>
                <p style={{ opacity: '0.8' }}>Haz preguntas sobre tus documentos y obtén respuestas basadas en IA</p>
              </div>
              
              {/* Messages */}
              <div style={{ flex: 1, padding: '20px 30px', overflowY: 'auto' }}>
                {messages.map((message, index) => (
                  <div key={index}>
                    <div className={message.type === 'user' ? 'user-message' : 'system-message'}>
                      {message.content}
                      <div style={{ fontSize: '11px', opacity: '0.7', marginTop: '8px' }}>
                        {message.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="typing-indicator">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
              
              {/* Input */}
              <div style={{ padding: '20px 30px', borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'end' }}>
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    placeholder="Escribe tu pregunta aquí... (Shift + Enter para nueva línea)"
                    className="chat-input"
                  />
                  <button 
                    onClick={handleSendMessage} 
                    className="btn-primary"
                    disabled={!inputMessage.trim() || isTyping}
                    style={{ 
                      opacity: (!inputMessage.trim() || isTyping) ? 0.5 : 1,
                      cursor: (!inputMessage.trim() || isTyping) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Enviar
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar - Suggestions */}
            <div className="sidebar">
              <div className="glass-card" style={{ padding: '24px', height: '100%' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>💡 Preguntas Sugeridas</h3>
                
                <div>
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => setInputMessage(question)}
                      className="suggested-question"
                    >
                      {question}
                    </button>
                  ))}
                </div>
                
                <div style={{ marginTop: '30px', padding: '16px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>💡 Consejo</div>
                  <div style={{ fontSize: '13px', opacity: '0.9', lineHeight: '1.4' }}>
                    Sé específico en tus preguntas para obtener respuestas más precisas. Puedo analizar datos, comparar información y generar insights basados en tus documentos.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}