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
}

export default function DashboardPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const router = useRouter()

  // Verificar login
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn')
    if (!isLoggedIn) {
      router.push('/login')
      return
    }

    // Cargar documentos existentes
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
      },
      {
        id: '4',
        filename: 'Reporte_Marketing.pdf', 
        size: 78234,
        uploadDate: '2025-05-28',
        type: 'PDF'
      },
      {
        id: '5',
        filename: 'Inventario_Mayo.xlsx', 
        size: 91567,
        uploadDate: '2025-05-27',
        type: 'Excel'
      }
    ])
  }, [router])

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

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case 'Excel': return 'bg-green-100 text-green-800'
      case 'PDF': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
            <p className="text-gray-600">Gestiona tus archivos y documentos</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="text-2xl mr-4">📁</div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
                  <p className="text-gray-600">Total Documents</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="text-2xl mr-4">📊</div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {documents.filter(d => d.type === 'Excel').length}
                  </p>
                  <p className="text-gray-600">Excel Files</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="text-2xl mr-4">📄</div>
                <div>
                  <p className="text-2xl font-bold text-red-600">
                    {documents.filter(d => d.type === 'PDF').length}
                  </p>
                  <p className="text-gray-600">PDF Files</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="text-2xl mr-4">🧠</div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">1</p>
                  <p className="text-gray-600">Analyzed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Documents</h2>
            <Link
              href="/upload"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <span className="mr-2">⬆️</span>
              Upload Document
            </Link>
          </div>

          {/* Documents Table */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-xl mr-3">{getFileIcon(doc.type)}</div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {doc.filename}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getFileTypeColor(doc.type)}`}>
                        {doc.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatFileSize(doc.size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {doc.uploadDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          href={`/chat?doc=${doc.filename}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Chat
                        </Link>
                        {doc.type === 'Excel' && (
                          <button className="text-green-600 hover:text-green-900">
                            Analyze
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
  )
}