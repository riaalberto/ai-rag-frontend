'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DashboardWithoutChat() {
  const [userEmail, setUserEmail] = useState('')
  const [currentTime, setCurrentTime] = useState('')
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

  const handleLogout = () => {
    localStorage.removeItem('userEmail')
    router.push('/login')
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
        
        .stat-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          padding: 24px;
          text-align: center;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
        }
        
        .stat-card.blue::before {
          background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
        }
        
        .stat-card.green::before {
          background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
        }
        
        .stat-card.purple::before {
          background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
        }
        
        .stat-card.yellow::before {
          background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
        }
        
        .stat-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
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
        
        .action-btn {
          display: block;
          width: 100%;
          padding: 16px 20px;
          border-radius: 16px;
          text-decoration: none;
          text-align: center;
          font-weight: 600;
          margin-bottom: 16px;
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          font-size: 16px;
        }
        
        .action-chat {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.8) 0%, rgba(236, 72, 153, 0.8) 100%);
          color: white;
        }
        
        .action-analyzer {
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.8) 0%, rgba(124, 58, 237, 0.8) 100%);
          color: white;
        }
        
        .action-upload {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(6, 182, 212, 0.8) 100%);
          color: white;
        }
        
        .action-analytics {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.8) 0%, rgba(52, 211, 153, 0.8) 100%);
          color: white;
        }
        
        .action-documents {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.8) 0%, rgba(251, 191, 36, 0.8) 100%);
          color: white;
        }
        
        .action-btn:hover {
          transform: translateY(-4px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
        }
        
        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #10b981;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
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
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
        
        @media (max-width: 768px) {
          .main-grid {
            grid-template-columns: 1fr !important;
          }
          
          .stats-grid {
            grid-template-columns: 1fr 1fr !important;
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
            <Link href="/dashboard" className="nav-link active">Dashboard</Link>
            <Link href="/chat" className="nav-link">Chat</Link>
            <Link href="/analyzer" className="nav-link">📊 Excel Analyzer</Link>
            <Link href="/analytics" className="nav-link">Analytics</Link>
            <Link href="/upload" className="nav-link">Upload</Link>
            <Link href="/documents" className="nav-link">Documents</Link>
          </div>
        </div>

        <div className="container" style={{ padding: '40px 20px' }}>
          
          {/* Welcome Section */}
          <div style={{ marginBottom: '40px' }}>
            <h1 style={{ fontSize: '42px', fontWeight: 'bold', marginBottom: '16px' }}>
              Dashboard Principal
            </h1>
            <p style={{ fontSize: '20px', opacity: '0.8' }}>
              Bienvenido, {userEmail.split('@')[0]}. Aquí tienes un resumen de tu sistema RAG.
            </p>
          </div>

          <div className="main-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px' }}>
            
            {/* Main Content */}
            <div>
              {/* Key Metrics */}
              <div style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px' }}>Métricas Principales</h2>
                
                <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                  <div className="stat-card blue">
                    <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '12px', color: '#3b82f6' }}>1,247</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Documentos Procesados</div>
                    <div style={{ fontSize: '14px', opacity: '0.8' }}>+23% este mes</div>
                  </div>
                  
                  <div className="stat-card green">
                    <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '12px', color: '#10b981' }}>98.5%</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Precisión RAG</div>
                    <div style={{ fontSize: '14px', opacity: '0.8' }}>+2.1% mejora</div>
                  </div>
                  
                  <div className="stat-card purple">
                    <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '12px', color: '#8b5cf6' }}>2,847</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Consultas Totales</div>
                    <div style={{ fontSize: '14px', opacity: '0.8' }}>+156 hoy</div>
                  </div>
                  
                  <div className="stat-card yellow">
                    <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '12px', color: '#f59e0b' }}>1.2s</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Tiempo Respuesta</div>
                    <div style={{ fontSize: '14px', opacity: '0.8' }}>-0.3s optimización</div>
                  </div>
                </div>
              </div>

              {/* System Status */}
              <div className="glass-card" style={{ padding: '30px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>Estado del Sistema</h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                  <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                      <div className="status-dot"></div>
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Base de Datos</div>
                    <div style={{ fontSize: '14px', color: '#10b981' }}>Online</div>
                  </div>
                  
                  <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                      <div className="status-dot"></div>
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Procesamiento IA</div>
                    <div style={{ fontSize: '14px', color: '#10b981' }}>Activo</div>
                  </div>
                  
                  <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                      <div className="status-dot"></div>
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Vector Store</div>
                    <div style={{ fontSize: '14px', color: '#10b981' }}>Operativo</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Quick Actions */}
            <div>
              <div className="glass-card" style={{ padding: '30px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>Acciones Rápidas</h2>
                
                <div>
                  <Link href="/chat" className="action-btn action-chat">
                    💬 Iniciar Chat RAG
                  </Link>
                  
                  <Link href="/analyzer" className="action-btn action-analyzer">
                    📊 Excel Analyzer
                  </Link>
                  
                  <Link href="/upload" className="action-btn action-upload">
                    📄 Subir Documentos
                  </Link>
                  
                  <Link href="/analytics" className="action-btn action-analytics">
                    📊 Ver Analytics
                  </Link>
                  
                  <Link href="/documents" className="action-btn action-documents">
                    📋 Gestionar Documentos
                  </Link>
                </div>
                
                {/* Recent Activity */}
                <div style={{ marginTop: '30px', padding: '20px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Actividad Reciente</h3>
                  
                  <div style={{ fontSize: '14px', opacity: '0.8', lineHeight: '1.6' }}>
                    <div style={{ marginBottom: '8px' }}>• 3 documentos procesados</div>
                    <div style={{ marginBottom: '8px' }}>• 15 consultas realizadas</div>
                    <div style={{ marginBottom: '8px' }}>• Sistema optimizado</div>
                    <div>• Backup completado</div>
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