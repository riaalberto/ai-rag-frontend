'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter
} from 'recharts'

interface ExcelData {
  [key: string]: any
}

interface ColumnAnalysis {
  name: string
  type: 'number' | 'date' | 'text' | 'currency' | 'percentage'
  uniqueValues: number
  nullCount: number
  sample: any[]
}

interface ChartSuggestion {
  type: 'bar' | 'line' | 'pie' | 'area' | 'scatter'
  title: string
  description: string
  confidence: number
  xAxis?: string
  yAxis?: string
  category?: string
}
export default function ExcelAnalyzer() {
  const router = useRouter()
  const [currentTime, setCurrentTime] = useState('')
  
  // Estados principales
  const [file, setFile] = useState<File | null>(null)
  const [rawData, setRawData] = useState<ExcelData[]>([])
  const [columns, setColumns] = useState<ColumnAnalysis[]>([])
  const [suggestions, setSuggestions] = useState<ChartSuggestion[]>([])
  const [selectedCharts, setSelectedCharts] = useState<ChartSuggestion[]>([])
  const [processedData, setProcessedData] = useState<any[]>([])
  
  // Estados de UI
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [viewMode, setViewMode] = useState<'upload' | 'analysis' | 'charts'>('upload')
  const [dataPreview, setDataPreview] = useState<ExcelData[]>([])

  // Colores para gráficas
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff', '#00ffff', '#ff0000']

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('es-MX'))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])
// Función para leer archivo Excel
  const handleFileUpload = async (selectedFile: File) => {
    if (!selectedFile) return
    
    setFile(selectedFile)
    setIsAnalyzing(true)
    setViewMode('analysis')
    
    try {
      console.log('📊 Analizando archivo Excel:', selectedFile.name)
      
      // Simulación de lectura de Excel (aquí irían librerías como SheetJS)
      // Por ahora simulamos datos para demostrar funcionalidad
      const mockData = generateMockExcelData(selectedFile.name)
      
      setRawData(mockData)
      setDataPreview(mockData.slice(0, 10)) // Solo primeras 10 filas para preview
      
      // Analizar columnas
      const columnAnalysis = analyzeColumns(mockData)
      setColumns(columnAnalysis)
      
      // Generar sugerencias automáticas
      const chartSuggestions = generateChartSuggestions(columnAnalysis, mockData)
      setSuggestions(chartSuggestions)
      
      setAnalysisComplete(true)
      
    } catch (error) {
      console.error('❌ Error analizando archivo:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Generar datos mock basados en el nombre del archivo
  const generateMockExcelData = (filename: string): ExcelData[] => {
    const isLargeFile = filename.toLowerCase().includes('grande') || filename.toLowerCase().includes('large')
    const rowCount = isLargeFile ? 10000 : 1000
    
    const data: ExcelData[] = []
    const vendedores = ['Juan Pérez', 'María García', 'Carlos López', 'Ana Martínez', 'Pedro Sánchez']
    const unidadesNegocio = ['Norte', 'Sur', 'Centro', 'Oriente', 'Occidente']
    const clase1 = ['Premium', 'Standard', 'Basic']
    const clase2 = ['A', 'B', 'C']
    
    for (let i = 0; i < rowCount; i++) {
      const ingresos = Math.random() * 100000 + 10000
      const costos = ingresos * (0.4 + Math.random() * 0.3)
      const ganancia = ingresos - costos
      const rentabilidad = (ganancia / ingresos) * 100
      
      data.push({
        id: i + 1,
        fecha: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
        vendedor: vendedores[Math.floor(Math.random() * vendedores.length)],
        unidad_negocio: unidadesNegocio[Math.floor(Math.random() * unidadesNegocio.length)],
        clase1: clase1[Math.floor(Math.random() * clase1.length)],
        clase2: clase2[Math.floor(Math.random() * clase2.length)],
        ingresos: Math.round(ingresos),
        costos: Math.round(costos),
        ganancia: Math.round(ganancia),
        rentabilidad: Math.round(rentabilidad * 100) / 100,
        unidades_vendidas: Math.floor(Math.random() * 100) + 1,
        precio_unitario: Math.round((ingresos / (Math.floor(Math.random() * 100) + 1)) * 100) / 100
      })
    }
    
    return data
  }

  // Analizar tipos de columnas
  const analyzeColumns = (data: ExcelData[]): ColumnAnalysis[] => {
    if (data.length === 0) return []
    
    const sample = data.slice(0, 100) // Analizar muestra para optimización
    const columnNames = Object.keys(sample[0])
    
    return columnNames.map(columnName => {
      const values = sample.map(row => row[columnName]).filter(v => v !== null && v !== undefined)
      const uniqueValues = new Set(values).size
      const nullCount = sample.length - values.length
      
      // Detectar tipo de columna
      let type: ColumnAnalysis['type'] = 'text'
      
      if (values.some(v => !isNaN(Date.parse(v)))) {
        type = 'date'
      } else if (values.every(v => !isNaN(Number(v)))) {
        if (columnName.toLowerCase().includes('precio') || columnName.toLowerCase().includes('ingreso') || columnName.toLowerCase().includes('costo')) {
          type = 'currency'
        } else if (columnName.toLowerCase().includes('rentabilidad') || columnName.toLowerCase().includes('porcentaje')) {
          type = 'percentage'
        } else {
          type = 'number'
        }
      }
      
      return {
        name: columnName,
        type,
        uniqueValues,
        nullCount,
        sample: values.slice(0, 5)
      }
    })
  }
// Generar sugerencias de gráficas
  const generateChartSuggestions = (columns: ColumnAnalysis[], data: ExcelData[]): ChartSuggestion[] => {
    const suggestions: ChartSuggestion[] = []
    
    const numberColumns = columns.filter(c => c.type === 'number' || c.type === 'currency' || c.type === 'percentage')
    const categoryColumns = columns.filter(c => c.type === 'text' && c.uniqueValues < 20)
    const dateColumns = columns.filter(c => c.type === 'date')
    
    // Sugerencia 1: Gráfico de barras para categorías vs números
    if (categoryColumns.length > 0 && numberColumns.length > 0) {
      suggestions.push({
        type: 'bar',
        title: `${numberColumns[0].name} por ${categoryColumns[0].name}`,
        description: `Comparación de ${numberColumns[0].name} agrupado por ${categoryColumns[0].name}`,
        confidence: 95,
        xAxis: categoryColumns[0].name,
        yAxis: numberColumns[0].name
      })
    }
    
    // Sugerencia 2: Gráfico de líneas para fechas
    if (dateColumns.length > 0 && numberColumns.length > 0) {
      suggestions.push({
        type: 'line',
        title: `Evolución de ${numberColumns[0].name} en el tiempo`,
        description: `Tendencia temporal de ${numberColumns[0].name}`,
        confidence: 90,
        xAxis: dateColumns[0].name,
        yAxis: numberColumns[0].name
      })
    }
    
    // Sugerencia 3: Gráfico circular para distribución
    if (categoryColumns.length > 0 && numberColumns.length > 0) {
      suggestions.push({
        type: 'pie',
        title: `Distribución de ${numberColumns[0].name} por ${categoryColumns[0].name}`,
        description: `Proporción de ${numberColumns[0].name} por categoría`,
        confidence: 85,
        category: categoryColumns[0].name
      })
    }
    
    // Sugerencia 4: Scatter plot para correlaciones
    if (numberColumns.length >= 2) {
      suggestions.push({
        type: 'scatter',
        title: `Correlación ${numberColumns[0].name} vs ${numberColumns[1].name}`,
        description: `Relación entre ${numberColumns[0].name} y ${numberColumns[1].name}`,
        confidence: 80,
        xAxis: numberColumns[0].name,
        yAxis: numberColumns[1].name
      })
    }
    
    return suggestions.sort((a, b) => b.confidence - a.confidence)
  }

  // Procesar datos para gráficas
  const processDataForChart = (suggestion: ChartSuggestion): any[] => {
    if (!rawData.length) return []
    
    switch (suggestion.type) {
      case 'bar':
      case 'pie':
        // Agrupar por categoría y sumar valores
        const grouped = rawData.reduce((acc, row) => {
          const key = row[suggestion.xAxis || suggestion.category || '']
          if (!acc[key]) acc[key] = 0
          acc[key] += Number(row[suggestion.yAxis || '']) || 0
          return acc
        }, {} as Record<string, number>)
        
        return Object.entries(grouped).map(([name, value]) => ({
          name,
          value: Math.round(value),
          [suggestion.yAxis || 'value']: Math.round(value)
        }))
        
      case 'line':
        // Agrupar por fecha y promediar
        const dateGrouped = rawData.reduce((acc, row) => {
          const key = row[suggestion.xAxis || '']
          if (!acc[key]) acc[key] = { sum: 0, count: 0 }
          acc[key].sum += Number(row[suggestion.yAxis || '']) || 0
          acc[key].count += 1
          return acc
        }, {} as Record<string, { sum: number, count: number }>)
        
        return Object.entries(dateGrouped)
          .map(([date, data]) => ({
            date,
            [suggestion.yAxis || 'value']: Math.round(data.sum / data.count)
          }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          
      case 'scatter':
        return rawData.slice(0, 500).map(row => ({ // Limitar para rendimiento
          x: Number(row[suggestion.xAxis || '']),
          y: Number(row[suggestion.yAxis || '']),
          name: row.vendedor || row.id
        }))
        
      default:
        return []
    }
  }

  // Renderizar gráfica según tipo
  const renderChart = (suggestion: ChartSuggestion, data: any[]) => {
    if (!data.length) return <div>No hay datos para mostrar</div>
    
    switch (suggestion.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: any) => [value.toLocaleString(), suggestion.yAxis]} />
              <Legend />
              <Bar dataKey={suggestion.yAxis || 'value'} fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        )
        
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey={suggestion.yAxis || 'value'} stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )
        
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )
        
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={data}>
              <CartesianGrid />
              <XAxis dataKey="x" type="number" name={suggestion.xAxis} />
              <YAxis dataKey="y" type="number" name={suggestion.yAxis} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter dataKey="y" fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        )
        
      default:
        return <div>Tipo de gráfica no soportado</div>
    }
  }
return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
    }}>
      {/* Navigation */}
      <nav style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link href="/dashboard" style={{
            color: 'white',
            textDecoration: 'none',
            fontSize: '1.5rem',
            fontWeight: 'bold'
          }}>
            🤖 AI RAG Agent
          </Link>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/dashboard" style={{ color: 'rgba(255, 255, 255, 0.8)', textDecoration: 'none' }}>Dashboard</Link>
            <Link href="/chat" style={{ color: 'rgba(255, 255, 255, 0.8)', textDecoration: 'none' }}>Chat</Link>
            <Link href="/analyzer" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>📊 Excel Analyzer</Link>
            <Link href="/documents" style={{ color: 'rgba(255, 255, 255, 0.8)', textDecoration: 'none' }}>Documents</Link>
            <Link href="/upload" style={{ color: 'rgba(255, 255, 255, 0.8)', textDecoration: 'none' }}>Upload</Link>
            <Link href="/analytics" style={{ color: 'rgba(255, 255, 255, 0.8)', textDecoration: 'none' }}>Analytics</Link>
          </div>
        </div>
        
        <div style={{ color: 'white', fontSize: '0.9rem' }}>
          {currentTime}
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ padding: '2rem' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(15px)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '2rem',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: 'white',
              margin: '0 0 1rem 0',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}>
              📊 Excel Analyzer
            </h1>
            <p style={{
              fontSize: '1.1rem',
              color: 'rgba(255, 255, 255, 0.8)',
              margin: 0
            }}>
              Sistema inteligente de análisis de datos Excel con detección automática y sugerencias de visualización
            </p>
          </div>

          {/* Mode Navigation */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            {['upload', 'analysis', 'charts'].map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as any)}
                disabled={mode === 'analysis' && !analysisComplete}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '10px',
                  background: viewMode === mode 
                    ? 'rgba(255, 255, 255, 0.3)' 
                    : 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  cursor: mode === 'analysis' && !analysisComplete ? 'not-allowed' : 'pointer',
                  opacity: mode === 'analysis' && !analysisComplete ? 0.5 : 1,
                  transition: 'all 0.3s ease'
                }}
              >
                {mode === 'upload' && '📁 Subir Archivo'}
                {mode === 'analysis' && '🔍 Análisis'}
                {mode === 'charts' && '📊 Gráficas'}
              </button>
            ))}
          </div>
{/* Content based on view mode */}
          {viewMode === 'upload' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                border: '2px dashed rgba(255, 255, 255, 0.3)',
                borderRadius: '15px',
                padding: '3rem',
                marginBottom: '2rem',
                background: 'rgba(255, 255, 255, 0.05)'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📊</div>
                <h3 style={{ color: 'white', marginBottom: '1rem' }}>
                  Sube tu archivo Excel para análisis inteligente
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '2rem' }}>
                  Soporta archivos desde 200 hasta 50,000 filas con detección automática de estructura
                </p>
                
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0]
                    if (selectedFile) {
                      handleFileUpload(selectedFile)
                    }
                  }}
                  style={{
                    display: 'none'
                  }}
                  id="file-upload"
                />
                
                <label
                  htmlFor="file-upload"
                  style={{
                    display: 'inline-block',
                    padding: '1rem 2rem',
                    background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                    color: 'white',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    border: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    transition: 'transform 0.2s ease',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                  }}
                  onMouseOver={(e) => {
                    (e.target as HTMLElement).style.transform = 'translateY(-2px)'
                  }}
                  onMouseOut={(e) => {
                    (e.target as HTMLElement).style.transform = 'translateY(0)'
                  }}
                >
                  📁 Seleccionar Archivo Excel
                </label>
              </div>
              
              {/* Features */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem',
                marginTop: '2rem'
              }}>
                {[
                  { icon: '🔍', title: 'Detección Automática', desc: 'Identifica tipos de datos y estructura' },
                  { icon: '📊', title: 'Sugerencias IA', desc: 'Propone gráficas basadas en los datos' },
                  { icon: '⚡', title: 'Optimizado', desc: 'Maneja archivos hasta 50K filas' },
                  { icon: '🎨', title: 'Interactivo', desc: 'Gráficas dinámicas y personalizables' }
                ].map((feature, index) => (
                  <div key={index} style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '15px',
                    padding: '1.5rem',
                    textAlign: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{feature.icon}</div>
                    <h4 style={{ color: 'white', margin: '0 0 0.5rem 0' }}>{feature.title}</h4>
                    <p style={{ color: 'rgba(255, 255, 255, 0.7)', margin: 0, fontSize: '0.9rem' }}>
                      {feature.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {viewMode === 'analysis' && (
            <div>
              {isAnalyzing ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <div style={{
                    fontSize: '3rem',
                    animation: 'pulse 2s infinite',
                    marginBottom: '1rem'
                  }}>🔍</div>
                  <h3 style={{ color: 'white', marginBottom: '1rem' }}>
                    Analizando archivo Excel...
                  </h3>
                  <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Detectando estructura, tipos de datos y generando sugerencias inteligentes
                  </p>
                </div>
              ) : analysisComplete ? (
                <div>
                  {/* File Info */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '15px',
                    padding: '1.5rem',
                    marginBottom: '2rem',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    <h3 style={{ color: 'white', margin: '0 0 1rem 0' }}>📄 Información del Archivo</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                      <div>
                        <strong style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Archivo:</strong>
                        <p style={{ color: 'white', margin: '0.25rem 0 0 0' }}>{file?.name}</p>
                      </div>
                      <div>
                        <strong style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Filas:</strong>
                        <p style={{ color: 'white', margin: '0.25rem 0 0 0' }}>{rawData.length.toLocaleString()}</p>
                      </div>
                      <div>
                        <strong style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Columnas:</strong>
                        <p style={{ color: 'white', margin: '0.25rem 0 0 0' }}>{columns.length}</p>
                      </div>
                      <div>
                        <strong style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Tamaño:</strong>
                        <p style={{ color: 'white', margin: '0.25rem 0 0 0' }}>{((file?.size || 0) / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                  </div>

                  {/* Column Analysis */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '15px',
                    padding: '1.5rem',
                    marginBottom: '2rem',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    <h3 style={{ color: 'white', margin: '0 0 1rem 0' }}>🔍 Análisis de Columnas</h3>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            <th style={{ padding: '0.75rem', textAlign: 'left', color: 'rgba(255, 255, 255, 0.9)', borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>Columna</th>
                            <th style={{ padding: '0.75rem', textAlign: 'left', color: 'rgba(255, 255, 255, 0.9)', borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>Tipo</th>
                            <th style={{ padding: '0.75rem', textAlign: 'left', color: 'rgba(255, 255, 255, 0.9)', borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>Valores Únicos</th>
                            <th style={{ padding: '0.75rem', textAlign: 'left', color: 'rgba(255, 255, 255, 0.9)', borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>Muestra</th>
                          </tr>
                        </thead>
                        <tbody>
                          {columns.map((column, index) => (
                            <tr key={index}>
                              <td style={{ padding: '0.75rem', color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                {column.name}
                              </td>
                              <td style={{ padding: '0.75rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                <span style={{
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '15px',
                                  background: column.type === 'number' ? '#4CAF50' : 
                                            column.type === 'currency' ? '#FF9800' :
                                            column.type === 'date' ? '#2196F3' :
                                            column.type === 'percentage' ? '#9C27B0' : '#607D8B',
                                  color: 'white',
                                  fontSize: '0.8rem'
                                }}>
                                  {column.type}
                                </span>
                              </td>
                              <td style={{ padding: '0.75rem', color: 'rgba(255, 255, 255, 0.8)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                {column.uniqueValues}
                              </td>
                              <td style={{ padding: '0.75rem', color: 'rgba(255, 255, 255, 0.8)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                {column.sample.slice(0, 3).join(', ')}...
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
{/* Chart Suggestions */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '15px',
                    padding: '1.5rem',
                    marginBottom: '2rem',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    <h3 style={{ color: 'white', margin: '0 0 1rem 0' }}>🤖 Sugerencias de Gráficas (IA)</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                      {suggestions.map((suggestion, index) => (
                        <div key={index} style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '10px',
                          padding: '1rem',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          transform: selectedCharts.includes(suggestion) ? 'scale(1.02)' : 'scale(1)',
                          boxShadow: selectedCharts.includes(suggestion) ? '0 4px 20px rgba(255, 255, 255, 0.2)' : 'none'
                        }}
                        onClick={() => {
                          if (selectedCharts.includes(suggestion)) {
                            setSelectedCharts(selectedCharts.filter(s => s !== suggestion))
                          } else {
                            setSelectedCharts([...selectedCharts, suggestion])
                          }
                        }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <h4 style={{ color: 'white', margin: 0, fontSize: '1rem' }}>
                              {suggestion.type === 'bar' ? '📊' : 
                               suggestion.type === 'line' ? '📈' :
                               suggestion.type === 'pie' ? '🥧' :
                               suggestion.type === 'scatter' ? '🎯' : '📉'} {suggestion.title}
                            </h4>
                            <span style={{
                              background: `linear-gradient(135deg, hsl(${suggestion.confidence * 1.2}, 70%, 50%), hsl(${suggestion.confidence * 1.2}, 70%, 40%))`,
                              color: 'white',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '15px',
                              fontSize: '0.75rem',
                              fontWeight: 'bold'
                            }}>
                              {suggestion.confidence}%
                            </span>
                          </div>
                          <p style={{ color: 'rgba(255, 255, 255, 0.7)', margin: 0, fontSize: '0.9rem' }}>
                            {suggestion.description}
                          </p>
                          {selectedCharts.includes(suggestion) && (
                            <div style={{
                              marginTop: '0.5rem',
                              padding: '0.5rem',
                              background: 'rgba(76, 175, 80, 0.2)',
                              borderRadius: '5px',
                              border: '1px solid rgba(76, 175, 80, 0.3)'
                            }}>
                              <span style={{ color: '#4CAF50', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                ✓ Seleccionado para generar
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {selectedCharts.length > 0 && (
                      <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                        <button
                          onClick={() => {
                            const processed = selectedCharts.map(chart => ({
                              ...chart,
                              data: processDataForChart(chart)
                            }))
                            setProcessedData(processed)
                            setViewMode('charts')
                          }}
                          style={{
                            padding: '1rem 2rem',
                            background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'transform 0.2s ease',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                          }}
                          onMouseOver={(e) => {
                            const target = e.target as HTMLButtonElement
                            target.style.transform = 'translateY(-2px)'
                          }}
                          onMouseOut={(e) => {
                            const target = e.target as HTMLButtonElement
                            target.style.transform = 'translateY(0)'
                          }}
                        >
                          📊 Generar {selectedCharts.length} Gráfica{selectedCharts.length > 1 ? 's' : ''}
                        </button>
                      </div>
                    )}
                  </div>
{/* Data Preview */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '15px',
                    padding: '1.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    <h3 style={{ color: 'white', margin: '0 0 1rem 0' }}>👁️ Vista Previa de Datos (Primeras 10 filas)</h3>
                    <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '400px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                          <tr>
                            {columns.map((column, index) => (
                              <th key={index} style={{
                                padding: '0.75rem',
                                textAlign: 'left',
                                color: 'rgba(255, 255, 255, 0.9)',
                                borderBottom: '2px solid rgba(255, 255, 255, 0.2)',
                                position: 'sticky',
                                top: 0,
                                background: 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(10px)'
                              }}>
                                {column.name}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {dataPreview.map((row, index) => (
                            <tr key={index}>
                              {columns.map((column, colIndex) => (
                                <td key={colIndex} style={{
                                  padding: '0.5rem 0.75rem',
                                  color: 'rgba(255, 255, 255, 0.8)',
                                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                  whiteSpace: 'nowrap'
                                }}>
                                  {column.type === 'currency' 
                                    ? `$${Number(row[column.name]).toLocaleString()}`
                                    : column.type === 'percentage'
                                    ? `${row[column.name]}%`
                                    : String(row[column.name])
                                  }
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>📊</div>
                  <h3 style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Sube un archivo Excel para comenzar el análisis
                  </h3>
                </div>
              )}
            </div>
          )}
{viewMode === 'charts' && (
            <div>
              {processedData.length > 0 ? (
                <div>
                  <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ color: 'white', margin: '0 0 1rem 0' }}>
                      📊 Gráficas Generadas ({processedData.length})
                    </h2>
                    <p style={{ color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>
                      Visualizaciones interactivas basadas en tus datos
                    </p>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
                    gap: '2rem'
                  }}>
                    {processedData.map((chart, index) => (
                      <div key={index} style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '15px',
                        padding: '1.5rem',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '1rem'
                        }}>
                          <h3 style={{ color: 'white', margin: 0, fontSize: '1.2rem' }}>
                            {chart.type === 'bar' ? '📊' : 
                             chart.type === 'line' ? '📈' :
                             chart.type === 'pie' ? '🥧' :
                             chart.type === 'scatter' ? '🎯' : '📉'} {chart.title}
                          </h3>
                          <span style={{
                            background: `linear-gradient(135deg, hsl(${chart.confidence * 1.2}, 70%, 50%), hsl(${chart.confidence * 1.2}, 70%, 40%))`,
                            color: 'white',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '15px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold'
                          }}>
                            Confianza: {chart.confidence}%
                          </span>
                        </div>
                        
                        <p style={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          margin: '0 0 1.5rem 0',
                          fontSize: '0.9rem'
                        }}>
                          {chart.description}
                        </p>

                        <div style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '10px',
                          padding: '1rem'
                        }}>
                          {renderChart(chart, chart.data)}
                        </div>

                        <div style={{
                          marginTop: '1rem',
                          fontSize: '0.8rem',
                          color: 'rgba(255, 255, 255, 0.6)'
                        }}>
                          📊 {chart.data?.length || 0} puntos de datos
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div style={{
                    textAlign: 'center',
                    marginTop: '2rem',
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'center'
                  }}>
                    <button
                      onClick={() => setViewMode('analysis')}
                      style={{
                        padding: '1rem 2rem',
                        background: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '10px',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={(e) => {
                        const target = e.target as HTMLButtonElement
                        target.style.background = 'rgba(255, 255, 255, 0.3)'
                      }}
                      onMouseOut={(e) => {
                        const target = e.target as HTMLButtonElement
                        target.style.background = 'rgba(255, 255, 255, 0.2)'
                      }}
                    >
                      🔍 Volver al Análisis
                    </button>
                    
                    <button
                      onClick={() => {
                        setViewMode('upload')
                        setFile(null)
                        setRawData([])
                        setColumns([])
                        setSuggestions([])
                        setSelectedCharts([])
                        setProcessedData([])
                        setAnalysisComplete(false)
                      }}
                      style={{
                        padding: '1rem 2rem',
                        background: 'linear-gradient(135deg, #FF5722, #E64A19)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        const target = e.target as HTMLButtonElement
                        target.style.transform = 'translateY(-2px)'
                      }}
                      onMouseOut={(e) => {
                        const target = e.target as HTMLButtonElement
                        target.style.transform = 'translateY(0)'
                      }}
                    >
                      📁 Nuevo Análisis
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>📊</div>
                  <h3 style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Selecciona gráficas en la sección de análisis para visualizar
                  </h3>
                  <button
                    onClick={() => setViewMode('analysis')}
                    style={{
                      marginTop: '1rem',
                      padding: '1rem 2rem',
                      background: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '10px',
                      cursor: 'pointer'
                    }}
                  >
                    🔍 Ir al Análisis
                  </button>
                </div>
              )}
            </div>
          )}
          </div>
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}