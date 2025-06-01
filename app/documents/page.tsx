'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ModernDocumentsPage() {
  const [currentTime, setCurrentTime] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: "Reporte Financiero Q4 2024.pdf",
      status: "vectorized",
      uploadDate: "2024-12-15",
      size: "2.3 MB",
      type: "pdf",
      vectorCount: 1247
    },
    {
      id: 2,
      name: "Manual de Usuario RAG.docx",
      status: "vectorized",
      uploadDate: "2024-12-14",
      size: "1.8 MB",
      type: "docx",
      vectorCount: 892
    },
    {
      id: 3,
      name: "Análisis de Mercado 2025.pdf",
      status: "processing",
      uploadDate: "2024-12-14",
      size: "5.1 MB",
      type: "pdf",
      vectorCount: 0
    },
    {
      id: 4,
      name: "Presentación Ventas.pptx",
      status: "vectorized",
      uploadDate: "2024-12-13",
      size: "4.2 MB",
      type: "pptx",
      vectorCount: 654
    },
    {
      id: 5,
      name: "Base de Datos Clientes.txt",
      status: "vectorized",
      uploadDate: "2024-12-12",
      size: "892 KB",
      type: "txt",
      vectorCount: 1834
    },
    {
      id: 6,
      name: "Documentación API.md",
      status: "error",
      uploadDate: "2024-12-11",
      size: "156 KB",
      type: "md",
      vectorCount: 0
    }
  ])
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

  const getStatusBadge = (status) => {
    const styles = {
      vectorized: {
        background: 'rgba(16, 185, 129, 0.2)',
        color: '#10b981',
        border: '1px solid rgba(16, 185, 129, 0.3)'
      },
      processing: {
        background: 'rgba(251, 191, 36, 0.2)',
        color: '#fbbf24',
        border: '1px solid rgba(251, 191, 36, 0.3)'
      },
      error: {
        background: 'rgba(239, 68, 68, 0.2)',
        color: '#ef4444',
        border: '1px solid rgba(239, 68, 68, 0.3)'
      }
    }

    const statusText = {
      vectorized: 'Vectorizado',
      processing: 'Procesando',
      error: 'Error'
    }

    return (
      <span style={{
        ...styles[status],
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600'
      }}>
        {statusText[status]}
      </span>
    )
  }

  const getFileIcon = (type) => {
    const icons = {
      pdf: '📄',
      docx: '📝',
      txt: '📄',
      pptx: '📊',
      md: '📋'
    }
    return icons[type] || '📄'
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalDocuments = documents.length
  const vectorizedCount = documents.filter(doc => doc.status === 'vectorized').length
  const processingCount = documents.filter(doc => doc.status === 'processing').length
  const errorCount = documents.filter(doc => doc.status === 'error').length

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
          <Link href="/upload" style={{ color: 'rgba(255, 255, 255, 0.8)', textDecoration: 'none', padding: '8px 16px', borderRadius: '8px', marginRight: '12px' }}>Upload</Link>
          <Link href="/documents" style={{ background: 'rgba(139, 92, 246, 0.3)', color: 'white', textDecoration: 'none', padding: '8px 16px', borderRadius: '8px', marginRight: '12px' }}>Documents</Link>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        
        {/* Header Section */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '32px' }}>📋</div>
              <h1 style={{ fontSize: '36px', fontWeight: 'bold' }}>Gestión de Documentos</h1>
            </div>
            <Link 
              href="/upload" 
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                color: 'white',
                textDecoration: 'none',
                padding: '12px 24px',
                borderRadius: '12px',
                fontWeight: '600'
              }}
            >
              📄 Subir Documentos
            </Link>
          </div>
          <p style={{ fontSize: '18px', opacity: '0.8' }}>
            Administra y consulta todos los documentos del sistema RAG
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '20px', 
          marginBottom: '40px' 
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px', color: '#3b82f6' }}>{totalDocuments}</div>
            <div style={{ fontSize: '14px', opacity: '0.8' }}>Total Documentos</div>
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px', color: '#10b981' }}>{vectorizedCount}</div>
            <div style={{ fontSize: '14px', opacity: '0.8' }}>Vectorizados</div>
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px', color: '#fbbf24' }}>{processingCount}</div>
            <div style={{ fontSize: '14px', opacity: '0.8' }}>Procesando</div>
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px', color: '#ef4444' }}>{errorCount}</div>
            <div style={{ fontSize: '14px', opacity: '0.8' }}>Con Errores</div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.1)', 
          backdropFilter: 'blur(20px)', 
          border: '1px solid rgba(255, 255, 255, 0.2)', 
          borderRadius: '20px', 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          padding: '24px', 
          marginBottom: '30px' 
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                Buscar documentos
              </label>
              <input
                type="text"
                placeholder="Buscar por nombre de archivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  color: 'white',
                  width: '100%',
                  fontSize: '16px'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                Estado
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: 'white',
                  fontSize: '14px',
                  width: '100%'
                }}
              >
                <option value="all">Todos los estados</option>
                <option value="vectorized">Vectorizados</option>
                <option value="processing">Procesando</option>
                <option value="error">Con errores</option>
              </select>
            </div>
          </div>
        </div>

        {/* Documents List */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.1)', 
          backdropFilter: 'blur(20px)', 
          border: '1px solid rgba(255, 255, 255, 0.2)', 
          borderRadius: '20px', 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          padding: '30px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>
              Documentos ({filteredDocuments.length})
            </h2>
            <button style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer'
            }}>
              🔄 Actualizar
            </button>
          </div>
          
          <div>
            {filteredDocuments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', opacity: '0.7' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
                <p>No se encontraron documentos que coincidan con los filtros</p>
              </div>
            ) : (
              filteredDocuments.map((doc) => (
                <div key={doc.id} style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '12px',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '40px 2fr 1fr 1fr 1fr 120px', gap: '16px', alignItems: 'center' }}>
                    <div style={{ fontSize: '24px' }}>{getFileIcon(doc.type)}</div>
                    
                    <div>
                      <div style={{ fontWeight: '600', marginBottom: '4px' }}>{doc.name}</div>
                      <div style={{ fontSize: '14px', opacity: '0.7' }}>{doc.size}</div>
                    </div>
                    
                    <div>{getStatusBadge(doc.status)}</div>
                    
                    <div style={{ fontSize: '14px', opacity: '0.8' }}>
                      {new Date(doc.uploadDate).toLocaleDateString('es-ES')}
                    </div>
                    
                    <div style={{ fontSize: '14px', opacity: '0.8' }}>
                      {doc.vectorCount > 0 ? `${doc.vectorCount.toLocaleString()} vectores` : '—'}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          color: 'white',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                        title="Ver detalles"
                      >
                        👁️
                      </button>
                      <button 
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          color: 'white',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}