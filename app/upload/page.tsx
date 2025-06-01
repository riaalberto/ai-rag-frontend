'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function UploadPage() {
  const [userEmail, setUserEmail] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileUpload = async (file: File) => {
    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          alert('Archivo subido exitosamente!')
          return 100
        }
        return prev + 10
      })
    }, 200)

    // Here you would typically upload to your backend
    console.log('Uploading file:', file.name)
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
              <Link href="/analytics" className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Analytics
              </Link>
              <Link href="/upload" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium border-b-2 border-blue-600">
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <span className="text-yellow-600 mr-3">📤</span>
              Subir Documentos
            </h1>
            <p className="mt-2 text-gray-600">Arrastra archivos aquí o haz clic para seleccionar archivos que se procesarán automáticamente para el sistema RAG.</p>
          </div>

          {/* Upload Area */}
          <div className="max-w-4xl mx-auto">
            <div 
              className={`relative border-2 border-dashed rounded-lg p-12 text-center hover:border-gray-400 transition-colors ${
                isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.xlsx,.xls"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              <div className="space-y-4">
                <div className="text-6xl text-gray-400">
                  📁
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    Arrastra archivos aquí
                  </h3>
                  <p className="text-gray-600 mb-4">
                    o haz clic para seleccionar archivos
                  </p>
                  <p className="text-sm text-gray-500">
                    Soporta: PDF, DOC, DOCX, TXT (máx. 100MB por archivo)
                  </p>
                </div>
              </div>

              {isUploading && (
                <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-lg font-medium text-gray-900 mb-2">Subiendo archivo...</p>
                    <div className="w-64 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{width: `${uploadProgress}%`}}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{uploadProgress}% completado</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Information Cards */}
          <div className="max-w-4xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Formatos Soportados */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 text-xl">📄</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Formatos Soportados</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• PDF - Documentos portátiles</li>
                  <li>• DOC/DOCX - Microsoft Word</li>
                  <li>• TXT - Archivos de texto</li>
                  <li>• XLS/XLSX - Excel (próximamente)</li>
                </ul>
              </div>
            </div>

            {/* Procesamiento Automático */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 text-xl">⚙️</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Procesamiento Automático</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Extracción de texto</li>
                  <li>• Vectorización inteligente</li>
                  <li>• Indexación para búsqueda</li>
                  <li>• Preparación para chat RAG</li>
                </ul>
              </div>
            </div>

            {/* Seguridad */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-purple-600 text-xl">🔒</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Seguridad y Privacidad</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Encriptación en tránsito</li>
                  <li>• Almacenamiento seguro</li>
                  <li>• Acceso controlado</li>
                  <li>• Eliminación automática opcional</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Recent Uploads */}
          <div className="max-w-4xl mx-auto mt-12">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Archivos Recientes</h3>
              </div>
              <div className="p-6">
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-4">📁</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay archivos subidos recientemente</h3>
                  <p className="text-gray-600">Los archivos que subas aparecerán aquí para revisión y gestión.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}