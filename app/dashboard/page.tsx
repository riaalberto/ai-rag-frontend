'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CompleteDashboard() {
  const [userEmail, setUserEmail] = useState('')
  const [currentTime, setCurrentTime] = useState('')
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
    
    setTimeout(() => {
      const responses = [
        'Basándome en los documentos analizados, puedo decirte que los ingresos han aumentado un 23% este trimestre...',
        'He encontrado información relevante en la base de datos. Las métricas de usuario muestran un crecimiento sostenido...',
        'Según los datos procesados por el sistema RAG, las tendencias principales indican una mejora en la retención...',
        'Mi análisis de los documentos muestra patrones interesantes en el comportamiento de los clientes...'
      ]
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      const systemMessage = { type: 'system', content: randomResponse }
      setMessages(prev => [...prev, systemMessage])
    }, 1500)
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
        
        .gradient-bg {
          background: linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%);
          min-height: 100vh;
        }
        
        .header-glass {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .purple-gradient {
          background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
        }
        
        .blue-gradient {
          background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
        }
        
        .green-gradient {
          background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
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
        
        .chat-input {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 12px;
          padding: 12px 16px;
          color: white;
          width: 100%;
          font-size: 16px;
        }
        
        .chat-input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }
        
        .chat-input:focus {
          outline: none;
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
        }
        
        .user-message {
          background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
          color: white;
          padding: 12px 16px;
          border-radius: 18px;
          margin-left: auto;
          max-width: 70%;
          margin-bottom: 16px;
          box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
        }
        
        .system-message {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          color: white;
          padding: 12px 16px;
          border-radius: 18px;
          max-width: 70%;
          margin-bottom: 16px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .stat-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          padding: 20px;
          text-align: center;
          transition: all 0.3s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
        }
        
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .suggested-btn {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 14px 16px;
          border-radius: 12px;
          width: 100%;
          text-align: left;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 12px;
          font-size: 14px;
        }
        
        .suggested-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateX(6px);
          border-color: rgba(139, 92, 246, 0.4);
        }
        
        .action-btn {
          display: block;
          width: 100%;
          padding: 14px 16px;
          border-radius: 12px;
          text-decoration: none;
          text-align: center;
          font-weight: 600;
          margin-bottom: 12px;
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          font-size: 14px;
        }
        
        .action-upload {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.8) 0%, rgba(236, 72, 153, 0.8) 100%);
          color: white;
        }
        
        .action-analytics {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(6, 182, 212, 0.8) 100%);
          color: white;
        }
        
        .action-settings {
          background: linear-gradient(135deg, rgba(107, 114, 128, 0.8) 0%, rgba(75, 85, 99, 0.8) 100%);
          color: white;
        }
        
        .action-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 25px rgba(0, 0, 0, 0.4);
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
        
        .grid-2 {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 30px;
          padding: 30px 0;
        }
        
        .grid-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 24px;
        }
        
        .section-title {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 20px;
          color: white;
        }
        
        .status-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .status-item:last-child {
          border-bottom: none;
        }
        
        .status-label {
          color: rgba(255, 255, 255, 0.9);
          font-size: 14px;
        }
        
        .status-value {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #10b981;
          font-size: 14px;
          font-weight: 500;
        }
        
        @media (max-width: 768px) {
          .grid-2 {
            grid-template-columns: 1fr;
          }
          
          .grid-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="gradient-bg">
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

        <div className="container">
          <div className="grid-2">
            
            {/* Panel Principal - Chat RAG */}
            <div className="glass-card" style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '30px', borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>
                <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>Chat Inteligente RAG</h2>
                <p style={{ opacity: '0.8' }}>Haz preguntas sobre tus documentos y obtén respuestas inteligentes</p>
              </div>
              
              {/* Mensajes */}
              <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
                {messages.map((message, index) => (
                  <div key={index} className={message.type === 'user' ? 'user-message' : 'system-message'}>
                    {message.content}
                  </div>
                ))}
              </div>
              
              {/* Input */}
              <div style={{ padding: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Escribe tu pregunta aquí..."
                    className="chat-input"
                  />
                  <button onClick={handleSendMessage} className="btn-primary">
                    Enviar
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div>
              
              {/* Stats Cards */}
              <div className="grid-stats">
                <div className="stat-card blue-gradient">
                  <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '4px' }}>1,247</div>
                  <div style={{ fontSize: '14px', opacity: '0.9' }}>Documentos</div>
                </div>
                <div className="stat-card green-gradient">
                  <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '4px' }}>98.5%</div>
                  <div style={{ fontSize: '14px', opacity: '0.9' }}>Precisión</div>
                </div>
              </div>

              {/* Sistema Status */}
              <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
                <h3 className="section-title">Estado del Sistema</h3>
                <div>
                  <div className="status-item">
                    <span className="status-label">Base de Datos</span>
                    <div className="status-value">
                      <div className="status-dot"></div>
                      <span>Online</span>
                    </div>
                  </div>
                  <div className="status-item">
                    <span className="status-label">Procesamiento IA</span>
                    <div className="status-value">
                      <div className="status-dot"></div>
                      <span>Activo</span>
                    </div>
                  </div>
                  <div className="status-item">
                    <span className="status-label">Vector Store</span>
                    <div className="status-value">
                      <div className="status-dot"></div>
                      <span>Operativo</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preguntas Sugeridas */}
              <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
                <h3 className="section-title">Preguntas Sugeridas</h3>
                <div>
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => setInputMessage(question)}
                      className="suggested-btn"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <h3 className="section-title">Acciones Rápidas</h3>
                <div>
                  <Link href="/upload" className="action-btn action-upload">
                    📄 Subir Documentos
                  </Link>
                  <Link href="/analytics" className="action-btn action-analytics">
                    📊 Ver Analytics
                  </Link>
                  <Link href="/settings" className="action-btn action-settings">
                    ⚙️ Configuración
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}