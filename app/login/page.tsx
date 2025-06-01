'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ModernLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simular autenticación
    setTimeout(() => {
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('userEmail', email || 'admin@test.com')
      setIsLoading(false)
      router.push('/dashboard')
    }, 1500)
  }

  const demoCredentials = [
    { email: 'admin@test.com', password: 'admin123' },
    { email: 'demo@empresa.com', password: 'demo123' },
    { email: 'usuario@rag.ai', password: 'rag2024' }
  ]

  const fillDemo = (credentials: { email: string; password: string }) => {
    setEmail(credentials.email)
    setPassword(credentials.password)
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
        
        .input-field {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 12px;
          padding: 16px 20px;
          color: white;
          width: 100%;
          font-size: 16px;
          transition: all 0.3s ease;
        }
        
        .input-field::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }
        
        .input-field:focus {
          outline: none;
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
          background: rgba(255, 255, 255, 0.15);
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
          border: none;
          color: white;
          padding: 16px 24px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          transform: translateY(0);
          width: 100%;
        }
        
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(139, 92, 246, 0.4);
        }
        
        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .btn-secondary {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-block;
          font-size: 14px;
        }
        
        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.5);
        }
        
        .demo-btn {
          background: rgba(59, 130, 246, 0.2);
          border: 1px solid rgba(59, 130, 246, 0.4);
          color: white;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 12px;
          margin-bottom: 8px;
          width: 100%;
          text-align: left;
        }
        
        .demo-btn:hover {
          background: rgba(59, 130, 246, 0.3);
          border-color: rgba(59, 130, 246, 0.6);
        }
        
        .feature-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          margin-bottom: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }
        
        .feature-item:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(139, 92, 246, 0.3);
        }
        
        .floating-element {
          animation: float 6s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .loading-spinner {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .login-grid {
            grid-template-columns: 1fr !important;
          }
          
          .features-panel {
            display: none;
          }
        }
      `}</style>

      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%)', minHeight: '100vh' }}>
        
        {/* Header */}
        <header style={{ padding: '20px 0', background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '16px', textDecoration: 'none', color: 'white' }}>
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
              </Link>
              
              <Link href="/" className="btn-secondary">
                ← Volver al Inicio
              </Link>
            </div>
          </div>
        </header>

        <div style={{ padding: '60px 20px', maxWidth: '1200px', margin: '0 auto' }}>
          <div className="login-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
            
            {/* Features Panel */}
            <div className="features-panel">
              <div style={{ marginBottom: '40px' }}>
                <h2 style={{ 
                  fontSize: '36px', 
                  fontWeight: 'bold', 
                  marginBottom: '16px',
                  background: 'linear-gradient(135deg, #ffffff 0%, #8b5cf6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Bienvenido de Vuelta
                </h2>
                <p style={{ fontSize: '18px', opacity: '0.8' }}>
                  Accede a tu sistema RAG inteligente y continúa transformando documentos en insights valiosos.
                </p>
              </div>

              <div>
                <div className="feature-item">
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px'
                  }}>
                    🧠
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>Análisis Inteligente</h3>
                    <p style={{ fontSize: '14px', opacity: '0.8' }}>IA avanzada para extraer insights de tus documentos</p>
                  </div>
                </div>

                <div className="feature-item">
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px'
                  }}>
                    🔒
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>Seguro y Confiable</h3>
                    <p style={{ fontSize: '14px', opacity: '0.8' }}>Máxima seguridad para tus datos empresariales</p>
                  </div>
                </div>

                <div className="feature-item">
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px'
                  }}>
                    ⚡
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>Procesamiento Rápido</h3>
                    <p style={{ fontSize: '14px', opacity: '0.8' }}>Resultados instantáneos con arquitectura optimizada</p>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '40px', padding: '20px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '16px', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>💡 ¿Sabías que?</h4>
                <p style={{ fontSize: '14px', opacity: '0.9', lineHeight: '1.5' }}>
                  Nuestro sistema procesa más de <strong>10,000 documentos</strong> al día y genera insights en tiempo real con <strong>99.8% de precisión</strong>.
                </p>
              </div>
            </div>

            {/* Login Form */}
            <div>
              <div className="glass-card" style={{ padding: '40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <div className="floating-element" style={{ 
                    width: '80px', 
                    height: '80px', 
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '32px',
                    margin: '0 auto 20px'
                  }}>
                    AI
                  </div>
                  <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>Iniciar Sesión</h2>
                  <p style={{ opacity: '0.8' }}>Accede a tu cuenta para continuar</p>
                </div>

                <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="input-field"
                      required
                    />
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                      Contraseña
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Tu contraseña"
                        className="input-field"
                        style={{ paddingRight: '50px' }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '16px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: 'rgba(255, 255, 255, 0.6)',
                          cursor: 'pointer',
                          fontSize: '18px'
                        }}
                      >
                        {showPassword ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="btn-primary" disabled={isLoading}>
                    {isLoading ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                        <div className="loading-spinner" style={{
                          width: '20px',
                          height: '20px',
                          border: '2px solid rgba(255, 255, 255, 0.3)',
                          borderTop: '2px solid white',
                          borderRadius: '50%'
                        }}></div>
                        Iniciando sesión...
                      </div>
                    ) : (
                      '🚀 Ingresar al Sistema'
                    )}
                  </button>
                </form>

                {/* Demo Credentials */}
                <div style={{ padding: '20px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#60a5fa' }}>
                    🔑 Credenciales de Prueba
                  </h4>
                  {demoCredentials.map((cred, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => fillDemo(cred)}
                      className="demo-btn"
                    >
                      {cred.email} / {cred.password}
                    </button>
                  ))}
                  <p style={{ fontSize: '12px', opacity: '0.8', marginTop: '8px' }}>
                    Haz clic en cualquier credencial para autocompletar
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}