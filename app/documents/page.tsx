'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Conditional Supabase import to handle build errors
let supabase = null

const initSupabase = async () => {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('⚠️ Supabase credentials not configured')
      return null
    }

    const { createClient } = await import('@supabase/supabase-js')
    return createClient(supabaseUrl, supabaseAnonKey)
  } catch (error) {
    console.error('❌ Error initializing Supabase:', error)
    return null
  }
}

export default function DocumentsPageSafe() {
  const [currentTime, setCurrentTime] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [connectionStatus, setConnectionStatus] = useState('connecting')
  const [supabaseClient, setSupabaseClient] = useState(null)
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

  useEffect(() => {
    initializeAndFetch()
  }, [])

  const initializeAndFetch = async () => {
    try {
      setLoading(true)
      setConnectionStatus('connecting')
      
      const client = await initSupabase()
      setSupabaseClient(client)
      
      if (!client) {
        // Fallback to mock data if Supabase not available
        setDocuments(getMockDocuments())
        setConnectionStatus('mock')
        setError('Usando datos de demostración (Supabase no configurado)')
        setLoading(false)
        return
      }

      await fetchRealDocuments(client)
    } catch (error) {
      console.error('❌ Error en inicialización:', error)
      setDocuments(getMockDocuments())
      setConnectionStatus('error')
      setError('Error de conexión - usando datos de demostración')
      setLoading(false)
    }
  }

  const fetchRealDocuments = async (client) => {
    if (!client) {
      setDocuments(getMockDocuments())
      setConnectionStatus('mock')
      setLoading(false)
      return
    }

    try {
      setError('')
      console.log('🔄 Conectando a Supabase...')
      
      // Test connection first
      const { data: testData, error: testError } = await client
        .from('documents')
        .select('count')
        .limit(1)

      if (testError) {
        console.error('❌ Error de conexión:', testError)
        setError(`Error de conexión: ${testError.message}`)
        setConnectionStatus('error')
        setDocuments(getMockDocuments())
        setLoading(false)
        return
      }

      console.log('✅ Conexión exitosa')
      setConnectionStatus('connected')

      // Fetch all documents
      const { data, error: fetchError } = await client
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('❌ Error obteniendo documentos:', fetchError)
        setError(`Error obteniendo datos: ${fetchError.message}`)
        setConnectionStatus('error')
        setDocuments(getMockDocuments())
        setLoading(false)
        return
      }

      console.log('📊 Datos obtenidos:', data)

      // Transform Supabase data to our format
      const transformedDocs = data.map(doc => ({
        id: doc.id,
        name: doc.name || `Documento ${doc.id.slice(0, 8)}`,
        status: determineStatus(doc),
        uploadDate: formatDate(doc.created_at),
        size: estimateFileSize(doc.content),
        type: getFileExtension(doc.name || 'unknown.txt'),
        vectorCount: estimateVectorCount(doc.content),
        content: doc.content,
        user_id: doc.user_id
      }))

      setDocuments(transformedDocs)
      console.log('✅ Documentos procesados:', transformedDocs.length)
      setConnectionStatus('connected')

    } catch (error) {
      console.error('❌ Error general:', error)
      setError(`Error de conexión: ${error.message}`)
      setConnectionStatus('error')
      setDocuments(getMockDocuments())
    } finally {
      setLoading(false)
    }
  }

  const getMockDocuments = () => [
    {
      id: '1',
      name: "Datos_Gonpal_1.xlsx",
      status: "vectorized",
      uploadDate: "2024-12-15",
      size: "2.3 MB",
      type: "xlsx",
      vectorCount: 1247
    },
    {
      id: '2',
      name: "ANALYSIS_Datos_Gonpal_1.xlsx", 
      status: "vectorized",
      uploadDate: "2024-12-14",
      size: "1.8 MB", 
      type: "xlsx",
      vectorCount: 892
    },
    {
      id: '3',
      name: "FAQ_Sistema.txt",
      status: "vectorized",
      uploadDate: "2024-12-14", 
      size: "45 KB",
      type: "txt",
      vectorCount: 156
    },
    {
      id: '4',
      name: "Manual_Usuario.pdf",
      status: "vectorized",
      uploadDate: "2024-12-13",
      size: "4.2 MB",
      type: "pdf", 
      vectorCount: 654
    },
    {
      id: '5',
      name: "CFF.pdf",
      status: "vectorized",
      uploadDate: "2024-12-12",
      size: "892 KB",
      type: "pdf",
      vectorCount: 342
    },
    {
      id: '6',
      name: "Guia_Procesos.pdf",
      status: "vectorized", 
      uploadDate: "2024-12-11",
      size: "1.5 MB",
      type: "pdf",
      vectorCount: 478
    },
    {
      id: '7',
      name: "Politicas_Empresa.docx",
      status: "vectorized",
      uploadDate: "2024-12-10",
      size: "756 KB", 
      type: "docx",
      vectorCount: 289
    }
  ]

  const determineStatus = (doc) => {
    if (doc.content && doc.content.length > 100) {
      return 'vectorized'
    } else if (doc.content && doc.content.length > 0) {
      return 'processing'
    }
    return 'error'
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toISOString().split('T')[0]
  }

  const getFileExtension = (filename) => {
    if (!filename) return 'unknown'
    return filename.split('.').pop()?.toLowerCase() || 'unknown'
  }

  const estimateFileSize = (content) => {
    if (!content) return '0 KB'
    const bytes = new Blob([content]).size
    return formatFileSize(bytes)
  }

  const estimateVectorCount = (content) => {
    if (!content) return 0
    return Math.floor(content.length / 100)
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

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
      doc: '📝',
      xlsx: '📊',
      xls: '📊',
      txt: '📄',
      pptx: '📊',
      md: '📋',
      unknown: '📄'
    }
    return icons[type] || '📄'
  }

  const deleteDocument = async (docId, docName) => {
    if (!supabaseClient) {
      alert('Función no disponible en modo demostración')
      return
    }

    if (confirm(`¿Estás seguro de eliminar "${docName}"?`)) {
      try {
        setLoading(true)
        const { error } = await supabaseClient
          .from('documents')
          .delete()
          .eq('id', docId)

        if (error) {
          alert(`Error eliminando documento: ${error.message}`)
          return
        }

        await fetchRealDocuments(supabaseClient)
        alert('Documento eliminado exitosamente')
      } catch (error) {
        alert(`Error: ${error.message}`)
      } finally {
        setLoading(false)
      }
    }
  }

  const viewDocument = (doc) => {
    const preview = doc.content ? doc.content.slice(0, 200) + '...' : 'Sin contenido'
    alert(`📄 ${doc.name}\n\n📊 Tamaño: ${doc.size}\n🔢 Vectores: ${doc.vectorCount}\n📅 Creado: ${doc.uploadDate}\n\n📝 Vista previa:\n${preview}`)
  }

  const getConnectionBadge = () => {
    const styles = {
      connecting: { bg: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24', text: '🔄 Conectando...' },
      connected: { bg: 'rgba(16, 185, 129, 0.2)', color: '#10b981', text: '🔗 Conectado' },
      mock: { bg: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', text: '📋 Demo' },
      error: { bg: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', text: '❌ Error' }
    }
    
    const style = styles[connectionStatus]
    return (
      <div style={{
        background: style.bg,
        color: style.color,
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600'
      }}>
        {style.text}
      </div>
    )
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
          <Link href="/analyzer" style={{ color: 'rgba(255, 255, 255, 0.8)', textDecoration: 'none', padding: '8px 16px', borderRadius: '8px', marginRight: '12px' }}>📊 Excel Analyzer</Link>
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
              {getConnectionBadge()}
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
            {connectionStatus === 'connected' 
              ? '🔗 Conectado a Supabase: peeljvqscrkqmdbvfeag.supabase.co' 
              : connectionStatus === 'mock' 
                ? '📋 Mostrando datos de demostración'
                : '🔄 Conectando a base de datos'
            } - Total: {totalDocuments} documentos
          </p>
          {error && (
            <div style={{ 
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              marginTop: '12px',
              color: '#ef4444'
            }}>
              ⚠️ {error}
            </div>
          )}
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
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 120px', gap: '20px', alignItems: 'end' }}>
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

            <button 
              onClick={() => fetchRealDocuments(supabaseClient)}
              disabled={loading}
              style={{
                background: loading ? 'rgba(139, 92, 246, 0.5)' : 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                border: 'none',
                color: 'white',
                padding: '12px 16px',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '600'
              }}
            >
              {loading ? '⏳' : '🔄'} Sincronizar
            </button>
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
              📊 Documentos del Sistema ({filteredDocuments.length})
            </h2>
          </div>
          
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', opacity: '0.7' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                <p>Cargando documentos...</p>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', opacity: '0.7' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
                <p>No se encontraron documentos</p>
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
                      <div style={{ fontSize: '12px', opacity: '0.5', fontFamily: 'monospace' }}>
                        ID: {doc.id.toString().slice(0, 8)}...
                      </div>
                    </div>
                    
                    <div>{getStatusBadge(doc.status)}</div>
                    
                    <div style={{ fontSize: '14px', opacity: '0.8' }}>
                      {doc.uploadDate}
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
                        onClick={() => viewDocument(doc)}
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
                        onClick={() => deleteDocument(doc.id, doc.name)}
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