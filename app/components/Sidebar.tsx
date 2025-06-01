'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    const email = localStorage.getItem('userEmail')
    setUserEmail(email || '')
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('userEmail')
    router.push('/login')
  }

  const menuItems = [
    {
      name: 'Documents',
      href: '/dashboard',
      icon: '📁',
      description: 'Gestionar archivos',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      name: 'Upload',
      href: '/upload',
      icon: '⬆️',
      description: 'Subir documentos',
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      name: 'Chat',
      href: '/chat',
      icon: '💬',
      description: 'Análisis IA',
      gradient: 'from-purple-500 to-violet-600'
    }
  ]

  return (
    <div className="glass w-72 min-h-screen flex flex-col relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-500/10 to-blue-500/10 rounded-full translate-y-12 -translate-x-12"></div>
      
      {/* Header */}
      <div className="p-8 relative z-10">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
            🤖
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">AI RAG Agent</h1>
            <p className="text-sm text-gray-500">Análisis Inteligente</p>
          </div>
        </div>
        
        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-xl border border-blue-200/50">
            <div className="text-2xl font-bold text-blue-700">5</div>
            <div className="text-xs text-blue-600">Documentos</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-3 rounded-xl border border-green-200/50">
            <div className="text-2xl font-bold text-green-700">1</div>
            <div className="text-xs text-green-600">Analizado</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-6 pb-6 relative z-10">
        <ul className="space-y-3">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href === '/dashboard' && pathname === '/')
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`sidebar-item flex items-center p-4 text-sm font-medium transition-all duration-300 group relative ${
                    isActive
                      ? 'active bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-lg border border-blue-200/50'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50/50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg mr-4 transition-all duration-300 ${
                    isActive 
                      ? `bg-gradient-to-br ${item.gradient} text-white shadow-lg` 
                      : 'bg-gray-100 group-hover:bg-gray-200'
                  }`}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{item.name}</div>
                    <div className="text-xs text-gray-500 group-hover:text-gray-600">{item.description}</div>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Feature highlight */}
        <div className="mt-8 p-4 bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl border border-amber-200/50">
          <div className="flex items-center mb-2">
            <span className="text-lg mr-2">✨</span>
            <span className="font-semibold text-amber-800">Nuevo</span>
          </div>
          <p className="text-sm text-amber-700 mb-3">
            Análisis automático de Excel con gráficas IA
          </p>
          <Link 
            href="/chat"
            className="text-xs text-amber-600 hover:text-amber-700 font-medium"
          >
            Probar ahora →
          </Link>
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-6 border-t border-gray-200/50 relative z-10">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
            {userEmail.charAt(0).toUpperCase()}
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-semibold text-gray-900">Usuario</p>
            <p className="text-xs text-gray-500 truncate">{userEmail}</p>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-3 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-all duration-200 group"
        >
          <span className="mr-2">🚪</span>
          Cerrar sesión
          <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">→</span>
        </button>
      </div>
    </div>
  )
}