'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DashboardPage() {
  const [userEmail, setUserEmail] = useState('')
  const router = useRouter()

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn')
    const email = localStorage.getItem('userEmail')
    
    if (!isLoggedIn) {
      router.push('/login')
    } else {
      setUserEmail(email || 'admin@test.com')
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('userEmail')
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              {/* Logo */}
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center mr-3">
                  <span className="text-white text-sm">🇺🇸</span>
                </div>
                <span className="text-xl font-semibold text-blue-600">AI RAG Agent</span>
                <span className="ml-3 text-sm text-gray-500">User: YES | Name: admin@test.com</span>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium border-b-2 border-blue-600">
                Dashboard
              </Link>
              <Link href="/chat" className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Chat
              </Link>
              <Link href="/analytics" className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Analytics
              </Link>
              <Link href="/upload" className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Upload
              </Link>
              <Link href="/documents" className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Documents
              </Link>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Hola, {userEmail}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">Bienvenido al sistema AI RAG Agent</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Documentos Totales */}
            <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 text-xl">📄</span>
                    </div>
                  </div>
                  <div className="ml-4 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Documentos Totales
                      </dt>
                      <dd className="text-2xl font-bold text-gray-900">3,421</dd>
                      <dd className="text-sm text-green-600">+12% este mes</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Consultas RAG */}
            <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 text-xl">💬</span>
                    </div>
                  </div>
                  <div className="ml-4 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Consultas RAG
                      </dt>
                      <dd className="text-2xl font-bold text-gray-900">15,847</dd>
                      <dd className="text-sm text-green-600">+8% este mes</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Rendimiento */}
            <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <span className="text-yellow-600 text-xl">⚡</span>
                    </div>
                  </div>
                  <div className="ml-4 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Rendimiento
                      </dt>
                      <dd className="text-2xl font-bold text-gray-900">99.9%</dd>
                      <dd className="text-sm text-green-600">Tiempo de respuesta: 1.2s</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Usuarios Activos */}
            <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 text-xl">👥</span>
                    </div>
                  </div>
                  <div className="ml-4 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Usuarios Activos
                      </dt>
                      <dd className="text-2xl font-bold text-gray-900">1,234</dd>
                      <dd className="text-sm text-green-600">+15% este mes</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Acciones Rápidas */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <span className="text-orange-500 mr-2">⚡</span>
                  Acciones Rápidas
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <Link href="/chat" className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <div className="flex items-center">
                    <span className="text-blue-600 text-2xl mr-4">💬</span>
                    <div>
                      <h4 className="font-medium text-gray-900">Chat RAG</h4>
                      <p className="text-gray-600 text-sm">Consultar documentos con IA</p>
                    </div>
                  </div>
                </Link>
                <Link href="/upload" className="block p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                  <div className="flex items-center">
                    <span className="text-green-600 text-2xl mr-4">📤</span>
                    <div>
                      <h4 className="font-medium text-gray-900">Subir Documento</h4>
                      <p className="text-gray-600 text-sm">Añadir nuevo archivo al sistema</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Estado del Sistema */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <span className="text-blue-500 mr-2">📊</span>
                  Estado del Sistema
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Auth Service</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Activo
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">RAG Service</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Activo
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Upload Service</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Activo
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Vector Service</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Activo
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <span className="text-purple-500 mr-2">📑</span>
                Documentos
              </h3>
            </div>
            <div className="p-6">
              <div className="text-center py-12">
                <div className="text-gray-400 text-4xl mb-4">📄</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay documentos recientes</h3>
                <p className="text-gray-600 mb-6">Sube tu primer documento para comenzar</p>
                <Link 
                  href="/upload"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Subir Documento
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}