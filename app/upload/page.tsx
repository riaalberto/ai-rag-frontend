'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '../components/Sidebar'

export default function UploadPage() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn')
    if (!isLoggedIn) {
      router.push('/login')
    }
  }, [router])

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file)
    setIsUploading(true)
    setUploadProgress(0)
    setUploadSuccess(false)

    try {
      // Simular progreso de upload con animación fluida
      for (let i = 0; i <= 100; i += 2) {
        setUploadProgress(i)
        await new Promise(resolve => setTimeout(resolve, 50))
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

      setUploadSuccess(true)
      
      // Auto-redirect después de éxito
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)

    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Error al subir el archivo')
    } finally {
      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress(0)
      }, 1000)
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
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Sidebar />
      
      <div className="flex-1">
        {/* Header */}
        <div className="glass border-b border-white/20 backdrop-blur-xl">
          <div className="px-8 py-6">
            <div className="animate-slide-up">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                Upload Document
              </h1>
              <p className="text-gray-600">Sube archivos Excel o PDF para análisis automático con IA</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            
            {/* Upload Area */}
            <div className="glass rounded-3xl border border-white/20 p-8 mb-8 animate-scale-in">
              <div
                className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-500 ${
                  dragActive 
                    ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-purple-50 scale-105' 
                    : isUploading 
                      ? 'border-gray-300 bg-gray-50' 
                      : uploadSuccess
                        ? 'border-green-400 bg-gradient-to-br from-green-50 to-emerald-50'
                        : 'border-gray-300 hover:border-blue-300 hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-purple-50/50'
                } overflow-hidden`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-500/5 to-blue-500/5 rounded-full translate-y-12 -translate-x-12"></div>

                {uploadSuccess ? (
                  <div className="animate-scale-in">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-4xl mx-auto mb-6 shadow-lg animate-bounce">
                      ✓
                    </div>
                    <h3 className="text-2xl font-bold text-green-700 mb-2">
                      ¡Upload Exitoso!
                    </h3>
                    <p className="text-green-600 mb-4">
                      {uploadedFile?.name} se ha subido correctamente
                    </p>
                    <p className="text-sm text-gray-600">
                      Redirigiendo al dashboard en 2 segundos...
                    </p>
                  </div>
                ) : isUploading ? (
                  <div className="animate-fade-in">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl mx-auto mb-6 shadow-lg">
                      <div className="loading-pulse">📤</div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      Subiendo archivo...
                    </h3>
                    <div className="w-full max-w-md mx-auto mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>{uploadedFile?.name}</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div 
                          className="progress-bar h-3 transition-all duration-300 ease-out"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Procesando con análisis IA automático...
                    </p>
                  </div>
                ) : (
                  <div className="relative z-10">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl mx-auto mb-6 shadow-lg hover:scale-110 transition-transform duration-300">
                      📁
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Arrastra archivos aquí
                    </h3>
                    <p className="text-gray-600 mb-6">
                      O haz click para seleccionar archivos
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
                      className="btn-primary hover-lift cursor-pointer inline-block"
                    >
                      <span className="mr-2">📎</span>
                      Seleccionar Archivos
                    </label>
                    <p className="text-sm text-gray-500 mt-4">
                      Soporta: Excel (.xlsx, .xls), PDF (.pdf) • Máximo 10MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="glass hover-lift p-6 rounded-2xl border border-white/20 animate-slide-up" style={{animationDelay: '0.2s'}}>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white text-xl mb-4 shadow-lg">
                  📊
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Excel Analysis</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                    Extracción automática de datos
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                    Análisis estadístico avanzado
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                    Generación de gráficas
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                    Insights powered by IA
                  </li>
                </ul>
              </div>

              <div className="glass hover-lift p-6 rounded-2xl border border-white/20 animate-slide-up" style={{animationDelay: '0.3s'}}>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-xl mb-4 shadow-lg">
                  🚀
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Procesamiento Rápido</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                    Upload en tiempo real
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                    Análisis automático instantáneo
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                    Arquitectura modular escalable
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                    Backend optimizado Railway
                  </li>
                </ul>
              </div>

              <div className="glass hover-lift p-6 rounded-2xl border border-white/20 animate-slide-up" style={{animationDelay: '0.4s'}}>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center text-white text-xl mb-4 shadow-lg">
                  🎯
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Formatos Soportados</h3>
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
                    Word (.docx) - Próximamente
                  </li>
                  <li className="flex items-center opacity-50">
                    <span className="text-lg mr-2">🎨</span>
                    PowerPoint (.pptx) - Próximamente
                  </li>
                </ul>
              </div>
            </div>

            {/* Process Flow */}
            <div className="glass rounded-2xl border border-white/20 p-8 mb-8 animate-slide-up" style={{animationDelay: '0.5s'}}>
              <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                ¿Cómo funciona el análisis automático?
              </h3>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-4 shadow-lg">
                    1️⃣
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Upload</h4>
                  <p className="text-sm text-gray-600">
                    Sube tu archivo Excel o PDF de forma segura
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-4 shadow-lg">
                    2️⃣
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Extracción</h4>
                  <p className="text-sm text-gray-600">
                    Nuestro sistema extrae datos automáticamente
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-4 shadow-lg">
                    3️⃣
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Análisis IA</h4>
                  <p className="text-sm text-gray-600">
                    IA genera insights y gráficas automáticamente
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-4 shadow-lg">
                    4️⃣
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Chat</h4>
                  <p className="text-sm text-gray-600">
                    Haz preguntas sobre tus datos procesados
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="glass rounded-2xl border border-white/20 p-8 animate-slide-up" style={{animationDelay: '0.6s'}}>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Actividad Reciente</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200/50">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white text-lg shadow">
                      📊
                    </div>
                    <div className="ml-4">
                      <p className="font-semibold text-gray-900">Datos_Gonpal_1.xlsx</p>
                      <p className="text-sm text-gray-600">Subido y analizado exitosamente • 3 gráficas generadas</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium border border-green-200">
                      ✓ Completado
                    </span>
                    <button className="text-green-600 hover:text-green-700 font-medium text-sm">
                      Ver análisis →
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-lg shadow">
                      📄
                    </div>
                    <div className="ml-4">
                      <p className="font-semibold text-gray-900">CFF.pdf</p>
                      <p className="text-sm text-gray-600">Texto extraído e indexado para búsqueda</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium border border-blue-200">
                      ✓ Indexado
                    </span>
                    <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                      Hacer preguntas →
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-200/50">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center text-white text-lg shadow">
                      📊
                    </div>
                    <div className="ml-4">
                      <p className="font-semibold text-gray-900">Ventas_Q1_2025.xlsx</p>
                      <p className="text-sm text-gray-600">12 insights generados automáticamente</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium border border-purple-200">
                      🧠 Analizado
                    </span>
                    <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                      Ver insights →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}