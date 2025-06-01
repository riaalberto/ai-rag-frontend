'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (email === 'admin@test.com' && password === 'admin123') {
      setIsLoggedIn(true)
      setShowLogin(false)
    } else {
      alert('Credenciales incorrectas. Usa admin@test.com / admin123')
    }
  }

  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">🤖</div>
            <h1 className="text-2xl font-bold text-gray-900">AI RAG Assistant</h1>
            <p className="text-gray-600">Inicia sesión para continuar</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="admin@test.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="admin123"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Iniciar Sesión
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <button
              onClick={() => setShowLogin(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ← Volver al inicio
            </button>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
            <p className="font-semibold">Credenciales de demostración:</p>
            <p>Email: admin@test.com</p>
            <p>Contraseña: admin123</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🤖</div>
              <span className="text-white font-bold text-xl">AI RAG Assistant</span>
            </div>
            <div className="flex space-x-4">
              {!isLoggedIn ? (
                <button
                  onClick={() => setShowLogin(true)}
                  className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
                >
                  Iniciar Sesión
                </button>
              ) : (
                <div className="flex items-center space-x-4">
                  <span className="text-white/80">¡Bienvenido!</span>
                  <Link 
                    href="/chat"
                    className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
                  >
                    💬 Chat
                  </Link>
                  <Link 
                    href="/dashboard"
                    className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    📊 Dashboard
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="text-6xl mb-6">🤖</div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            AI RAG Assistant
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto mb-8">
            Sistema RAG empresarial con análisis inteligente de documentos Excel. 
            Sube tus archivos y obtén insights automáticos con IA.
          </p>
          
          {!isLoggedIn ? (
            <button
              onClick={() => setShowLogin(true)}
              className="inline-block bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
            >
              🚀 Comenzar Ahora
            </button>
          ) : (
            <div className="flex justify-center space-x-4">
              <Link 
                href="/dashboard"
                className="inline-block bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
              >
                📊 Ir al Dashboard
              </Link>
              <Link 
                href="/chat"
                className="inline-block bg-white/20 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/30 transition-all transform hover:scale-105 shadow-lg border border-white/30"
              >
                💬 Chat Directo
              </Link>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center border border-white/20">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-2xl font-semibold mb-4 text-white">Dashboard & Upload</h3>
            <p className="text-white/80">
              Gestiona tus documentos, sube archivos Excel y ve estadísticas 
              del sistema en tiempo real.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center border border-white/20">
            <div className="text-5xl mb-4">🧠</div>
            <h3 className="text-2xl font-semibold mb-4 text-white">Chat Inteligente</h3>
            <p className="text-white/80">
              Haz preguntas sobre tus documentos y recibe respuestas 
              contextuales basadas en el contenido analizado.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center border border-white/20">
            <div className="text-5xl mb-4">🏗️</div>
            <h3 className="text-2xl font-semibold mb-4 text-white">Análisis Automático</h3>
            <p className="text-white/80">
              Genera gráficas automáticas, estadísticas descriptivas 
              e insights de negocio con IA.
            </p>
          </div>
        </div>

        {/* Quick Access */}
        {isLoggedIn && (
          <div className="grid md:grid-cols-2 gap-8 mb-20">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="text-4xl mb-4">📁</div>
              <h3 className="text-2xl font-semibold mb-4 text-white">Gestión de Documentos</h3>
              <p className="text-white/80 mb-6">
                Ve todos tus documentos, sube nuevos archivos y gestiona tu biblioteca de conocimiento.
              </p>
              <Link 
                href="/dashboard"
                className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Ver Dashboard →
              </Link>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-2xl font-semibold mb-4 text-white">Chat Inmediato</h3>
              <p className="text-white/80 mb-6">
                Tu archivo Datos_Gonpal_1.xlsx ya está analizado. Empieza a hacer preguntas ahora mismo.
              </p>
              <Link 
                href="/chat"
                className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Empezar Chat →
              </Link>
            </div>
          </div>
        )}

        {/* Stats - Solo si está loggeado */}
        {isLoggedIn && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-20 border border-white/20">
            <h3 className="text-2xl font-semibold mb-6 text-white text-center">Estado Actual del Sistema</h3>
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-white mb-2">3</div>
                <div className="text-white/80 font-semibold">Documentos</div>
                <div className="text-sm text-white/60">Listos para análisis</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-2">1</div>
                <div className="text-white/80 font-semibold">Excel Analizado</div>
                <div className="text-sm text-white/60">Con 3 gráficas generadas</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-2">100%</div>
                <div className="text-white/80 font-semibold">Sistema Activo</div>
                <div className="text-sm text-white/60">Backend + Frontend</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-2">∞</div>
                <div className="text-white/80 font-semibold">Escalable</div>
                <div className="text-sm text-white/60">Arquitectura Modular</div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-white/20 text-center">
          <p className="text-white/60 mb-4">
            🏗️ Sistema RAG con Arquitectura Modular • Powered by OpenAI & FastAPI
          </p>
          <div className="flex justify-center space-x-6 text-sm text-white/50">
            <span>✅ Dashboard Completo</span>
            <span>✅ Upload Funcionando</span>
            <span>✅ Chat Inteligente</span>
            <span>✅ Base de Datos Supabase</span>
          </div>
        </footer>
      </div>
    </div>
  )
}