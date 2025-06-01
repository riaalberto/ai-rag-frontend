'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function FixedDashboardPage() {
  const [userEmail, setUserEmail] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())
  const router = useRouter()

  useEffect(() => {
    const email = localStorage.getItem('userEmail')
    if (!email) {
      router.push('/login')
      return
    }
    setUserEmail(email)
    
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('userEmail')
    router.push('/login')
  }

  const stats = [
    { title: 'Documentos Procesados', value: '2,847', change: '+12%', bg: 'from-blue-500 to-cyan-500' },
    { title: 'Consultas RAG', value: '1,439', change: '+23%', bg: 'from-purple-500 to-pink-500' },
    { title: 'Insights Generados', value: '582', change: '+8%', bg: 'from-emerald-500 to-teal-500' },
    { title: 'Usuarios Activos', value: '127', change: '+15%', bg: 'from-orange-500 to-red-500' }
  ]

  const quickActions = [
    { title: 'Nuevo Chat RAG', href: '/chat', bg: 'from-blue-500 to-cyan-500' },
    { title: 'Subir Documento', href: '/upload', bg: 'from-purple-500 to-pink-500' },
    { title: 'Ver Analytics', href: '/analytics', bg: 'from-emerald-500 to-teal-500' },
    { title: 'Gestionar Docs', href: '/documents', bg: 'from-orange-500 to-red-500' }
  ]

  const systemServices = [
    { name: 'RAG Engine', status: 'online', uptime: '99.9%' },
    { name: 'Vector Database', status: 'online', uptime: '99.8%' },
    { name: 'AI Processor', status: 'online', uptime: '98.7%' },
    { name: 'Cloud Storage', status: 'online', uptime: '99.5%' }
  ]

  const recentDocs = [
    { name: 'Datos_Gonpal_1.xlsx', size: '2.4 MB', time: '5 min ago', insights: 12 },
    { name: 'Financial_Report_Q4.pdf', size: '1.8 MB', time: '1 hour ago', insights: 8 },
    { name: 'Market_Analysis.docx', size: '956 KB', time: '3 hours ago', insights: 6 },
    { name: 'Customer_Data.csv', size: '3.2 MB', time: '1 day ago', insights: 15 }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">🧠</span>
                </div>
                <div>
                  <span className="text-xl font-bold text-gray-900">AI RAG Agent</span>
                  <span className="ml-2 text-sm bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-2 py-1 rounded-full">Pro</span>
                </div>
              </div>
              
              {/* Navigation Links */}
              <div className="hidden md:flex items-center space-x-6">
                <Link href="/dashboard" className="flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-medium">
                  <span>🏠</span>
                  <span>Dashboard</span>
                </Link>
                <Link href="/chat" className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors">
                  <span>💬</span>
                  <span>Chat</span>
                </Link>
                <Link href="/analytics" className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors">
                  <span>📊</span>
                  <span>Analytics</span>
                </Link>
                <Link href="/upload" className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors">
                  <span>⬆️</span>
                  <span>Upload</span>
                </Link>
                <Link href="/documents" className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors">
                  <span>📄</span>
                  <span>Documents</span>
                </Link>
              </div>
            </div>
            
            {/* User Info */}
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors">
                <span>🔔</span>
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors">
                <span>⚙️</span>
              </button>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">Hola, {userEmail}</span>
                <button 
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition-colors text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6 space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">¡Bienvenido de vuelta! 👋</h1>
              <p className="text-indigo-100 text-lg mb-4">Tu sistema RAG ha procesado 127 documentos esta semana</p>
              <div className="flex items-center space-x-4">
                <span className="text-sm bg-white bg-opacity-20 backdrop-blur-sm px-3 py-1 rounded-full">
                  {currentTime.toLocaleDateString('es-ES')}
                </span>
                <span className="text-sm bg-white bg-opacity-20 backdrop-blur-sm px-3 py-1 rounded-full">
                  {currentTime.toLocaleTimeString('es-ES')}
                </span>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-32 h-32 bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <span className="text-6xl">🤖</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.bg} bg-opacity-10`}>
                  <span className="text-2xl">
                    {index === 0 ? '📄' : index === 1 ? '🧠' : index === 2 ? '✨' : '👥'}
                  </span>
                </div>
                <span className="text-emerald-500 text-sm font-medium">{stat.change}</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-gray-600 text-sm">{stat.title}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className={`bg-gradient-to-r ${action.bg} text-white p-6 rounded-xl hover:scale-105 transition-all duration-300 group block`}
              >
                <div className="text-3xl mb-3">
                  {index === 0 ? '💬' : index === 1 ? '⬆️' : index === 2 ? '📊' : '📄'}
                </div>
                <h3 className="font-semibold">{action.title}</h3>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* System Status */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Estado del Sistema</h2>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-emerald-600 font-medium">Todo operativo</span>
              </div>
            </div>
            <div className="space-y-4">
              {systemServices.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">
                      {index === 0 ? '🧠' : index === 1 ? '🗄️' : index === 2 ? '⚡' : '☁️'}
                    </span>
                    <span className="font-medium text-gray-900">{service.name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">{service.uptime}</span>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Documents */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Documentos Recientes</h2>
              <Link href="/documents" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center space-x-1">
                <span>Ver todos</span>
                <span>→</span>
              </Link>
            </div>
            <div className="space-y-3">
              {recentDocs.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm">📄</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 text-sm">{doc.name}</h3>
                      <p className="text-gray-500 text-xs">{doc.size} • {doc.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-indigo-600 font-medium">{doc.insights} insights</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}