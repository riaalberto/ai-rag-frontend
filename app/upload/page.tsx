'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '../components/Sidebar'

export default function UploadPage() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn')
    if (!isLoggedIn) {
      router.push('/login')
    }
  }, [router])

  const handleFileUpload = async (file: File) => {
    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simular progreso de upload
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i)
        await new Promise(resolve => setTimeout(resolve, 150))
      }

      // Aquí iría la llamada real al backend
      const formData = new FormData()
      formData.append('file', file)
      formData.append('user_id', '119f7084-be9e-416f-81d6-3ffeadb062d5')
      
      /*
      const response = await fetch('https://fastapi-service-production-4f6c.up.railway.app/upload', {
        method: 'POST',
        body: formData
      })
      */

      alert(`Archivo ${file.name} subido exitosamente`)
      
      // Redirigir al dashboard
      router.push('/dashboard')

    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Error al subir el archivo')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0])
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Upload Document</h1>
            <p className="text-gray-600">Sube archivos Excel para análisis automático</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="max-w-2xl mx-auto">
            
            {/* Upload Area */}
            <div className="bg-white border border-gray-200 rounded-lg p-8">
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                  dragActive 
                    ? 'border-blue-400 bg-blue-50' 
                    : isUploading 
                      ? 'border-gray-300 bg-gray-50' 
                      : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {isUploading ? (
                  <div>
                    <div className="text-4xl mb-4">⏳</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Uploading...
                    </h3>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600">{uploadProgress}% completed</p>
                  </div>
                ) : (
                  <div>
                    <div className="text-4xl mb-4">📁</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Drop files here, or click to browse
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Supports: Excel (.xlsx, .xls), PDF (.pdf)
                    </p>
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept=".xlsx,.xls,.pdf"
                      onChange={handleFileChange}
                      disabled={isUploading}
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
                    >
                      Select Files
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Excel Analysis</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Automatic data extraction
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Statistical analysis
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Chart generation
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    AI-powered insights
                  </li>
                </ul>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Supported Formats</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <span className="text-lg mr-2">📊</span>
                    Excel (.xlsx, .xls)
                  </li>
                  <li className="flex items-center">
                    <span className="text-lg mr-2">📄</span>
                    PDF (.pdf)
                  </li>
                  <li className="flex items-center opacity-50">
                    <span className="text-lg mr-2">📝</span>
                    Word (.docx) - Coming soon
                  </li>
                  <li className="flex items-center opacity-50">
                    <span className="text-lg mr-2">🎨</span>
                    PowerPoint (.pptx) - Coming soon
                  </li>
                </ul>
              </div>
            </div>

            {/* Recent Uploads */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <span className="text-lg mr-3">📊</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Datos_Gonpal_1.xlsx</p>
                      <p className="text-xs text-gray-500">Uploaded and analyzed successfully</p>
                    </div>
                  </div>
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    Completed
                  </span>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <span className="text-lg mr-3">📄</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">CFF.pdf</p>
                      <p className="text-xs text-gray-500">Text extracted and indexed</p>
                    </div>
                  </div>
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    Completed
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}