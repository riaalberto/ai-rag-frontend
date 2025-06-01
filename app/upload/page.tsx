'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ModernUploadPage() {
  const [selectedFiles, setSelectedFiles] = useState([])
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [currentTime, setCurrentTime] = useState('')
  const router = useRouter()

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }))
    }
    
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('userEmail')
    router.push('/login')
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  const handleFiles = (files) => {
    const fileArray = Array.from(files)
    setSelectedFiles(prev => [...prev, ...fileArray])
  }

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return
    
    setIsUploading(true)
    setUploadProgress(0)
    
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i)
      await new Promise(resolve => setTimeout(resolve, 200))
    }
    
    setIsUploading(false)
    setSelectedFiles([])
    alert('¡Archivos subidos exitosamente!')
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%)', 
      minHeight: '100vh',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
    }}>
      {/* Header */}
      <header style={{ 
        background: 'rgba(255, 255, 255, 0.1)', 
        backdropFilter: 'blur(20px)', 
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '20px 0'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: 'bold'
              }}>
                AI
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Sistema RAG Avanzado</h1>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <span style={{ fontSize: '14px', opacity: '0.8' }}>{currentTime}</span>
              <button
                onClick={handleLogout}
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ padding: '20px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Link href="/dashboard" style={{ color: 'rgba(255, 255, 255, 0.8)', textDecoration: 'none', padding: '8px 16px', borderRadius: '8px', marginRight: '12px' }}>Dashboard</Link>
          <Link href="/chat" style={{ color: 'rgba(255, 255, 255, 0.8)', textDecoration: 'none', padding: '8px 16px', borderRadius: '8px', marginRight: '12px' }}>Chat</Link>
          <Link href="/analytics" style={{ color: 'rgba(255, 255, 255, 0.8)', textDecoration: 'none', padding: '8px 16px', borderRadius: '8px', marginRight: '12px' }}>Analytics</Link>
          <Link href="/upload" style={{ background: 'rgba(139, 92, 246, 0.3)', color: 'white', textDecoration: 'none', padding: '8px 16px', borderRadius: '8px', marginRight: '12px' }}>Upload</Link>
          <Link href="/documents" style={{ color: 'rgba(255, 255, 255, 0.8)', textDecoration: 'none', padding: '8px 16px', borderRadius: '8px', marginRight: '12px' }}>Documents</Link>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        
        {/* Header Section */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ fontSize: '32px' }}>📄</div>
            <h1 style={{ fontSize: '36px', fontWeight: 'bold' }}>Subir Documentos</h1>
          </div>
          <p style={{ fontSize: '18px', opacity: '0.8', marginBottom: '8px' }}>
            Arrastra archivos aquí o haz clic para seleccionar archivos que se procesarán automáticamente para el sistema RAG.
          </p>
          <Link href="/documents" style={{ color: '#8b5cf6', textDecoration: 'none' }}>
            ← Volver a Gestión de Documentos
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px' }}>
          
          {/* Upload Area */}
          <div>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              backdropFilter: 'blur(20px)', 
              border: '1px solid rgba(255, 255, 255, 0.2)', 
              borderRadius: '20px', 
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              padding: '30px', 
              marginBottom: '30px' 
            }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Cargar Archivos</h2>
              
              {/* Drop Zone */}
              <div
                style={{
                  border: dragActive ? '2px dashed #8b5cf6' : '2px dashed rgba(255, 255, 255, 0.3)',
                  borderRadius: '16px',
                  padding: '40px',
                  textAlign: 'center',
                  background: dragActive ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('fileInput').click()}
              >
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
                <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Arrastra archivos aquí</h3>
                <p style={{ opacity: '0.8', marginBottom: '16px' }}>o haz clic para seleccionar archivos</p>
                <p style={{ fontSize: '14px', opacity: '0.6' }}>
                  Soporta: PDF, DOC, DOCX, TXT (máx. 100MB por archivo)
                </p>
                
                <input
                  id="fileInput"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleChange}
                  style={{ display: 'none' }}
                />
              </div>

              {/* File List */}
              {selectedFiles.length > 0 && (
                <div style={{ marginTop: '30px' }}>
                  <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Archivos Seleccionados ({selectedFiles.length})</h3>
                  {selectedFiles.map((file, index) => (
                    <div key={index} style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      padding: '16px',
                      marginBottom: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>{file.name}</div>
                        <div style={{ fontSize: '14px', opacity: '0.7' }}>{formatFileSize(file.size)}</div>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          color: 'white',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                  
                  {isUploading && (
                    <div style={{ marginTop: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span>Subiendo archivos...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '8px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                          width: `${uploadProgress}%`,
                          transition: 'width 0.3s ease'
                        }}></div>
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={uploadFiles}
                    disabled={isUploading}
                    style={{
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                      border: 'none',
                      color: 'white',
                      padding: '12px 24px',
                      borderRadius: '12px',
                      fontWeight: '600',
                      cursor: isUploading ? 'not-allowed' : 'pointer',
                      width: '100%',
                      marginTop: '20px',
                      opacity: isUploading ? 0.7 : 1
                    }}
                  >
                    {isUploading ? 'Subiendo...' : 'Subir Archivos'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Info */}
          <div>
            {/* Supported Formats */}
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              backdropFilter: 'blur(20px)', 
              border: '1px solid rgba(255, 255, 255, 0.2)', 
              borderRadius: '20px', 
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              padding: '24px', 
              marginBottom: '24px' 
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>Formatos Soportados</h3>
              
              <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
                <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>📄 PDF</div>
                <div style={{ fontSize: '14px', opacity: '0.8' }}>Documentos portátiles</div>
              </div>
              
              <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
                <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>📝 DOC/DOCX</div>
                <div style={{ fontSize: '14px', opacity: '0.8' }}>Microsoft Word</div>
              </div>
              
              <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
                <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>📄 TXT</div>
                <div style={{ fontSize: '14px', opacity: '0.8' }}>Archivos de texto</div>
              </div>
            </div>

            {/* Processing Info */}
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              backdropFilter: 'blur(20px)', 
              border: '1px solid rgba(255, 255, 255, 0.2)', 
              borderRadius: '20px', 
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              padding: '24px' 
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>Procesamiento Automático</h3>
              
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                  <span style={{ fontSize: '14px' }}>Extracción de texto</span>
                </div>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                  <span style={{ fontSize: '14px' }}>Vectorización inteligente</span>
                </div>
              </div>
              
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                  <span style={{ fontSize: '14px' }}>Indexación para búsqueda</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}