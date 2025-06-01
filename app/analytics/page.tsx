'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AnalyticsPage() {
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
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center mr-3">
                  <span className="text-white text-sm">🇺🇸</span>
                </div>
                <span className="text-xl font-semibold text-blue-600">AI RAG Agent</span>
                <span className="ml-3 text-sm text-gray-500">User: YES | Name: admin@test.com</span>
              </div>
            </div>

            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Dashboard
              </Link>
              <Link href="/chat" className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Chat
              </Link>
              <Link href="/analytics" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium border-b-2 border-blue-600">
                Analytics
              </Link>
              <Link href="/upload" className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Upload
              </Link>
              <Link href="/documents" className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Documents
              </Link>
            </div>

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
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 text-sm">
              ← Volver al Dashboard
            </Link>
          </div>

          {/* Page Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <span className="text-blue-600 mr-3">📊</span>
                Analytics Dashboard
              </h1>
              <p className="mt-2 text-gray-600">Métricas en tiempo real del sistema RAG</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <span className="mr-2">⏰ Tiempo Real</span>
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              </div>
              <span className="text-sm text-gray-500">Última actualización: 2:47:30 a.m.</span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Usuarios Total */}
            <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 text-lg">👥</span>
                    </div>
                  </div>
                  <div className="ml-4 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Usuarios Total
                      </dt>
                      <dd className="text-2xl font-bold text-gray-900">1,247</dd>
                      <dd className="text-sm text-green-600">+4.82% vs mes anterior</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Documentos */}
            <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 text-lg">📄</span>
                    </div>
                  </div>
                  <div className="ml-4 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Documentos
                      </dt>
                      <dd className="text-2xl font-bold text-gray-900">3,421</dd>
                      <dd className="text-sm text-green-600">+14.6% vs mes anterior</dd>
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
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 text-lg">💬</span>
                    </div>
                  </div>
                  <div className="ml-4 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Consultas RAG
                      </dt>
                      <dd className="text-2xl font-bold text-gray-900">15,673</dd>
                      <dd className="text-sm text-green-600">+21.1% vs mes anterior</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Tiempo Respuesta */}
            <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <span className="text-yellow-600 text-lg">⚡</span>
                    </div>
                  </div>
                  <div className="ml-4 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Tiempo Respuesta
                      </dt>
                      <dd className="text-2xl font-bold text-gray-900">2.3s</dd>
                      <dd className="text-sm text-red-600">+6.26% vs mes anterior</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Actividad por Hora */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <span className="text-blue-500 mr-2">📈</span>
                  Actividad por Hora (Últimas 24h)
                </h3>
              </div>
              <div className="p-6">
                <div className="h-64 flex items-end justify-between space-x-2">
                  {/* Simulated Chart Bars */}
                  {[45, 23, 56, 78, 34, 89, 67, 45, 23, 67, 89, 12, 34, 56, 78, 90, 67, 45, 23, 56, 78, 89, 67, 45].map((height, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div 
                        className="w-8 bg-gradient-to-t from-blue-400 to-green-400 rounded-t"
                        style={{height: `${height}%`}}
                      ></div>
                      <span className="text-xs text-gray-500 mt-2">
                        {String(i).padStart(2, '0')}:00
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-between text-sm text-gray-600">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-400 rounded mr-2"></div>
                    <span>Usuarios</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-400 rounded mr-2"></div>
                    <span>Consultas</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tendencias Semanales */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <span className="text-green-500 mr-2">📊</span>
                  Tendencias Semanales
                </h3>
              </div>
              <div className="p-6">
                <div className="h-64 flex items-end justify-between space-x-4">
                  {/* Weekly Bar Chart */}
                  {[
                    {day: 'Lun', usuarios: 60, documentos: 40, consultas: 80},
                    {day: 'Mar', usuarios: 45, documentos: 30, consultas: 65},
                    {day: 'Mie', usuarios: 80, documentos: 60, consultas: 70},
                    {day: 'Jue', usuarios: 70, documentos: 50, consultas: 85},
                    {day: 'Vie', usuarios: 90, documentos: 70, consultas: 95},
                    {day: 'Sab', usuarios: 40, documentos: 25, consultas: 50},
                    {day: 'Dom', usuarios: 30, documentos: 20, consultas: 45}
                  ].map((data, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className="flex items-end space-x-1">
                        <div 
                          className="w-4 bg-blue-500 rounded-t"
                          style={{height: `${data.usuarios * 2}px`}}
                        ></div>
                        <div 
                          className="w-4 bg-yellow-500 rounded-t"
                          style={{height: `${data.documentos * 2}px`}}
                        ></div>
                        <div 
                          className="w-4 bg-green-500 rounded-t"
                          style={{height: `${data.consultas * 2}px`}}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 mt-2">{data.day}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-between text-sm text-gray-600">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                    <span>Usuarios</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
                    <span>Documentos</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                    <span>Consultas</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Salud del Sistema */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <span className="text-purple-500 mr-2">💚</span>
                  Salud del Sistema
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">CPU</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '45%'}}></div>
                    </div>
                    <span className="text-sm text-gray-600">45%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Memoria</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{width: '67%'}}></div>
                    </div>
                    <span className="text-sm text-gray-600">67%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Almacenamiento</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div className="bg-orange-500 h-2 rounded-full" style={{width: '23%'}}></div>
                    </div>
                    <span className="text-sm text-gray-600">23%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Uptime</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '99%'}}></div>
                    </div>
                    <span className="text-sm text-gray-600">99.9%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Documentos Más Consultados */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <span className="text-blue-500 mr-2">📑</span>
                  Documentos Más Consultados
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-blue-600 text-sm">📄</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Manual_Usuario.pdf</p>
                        <p className="text-xs text-gray-500">234 consultas</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">234</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-green-600 text-sm">📄</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Politicas_Empresa.docx</p>
                        <p className="text-xs text-gray-500">189 consultas</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">189</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-purple-600 text-sm">📄</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Guia_Procesos.pdf</p>
                        <p className="text-xs text-gray-500">156 consultas</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">156</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-yellow-600 text-sm">📄</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">FAQ_Sistema.txt</p>
                        <p className="text-xs text-gray-500">134 consultas</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">134</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}