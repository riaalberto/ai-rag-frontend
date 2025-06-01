'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ModernAnalyticsPage() {
  const [currentTime, setCurrentTime] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedMetric, setSelectedMetric] = useState('usage')
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

  const handleLogout = () => {
    localStorage.removeItem('userEmail')
    router.push('/login')
  }

  // Datos simulados para analytics
  const analyticsData = {
    overview: {
      totalQueries: 2847,
      avgResponseTime: 1.2,
      successRate: 98.5,
      activeUsers: 156
    },
    recentQueries: [
      { id: 1, query: "¿Cuáles fueron las ventas del Q4?", time: "10:30", accuracy: 96 },
      { id: 2, query: "Analiza el reporte financiero", time: "10:15", accuracy: 94 },
      { id: 3, query: "Tendencias de mercado 2025", time: "09:45", accuracy: 98 },
      { id: 4, query: "Datos de retención de clientes", time: "09:30", accuracy: 92 },
      { id: 5, query: "Comparación con competencia", time: "09:15", accuracy: 89 }
    ],
    topDocuments: [
      { name: "Reporte Financiero Q4.pdf", queries: 89, accuracy: 96 },
      { name: "Análisis de Mercado.docx", queries: 67, accuracy: 94 },
      { name: "Manual de Usuario.pdf", queries: 54, accuracy: 98 },
      { name: "Datos de Ventas.xlsx", queries: 43, accuracy: 92 },
      { name: "Políticas Empresa.pdf", queries: 38, accuracy: 95 }
    ],
    performanceMetrics: [
      { hour: "00:00", queries: 12, avgTime: 1.1 },
      { hour: "03:00", queries: 8, avgTime: 1.0 },
      { hour: "06:00", queries: 23, avgTime: 1.3 },
      { hour: "09:00", queries: 156, avgTime: 1.2 },
      { hour: "12:00", queries: 234, avgTime: 1.4 },
      { hour: "15:00", queries: 189, avgTime: 1.1 },
      { hour: "18:00", queries: 145, avgTime: 1.3 },
      { hour: "21:00", queries: 67, avgTime: 1.2 }
    ]
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
        
        .metric-card {
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
        
        .metric-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
        }
        
        .metric-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
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
        
        .select-input {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          padding: 8px 12px;
          color: white;
          font-size: 14px;
          cursor: pointer;
        }
        
        .select-input:focus {
          outline: none;
          border-color: #8b5cf6;
        }
        
        .query-row {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 12px;
          transition: all 0.3s ease;
        }
        
        .query-row:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(139, 92, 246, 0.3);
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
        
        .chart-container {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 20px;
          margin-top: 20px;
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .accuracy-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .accuracy-high {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }
        
        .accuracy-medium {
          background: rgba(251, 191, 36, 0.2);
          color: #fbbf24;
        }
        
        .accuracy-low {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
        
        @media (max-width: 768px) {
          .metrics-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          
          .analytics-grid {
            grid-template-columns: 1fr !important;
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
            <Link href="/chat" className="nav-link">Chat</Link>
            <Link href="/analytics" className="nav-link active">Analytics</Link>
            <Link href="/upload" className="nav-link">Upload</Link>
            <Link href="/documents" className="nav-link">Documents</Link>
          </div>
        </div>

        <div className="container" style={{ padding: '40px 20px' }}>
          {/* Header Section */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '32px' }}>📊</div>
                <h1 style={{ fontSize: '36px', fontWeight: 'bold' }}>Analytics & Insights</h1>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="select-input"
                >
                  <option value="day">Último día</option>
                  <option value="week">Última semana</option>
                  <option value="month">Último mes</option>
                  <option value="quarter">Último trimestre</option>
                </select>
                <button className="btn-secondary">📥 Exportar</button>
              </div>
            </div>
            <p style={{ fontSize: '18px', opacity: '0.8' }}>
              Métricas de rendimiento y análisis del sistema RAG
            </p>
          </div>

          {/* Metrics Overview */}
          <div className="metrics-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: '20px', 
            marginBottom: '40px' 
          }}>
            <div className="metric-card">
              <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px', color: '#3b82f6' }}>
                {analyticsData.overview.totalQueries.toLocaleString()}
              </div>
              <div style={{ fontSize: '14px', opacity: '0.8', marginBottom: '4px' }}>Total Consultas</div>
              <div style={{ fontSize: '12px', color: '#10b981' }}>+12% vs mes anterior</div>
            </div>
            
            <div className="metric-card">
              <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px', color: '#10b981' }}>
                {analyticsData.overview.avgResponseTime}s
              </div>
              <div style={{ fontSize: '14px', opacity: '0.8', marginBottom: '4px' }}>Tiempo Promedio</div>
              <div style={{ fontSize: '12px', color: '#10b981' }}>-0.3s mejora</div>
            </div>
            
            <div className="metric-card">
              <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px', color: '#ec4899' }}>
                {analyticsData.overview.successRate}%
              </div>
              <div style={{ fontSize: '14px', opacity: '0.8', marginBottom: '4px' }}>Tasa de Éxito</div>
              <div style={{ fontSize: '12px', color: '#10b981' }}>+2.1% mejora</div>
            </div>
            
            <div className="metric-card">
              <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px', color: '#fbbf24' }}>
                {analyticsData.overview.activeUsers}
              </div>
              <div style={{ fontSize: '14px', opacity: '0.8', marginBottom: '4px' }}>Usuarios Activos</div>
              <div style={{ fontSize: '12px', color: '#10b981' }}>+8 nuevos hoy</div>
            </div>
          </div>

          <div className="analytics-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
            
            {/* Performance Chart */}
            <div className="glass-card" style={{ padding: '30px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Rendimiento por Hora</h2>
              
              <div className="chart-container">
                <div style={{ textAlign: 'center', opacity: '0.7' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📈</div>
                  <div>Gráfico de consultas por hora</div>
                  <div style={{ fontSize: '14px', marginTop: '8px' }}>
                    Pico: 234 consultas a las 12:00
                  </div>
                </div>
              </div>
              
              <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                {analyticsData.performanceMetrics.slice(0, 4).map((metric, index) => (
                  <div key={index} style={{ textAlign: 'center', padding: '12px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#8b5cf6' }}>{metric.queries}</div>
                    <div style={{ fontSize: '12px', opacity: '0.8' }}>{metric.hour}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Documents */}
            <div className="glass-card" style={{ padding: '30px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>Documentos Más Consultados</h2>
              
              <div>
                {analyticsData.topDocuments.map((doc, index) => (
                  <div key={index} style={{ 
                    background: 'rgba(255, 255, 255, 0.05)', 
                    borderRadius: '12px', 
                    padding: '16px', 
                    marginBottom: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '600' }}>{doc.name}</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#8b5cf6' }}>{doc.queries}</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '12px', opacity: '0.7' }}>consultas</div>
                      <span className={`accuracy-badge ${doc.accuracy >= 95 ? 'accuracy-high' : doc.accuracy >= 90 ? 'accuracy-medium' : 'accuracy-low'}`}>
                        {doc.accuracy}% precisión
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Queries */}
          <div className="glass-card" style={{ padding: '30px', marginTop: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Consultas Recientes</h2>
              <button className="btn-secondary">Ver todas</button>
            </div>
            
            <div>
              {analyticsData.recentQueries.map((query, index) => (
                <div key={query.id} className="query-row">
                  <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr', gap: '16px', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '600', marginBottom: '4px' }}>{query.query}</div>
                      <div style={{ fontSize: '14px', opacity: '0.7' }}>Consulta #{query.id}</div>
                    </div>
                    
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '14px', opacity: '0.8' }}>{query.time}</div>
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      <span className={`accuracy-badge ${query.accuracy >= 95 ? 'accuracy-high' : query.accuracy >= 90 ? 'accuracy-medium' : 'accuracy-low'}`}>
                        {query.accuracy}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}