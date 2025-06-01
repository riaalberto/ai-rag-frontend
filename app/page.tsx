'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ModernLandingPage() {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Simular carga inicial
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  const handleGetStarted = () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn')
    
    if (isLoggedIn) {
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }

  const features = [
    {
      icon: '🧠',
      title: 'Inteligencia Artificial Avanzada',
      description: 'Procesamiento de documentos con algoritmos de última generación y comprensión contextual profunda.'
    },
    {
      icon: '📄',
      title: 'Análisis de Documentos',
      description: 'Soporte para PDF, Word, texto y más. Extracción automática de insights y datos clave.'
    },
    {
      icon: '💬',
      title: 'Chat Inteligente RAG',
      description: 'Conversa con tus documentos de forma natural. Obtén respuestas precisas al instante.'
    },
    {
      icon: '📊',
      title: 'Analytics Avanzados',
      description: 'Métricas detalladas, tendencias y reportes para optimizar tu flujo de trabajo.'
    },
    {
      icon: '🔒',
      title: 'Seguridad Empresarial',
      description: 'Protección de datos de nivel empresarial con cifrado end-to-end y privacidad garantizada.'
    },
    {
      icon: '⚡',
      title: 'Velocidad Optimizada',
      description: 'Respuestas en menos de 2 segundos. Procesamiento paralelo y cache inteligente.'
    }
  ]

  if (isLoading) {
    return (
      <div style={{ 
        background: 'linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%)', 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            margin: '0 auto 24px',
            animation: 'pulse 2s infinite'
          }}>
            AI
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '16px' }}>AI RAG Agent</h1>
          <p style={{ opacity: '0.8', marginBottom: '24px' }}>Cargando sistema inteligente...</p>
          <div style={{
            width: '32px',
            height: '32px',
            border: '3px solid rgba(255, 255, 255, 0.3)',
            borderTop: '3px solid #8b5cf6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
        </div>
        
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
        `}</style>
      </div>
    )
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
        
        .btn-primary {
          background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
          border: none;
          color: white;
          padding: 16px 32px;
          border-radius: 16px;
          font-weight: 600;
          font-size: 18px;
          cursor: pointer;
          transition: all 0.3s ease;
          transform: translateY(0);
          text-decoration: none;
          display: inline-block;
        }
        
        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 35px rgba(139, 92, 246, 0.4);
        }
        
        .btn-secondary {
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 14px 28px;
          border-radius: 16px;
          font-weight: 600;
          font-size: 18px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-block;
        }
        
        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.5);
          transform: translateY(-2px);
        }
        
        .feature-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          padding: 32px 24px;
          text-align: center;
          transition: all 0.3s ease;
          height: 100%;
        }
        
        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          border-color: rgba(139, 92, 246, 0.4);
        }
        
        .floating-element {
          animation: float 6s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
        
        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            text-align: center;
          }
          
          .features-grid {
            grid-template-columns: 1fr !important;
          }
          
          .cta-buttons {
            flex-direction: column !important;
            gap: 16px !important;
          }
        }
      `}</style>

      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%)', minHeight: '100vh' }}>
        
        {/* Header */}
        <header style={{ padding: '20px 0', background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  fontWeight: 'bold'
                }}>
                  AI
                </div>
                <div>
                  <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>AI RAG Agent</h1>
                  <p style={{ fontSize: '14px', opacity: '0.8' }}>Sistema Inteligente de Análisis</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <Link href="/login" className="btn-secondary">
                  Iniciar Sesión
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section style={{ padding: '80px 0 120px' }}>
          <div className="container">
            <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
              
              <div>
                <h1 style={{ 
                  fontSize: '56px', 
                  fontWeight: 'bold', 
                  lineHeight: '1.1', 
                  marginBottom: '24px',
                  background: 'linear-gradient(135deg, #ffffff 0%, #8b5cf6 50%, #ec4899 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Transforma tus Documentos en Insights Inteligentes
                </h1>
                
                <p style={{ 
                  fontSize: '22px', 
                  opacity: '0.9', 
                  lineHeight: '1.6', 
                  marginBottom: '40px' 
                }}>
                  Potencia tu análisis de documentos con IA avanzada. Obtén respuestas instantáneas, 
                  extrae insights valiosos y optimiza tu flujo de trabajo con nuestro sistema RAG.
                </p>
                
                <div className="cta-buttons" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <button onClick={handleGetStarted} className="btn-primary">
                    🚀 Comenzar Gratis
                  </button>
                  <a href="#features" className="btn-secondary">
                    Ver Características
                  </a>
                </div>
                
                <div style={{ marginTop: '40px', display: 'flex', gap: '32px', opacity: '0.8' }}>
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6' }}>98.5%</div>
                    <div style={{ fontSize: '14px' }}>Precisión</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>&lt;2s</div>
                    <div style={{ fontSize: '14px' }}>Respuesta</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ec4899' }}>1000+</div>
                    <div style={{ fontSize: '14px' }}>Documentos</div>
                  </div>
                </div>
              </div>
              
              <div className="floating-element" style={{ textAlign: 'center' }}>
                <div className="glass-card" style={{ padding: '40px', display: 'inline-block' }}>
                  <div style={{ 
                    width: '120px', 
                    height: '120px', 
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                    borderRadius: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '48px',
                    margin: '0 auto 24px'
                  }}>
                    🧠
                  </div>
                  <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>IA Conversacional</h3>
                  <p style={{ opacity: '0.8' }}>Habla con tus documentos de forma natural</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" style={{ padding: '80px 0', background: 'rgba(255, 255, 255, 0.05)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <h2 style={{ 
                fontSize: '42px', 
                fontWeight: 'bold', 
                marginBottom: '20px',
                background: 'linear-gradient(135deg, #ffffff 0%, #8b5cf6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Características Avanzadas
              </h2>
              <p style={{ fontSize: '20px', opacity: '0.8', maxWidth: '600px', margin: '0 auto' }}>
                Descubre todo lo que puedes lograr con nuestro sistema RAG de última generación
              </p>
            </div>
            
            <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }}>
              {features.map((feature, index) => (
                <div key={index} className="feature-card">
                  <div style={{ fontSize: '48px', marginBottom: '20px' }}>{feature.icon}</div>
                  <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '16px' }}>{feature.title}</h3>
                  <p style={{ opacity: '0.8', lineHeight: '1.6' }}>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section style={{ padding: '80px 0' }}>
          <div className="container">
            <div className="glass-card" style={{ padding: '60px 40px', textAlign: 'center' }}>
              <h2 style={{ 
                fontSize: '36px', 
                fontWeight: 'bold', 
                marginBottom: '20px',
                background: 'linear-gradient(135deg, #ffffff 0%, #8b5cf6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                ¿Listo para Revolucionar tu Análisis de Documentos?
              </h2>
              <p style={{ fontSize: '20px', opacity: '0.8', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
                Únete a miles de profesionales que ya están utilizando IA para optimizar su trabajo
              </p>
              <button onClick={handleGetStarted} className="btn-primary" style={{ fontSize: '20px', padding: '20px 40px' }}>
                🎯 Comenzar Ahora - Es Gratis
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ padding: '40px 0', borderTop: '1px solid rgba(255, 255, 255, 0.2)', background: 'rgba(0, 0, 0, 0.2)' }}>
          <div className="container">
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                  AI
                </div>
                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>AI RAG Agent</span>
              </div>
              <p style={{ opacity: '0.7' }}>© 2024 AI RAG Agent. Potenciando el futuro del análisis inteligente.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}