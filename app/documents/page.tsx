'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Document {
  id: string
  filename: string
  size: string
  uploadDate: string
  type: string
  status: 'Listo' | 'Procesando' | 'Error'
}

export default function DocumentsPage() {
  const [userEmail, setUserEmail] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('Todos los estados')
  const [sortBy, setSortBy] = useState('Fecha')
  const router = useRouter()

  // Sample documents data
  const [documents] = useState<Document[]>([
    {
      id: '1',
      filename: 'ANÁLISIS_Datos_Gonpal_1.xlsx',
      size: '847 KB',
      uploadDate: '21 mayo 2024',
      type: 'XLSX',
      status: 'Listo'
    },
    {
      id: '2',
      filename: 'Datos_Gonpal_1.xlsx',
      size: '1.2 MB',
      uploadDate: '21 mayo 2024',
      type: 'XLSX',
      status: 'Listo'
    },
    {
      id: '3',
      filename: 'CFT.pdf',
      size: '2.1 MB',
      uploadDate: '20 mayo 2024',
      type: 'PDF',
      status: 'Listo'
    },
    {
      id: '4',
      filename: 'Manual_Usuario.pdf',
      size: '5.8 MB',
      uploadDate: '19 mayo 2024',
      type: 'PDF',
      status: 'Listo'
    },
    {
      id: '5',
      filename: 'Politicas_Empresa.docx',
      size: '1.1 MB',
      uploadDate: '18 mayo 2024',
      type: 'DOCX',
      status: 'Listo'
    },
    {
      id: '6',
      filename: 'Guia_Procesos.pdf',
      size: '3.2 MB',
      uploadDate: '17 mayo 2024',
      type: 'PDF',
      status: 'Listo'
    }
  ])

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

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return '📄'
      case 'docx':
      case 'doc':
        return '📝'
      case 'xlsx':
      case 'xls':
        return '📊'
      case 'txt':
        return '📃'
      default:
        return '📄'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Listo':
        return 'bg-green-100 text-green-800'
      case 'Procesando':
        return 'bg-yellow-100 text-yellow-800'
      case 'Error':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredDocuments = documents.filter(doc => 
    doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (statusFilter === 'Todos los estados' || doc.status === statusFilter)
  )

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
              <Link href="/analytics" className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Analytics
              </Link>
              <Link href="/upload" className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Upload
              </Link>
              <Link href="/documents" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium border-b-2 border-blue-600">
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
                <span className="text-green-600 mr-3">📑</span>
                Gestión de Documentos
              </h1>
              <p className="mt-2 text-gray-600">Administra y consulta todos los documentos del sistema RAG</p>
            </div>
            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                🔄 Actualizar
              </button>
              <Link href="/upload" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
                📤 Subir Documentos
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-blue-600 text-xl">📄</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Documentos</p>
                  <p className="text-2xl font-bold text-gray-900">7</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-green-600 text-xl">✅</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Vectorizados</p>
                  <p className="text-2xl font-bold text-gray-900">6</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-yellow-600 text-xl">⏳</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Procesando</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-red-600 text-xl">⬇️</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Descargas</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Buscar documentos por CFT, Excel, manual..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-3">
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Todos los estados</option>
                  <option>Listo</option>
                  <option>Procesando</option>
                  <option>Error</option>
                </select>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Fecha</option>
                  <option>Nombre</option>
                  <option>Tamaño</option>
                  <option>Tipo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Documents Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Documentos ({filteredDocuments.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Documento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tamaño
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDocuments.map((document) => (
                    <tr key={document.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                              <span className="text-lg">{getFileIcon(document.type)}</span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {document.filename}
                            </div>
                            <div className="text-sm text-gray-500">
                              {document.type}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {document.size}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {document.uploadDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(document.status)}`}>
                          {document.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link 
                            href="/chat"
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                          >
                            💬
                          </Link>
                          <button className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                            📊
                          </button>
                          <button className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700">
                            ⋮
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredDocuments.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-4xl mb-4">📄</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron documentos</h3>
                <p className="text-gray-600 mb-6">Ajusta los filtros de búsqueda o sube nuevos documentos.</p>
                <Link 
                  href="/upload"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Subir Primer Documento
                </Link>
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredDocuments.length > 0 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6 rounded-lg border border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  Anterior
                </button>
                <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  Siguiente
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">1</span> a <span className="font-medium">{filteredDocuments.length}</span> de{' '}
                    <span className="font-medium">{filteredDocuments.length}</span> resultados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                      <span className="sr-only">Anterior</span>
                      ←
                    </button>
                    <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-blue-50 text-sm font-medium text-blue-600">
                      1
                    </button>
                    <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                      <span className="sr-only">Siguiente</span>
                      →
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}