'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Document {
  id: string
  filename: string
  size: number
  uploadDate: string
  type: string
}

export default function DashboardPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Simular documentos existentes
  useEffect(() => {
    setDocuments([
      {
        id: '1',
        filename: 'Datos_Gonpal_1.xlsx',
        size: 32780,
        uploadDate: '2025-05-31',
        type: 'Excel'
      },
      {
        id: '2', 
        filename: 'CFF.pdf',
        size: 156432,
        uploadDate: '2025-05-30',
        type: 'PDF'
      },
      {
        id: '3',
        filename: 'Ventas_Q1.xlsx', 
        size: 45621,
        uploadDate: '2025-05-29',
        type: 'Excel'
      }
    ])
  }, [])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simular progreso de upload
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i)
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Agregar documento a la lista
      const newDoc: Document = {
        id: Date.now().toString(),
        filename: file.name,
        size: file.size,
        uploadDate: new Date().toISOString().split('T')[0],
        type: file.name.endsWith('.xlsx') ? 'Excel' : 'PDF'
      }

      setDocuments(prev => [newDoc, ...prev])
      
      // Aquí iría la llamada real al backend
      /*
      const formData = new FormData()
      formData.append('file', file)
      formData.append('user_id', '119f7084-be9e-416f-81d6-3ffeadb062d5')
      
      const response = await fetch('https://fastapi-service-production-4f6c.up.railway.app/upload', {
        method: 'POST',
        body: formData
      })
      */

    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Error al subir el archivo')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'Excel': return '📊'
      case 'PDF': return '📄'
      default: return '📁'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3">
                <div className="text-2xl">🤖</div>
                <span className="font-bold text-xl text-gray-900">AI RAG Assistant</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                href="/chat"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                💬 Chat
              </Link>
              <div className="text-sm text-gray-600">admin@test.com</div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Gestiona tus documentos y ve estadísticas del sistema RAG</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">📁</div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
                <p className="text-gray-600">Documentos</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">📊</div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {documents.filter(d => d.type === 'Excel').length}
                </p>
                <p className="text-gray-600">Archivos Excel</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">🧠</div>
              <div>
                <p className="text-2xl font-bold text-blue-600">3</p>
                <p className="text-gray-600">Gráficas Generadas</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">⚡</div>
              <div>
                <p className="text-2xl font-bold text-purple-600">100%</p>
                <p className="text-gray-600">Sistema Activo</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold mb-4">📤 Subir Documento</h2>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".xlsx,.xls,.pdf"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer"
                >
                  <div className="text-4xl mb-2">📁</div>
                  <p className="text-gray-600 mb-2">
                    {isUploading ? 'Subiendo...' : 'Click para subir archivo'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Excel (.xlsx, .xls) o PDF
                  </p>
                </label>
              </div>

              {isUploading && (
                <div className="mt-4">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{uploadProgress}% completado</p>
                </div>
              )}

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">💡 Funcionalidades</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Análisis automático de Excel</li>
                  <li>• Generación de gráficas</li>
                  <li>• Chat inteligente</li>
                  <li>• Insights automáticos</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Documents List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">📋 Documentos ({documents.length})</h2>
              </div>
              
              <div className="divide-y">
                {documents.map((doc) => (
                  <div key={doc.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl">{getFileIcon(doc.type)}</div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{doc.filename}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{formatFileSize(doc.size)}</span>
                            <span>•</span>
                            <span>{doc.uploadDate}</span>
                            <span>•</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              doc.type === 'Excel' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {doc.type}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/chat?doc=${doc.filename}`}
                          className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                        >
                          💬 Chat
                        </Link>
                        {doc.type === 'Excel' && (
                          <button className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm hover:bg-green-200 transition-colors">
                            📊 Análisis
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">⚙️ Estado del Sistema</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">Backend RAG Activo</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">Excel Processor</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">Base de Datos</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">Chat IA</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}