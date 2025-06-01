'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '../components/Sidebar'
import Link from 'next/link'

interface Document {
  id: string
  filename: string
  size: number
  uploadDate: string
  type: string
  status: 'processed' | 'analyzing' | 'pending'
  insights?: number
}

export default function DashboardPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [stats, setStats] = useState({
    totalDocs: 0,
    excelFiles: 0,
    pdfFiles: 0,
    analyzed: 0,
    totalSize: 0
  })
  const router = useRouter()

  // Verificar login
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn')
    if (!isLoggedIn) {
      router.push('/login')
      return
    }

    // Cargar documentos con datos más ricos
    const mockDocs: Document[] = [
      {
        id: '1',
        filename: 'Datos_Gonpal_1.xlsx',
        size: 32780,
        uploadDate: '2025-05-31',
        type: 'Excel',
        status: 'processed',
        insights: 8
      },
      {
        id: '2', 
        filename: 'CFF.pdf',
        size: 156432,
        uploadDate: '2025-05-30',
        type: 'PDF',
        status: 'processed',
        insights: 3
      },
      {
        id: '3',
        filename: 'Ventas_Q1_2025.xlsx', 
        size: 45621,
        uploadDate: '2025-05-29',
        type: 'Excel',
        status: 'processed',
        insights: 12
      },
      {
        id: '4',
        filename: 'Reporte_Marketing.pdf', 
        size: 78234,
        uploadDate: '2025-05-28',
        type: 'PDF',
        status: 'analyzing'
      },
      {
        id: '5',
        filename: 'Inventario_Mayo.xlsx', 
        size: 91567,
        uploadDate: '2025-05-27',
        type: 'Excel',
        status: 'pending'
      }
    ]

    setDocuments(mockDocs)

    // Calcular estadísticas
    const totalSize = mockDocs.reduce((acc, doc) => acc + doc.size, 0)
    setStats({
      totalDocs: mockDocs.length,
      excelFiles: mockDocs.filter(d => d.type === 'Excel').length,
      pdfFiles: mockDocs.filter(d => d.type === 'PDF').length,
      analyzed: mockDocs.filter(d => d.status === 'processed').length,
      totalSize
    })
  }, [router])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'Excel': return '📊'
      case 'PDF': return '📄'
      default: return '📁'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed': return 'bg-green-100 text-green-800 border-green-200'
      case 'analyzing': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'processed': return 'Procesado'
      case 'analyzing': return 'Analizando'
      case 'pending': return 'Pendiente'
      default: return 'Desconocido'
    }
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Sidebar />
      
      <div className="flex-1">
        {/* Header con gradiente */}
        <div className="glass border-b border-white/20 backdrop-blur-xl">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="animate-slide-up">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                  Documents Dashboard
                </h1>
                <p className="text-gray-600">Gestiona y analiza tus documentos con IA</p>
              </div>
              <Link
                href="/upload"
                className="btn-primary hover-lift animate-scale-in"
              >
                <span className="mr-2 text-lg">⬆️</span>
                Subir Documento
              </Link>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Stats Cards con diseño moderno */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="stats-card hover-lift p-6 animate-fade-in" style={{animationDelay: '0.1s'}}>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                  📁
                </div>
                <div className="ml-4">
                  <p className="text-3xl font-bold text-gray-900">{stats.totalDocs}</p>
                  <p className="text-gray-600 font-medium">Total Documents</p>
                  <p className="text-xs text-gray-500 mt-1">{formatFileSize(stats.totalSize)} total</p>
                </div>
              </div>
            </div>
            
            <div className="stats-card hover-lift p-6 animate-fade-in" style={{animationDelay: '0.2s'}}>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                  📊
                </div>
                <div className="ml-4">
                  <p className="text-3xl font-bold text-green-700">{stats.excelFiles}</p>
                  <p className="text-gray-600 font-medium">Excel Files</p>
                  <p className="text-xs text-green-600 mt-1">Con análisis automático</p>
                </div>
              </div>
            </div>
            
            <div className="stats-card hover-lift p-6 animate-fade-in" style={{animationDelay: '0.3s'}}>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                  📄
                </div>
                <div className="ml-4">
                  <p className="text-3xl font-bold text-red-700">{stats.pdfFiles}</p>
                  <p className="text-gray-600 font-medium">PDF Files</p>
                  <p className="text-xs text-red-600 mt-1">Texto extraído</p>
                </div>
              </div>
            </div>
            
            <div className="stats-card hover-lift p-6 animate-fade-in" style={{animationDelay: '0.4s'}}>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                  🧠
                </div>
                <div className="ml-4">
                  <p className="text-3xl font-bold text-purple-700">{stats.analyzed}</p>
                  <p className="text-gray-600 font-medium">Analizados</p>
                  <p className="text-xs text-purple-600 mt-1">Con insights IA</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Link href="/upload" className="glass hover-lift p-6 rounded-2xl border border-white/20 group animate-slide-up" style={{animationDelay: '0.5s'}}>
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white text-lg">
                  ⬆️
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                  Upload Files
                </h3>
              </div>
              <p className="text-gray-600 text-sm">
                Arrastra archivos Excel o PDF para análisis automático con IA
              </p>
            </Link>

            <Link href="/chat" className="glass hover-lift p-6 rounded-2xl border border-white/20 group animate-slide-up" style={{animationDelay: '0.6s'}}>
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center text-white text-lg">
                  💬
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                  AI Chat
                </h3>
              </div>
              <p className="text-gray-600 text-sm">
                Haz preguntas sobre tus documentos y obtén insights inteligentes
              </p>
            </Link>

            <div className="glass hover-lift p-6 rounded-2xl border border-white/20 animate-slide-up" style={{animationDelay: '0.7s'}}>
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-lg">
                  📈
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-900">
                  Analytics
                </h3>
              </div>
              <p className="text-gray-600 text-sm">
                Visualiza tendencias y patrones en tus datos empresariales
              </p>
            </div>
          </div>

          {/* Documents Table mejorada */}
          <div className="glass rounded-2xl border border-white/20 overflow-hidden animate-slide-up" style={{animationDelay: '0.8s'}}>
            <div className="px-8 py-6 border-b border-gray-200/50">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Recent Documents</h2>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">Procesado</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">Analizando</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">Pendiente</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Document
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Insights
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-8 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/50">
                  {documents.map((doc, index) => (
                    <tr key={doc.id} className="table-row hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-purple-50/30 transition-all duration-300" 
                        style={{animationDelay: `${0.9 + index * 0.1}s`}}>
                      <td className="px-8 py-6">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-2xl shadow-sm">
                            {getFileIcon(doc.type)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900 mb-1">
                              {doc.filename}
                            </div>
                            <div className="text-xs text-gray-500">
                              {doc.type} file
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(doc.status)}`}>
                          <div className={`w-1.5 h-1.5 rounded-full mr-2 ${
                            doc.status === 'processed' ? 'bg-green-500' :
                            doc.status === 'analyzing' ? 'bg-blue-500 animate-pulse' :
                            'bg-amber-500'
                          }`}></div>
                          {getStatusText(doc.status)}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-sm text-gray-600 font-medium">
                        {formatFileSize(doc.size)}
                      </td>
                      <td className="px-6 py-6">
                        {doc.insights ? (
                          <div className="flex items-center">
                            <span className="text-sm font-semibold text-purple-700">{doc.insights}</span>
                            <span className="text-xs text-gray-500 ml-1">insights</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-6 text-sm text-gray-600">
                        {doc.uploadDate}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end space-x-2">
                          <Link
                            href={`/chat?doc=${doc.filename}`}
                            className="btn-secondary text-xs px-3 py-1.5"
                          >
                            Chat
                          </Link>
                          {doc.type === 'Excel' && (
                            <button className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                              Análisis
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}