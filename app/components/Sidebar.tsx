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
      description: 'Ver y gestionar documentos'
    },
    {
      name: 'Upload',
      href: '/upload',
      icon: '⬆️',
      description: 'Subir nuevos archivos'
    },
    {
      name: 'Chat',
      href: '/chat',
      icon: '💬',
      description: 'Chat inteligente'
    }
  ]

  return (
    <div className="bg-white w-64 min-h-screen border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">AI RAG Agent</h1>
        <p className="text-sm text-gray-600 mt-1">Sistema de análisis</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href === '/dashboard' && pathname === '/')
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg mr-3">{item.icon}</span>
                  <div>
                    <div>{item.name}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-medium">
              {userEmail.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">Usuario</p>
            <p className="text-xs text-gray-500 truncate">{userEmail}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-3 w-full text-left text-sm text-gray-500 hover:text-gray-700"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}