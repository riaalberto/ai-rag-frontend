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
  confidence: number // Agregado para mostrar confianza de detección
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
      
      // Analizar columnas con lógica corregida
      const columnAnalysis = analyzeColumns(mockData)
      setColumns(columnAnalysis)
      console.log('🔍 Análisis de columnas:', columnAnalysis)
      
      // Generar sugerencias automáticas
      const chartSuggestions = generateChartSuggestions(columnAnalysis, mockData)
      setSuggestions(chartSuggestions)
      console.log('🤖 Sugerencias generadas:', chartSuggestions)
      
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

  // 🔧 FUNCIÓN CORREGIDA: Analizar tipos de columnas
  const analyzeColumns = (data: ExcelData[]): ColumnAnalysis[] => {
    if (data.length === 0) return []
    
    const sample = data.slice(0, 100) // Analizar muestra para optimización
    const columnNames = Object.keys(sample[0])
    
    return columnNames.map(columnName => {
      const values = sample.map(row => row[columnName]).filter(v => v !== null && v !== undefined && v !== '')
      const uniqueValues = new Set(values).size
      const nullCount = sample.length - values.length
      
      // 🎯 DETECCIÓN MEJORADA DE TIPOS
      let type: ColumnAnalysis['type'] = 'text'
      let confidence = 0
      let numericCount = 0
      let dateCount = 0
      let currencyCount = 0
      let percentageCount = 0
      
      values.forEach(value => {
        const strValue = String(value).trim()
        
        // Detectar moneda (símbolos $, €, ¥, etc.)
        if (/^[\$€¥£]?[\d,]+\.?\d*$/.test(strValue) || /^[\d,]+\.?\d*[\$€¥£]$/.test(strValue)) {
          currencyCount++
        }
        // Detectar porcentaje
        else if (/^\d+\.?\d*%$/.test(strValue)) {
          percentageCount++
        }
        // Detectar fecha (formato específico y realista)
        else if (strValue.includes('/') || strValue.includes('-')) {
          const possibleDate = new Date(strValue)
          if (!isNaN(possibleDate.getTime()) && strValue.length > 6 && strValue.length < 12) {
            dateCount++
          }
        }
        // Detectar número puro (sin símbolos de moneda o porcentaje)
        else if (!isNaN(parseFloat(strValue)) && isFinite(parseFloat(strValue))) {
          numericCount++
        }
      })
      
      const totalValues = values.length
      
      // Determinar tipo basado en mayoría (>60%)
      if (currencyCount / totalValues > 0.6) {
        type = 'currency'
        confidence = currencyCount / totalValues
      } else if (percentageCount / totalValues > 0.6) {
        type = 'percentage'
        confidence = percentageCount / totalValues
      } else if (numericCount / totalValues > 0.6) {
        type = 'number'
        confidence = numericCount / totalValues
      } else if (dateCount / totalValues > 0.6) {
        type = 'date'
        confidence = dateCount / totalValues
      } else {
        type = 'text'
        confidence = 1 - Math.max(numericCount, dateCount, currencyCount, percentageCount) / totalValues
      }
      
      // Detectar por nombre de columna como fallback
      if (confidence < 0.8) {
        const columnLower = columnName.toLowerCase()
        if (columnLower.includes('precio') || columnLower.includes('ingreso') || columnLower.includes('costo') || columnLower.includes('ganancia')) {
          type = 'currency'
          confidence = Math.max(confidence, 0.7)
        } else if (columnLower.includes('rentabilidad') || columnLower.includes('porcentaje')) {
          type = 'percentage'
          confidence = Math.max(confidence, 0.7)
        } else if (columnLower.includes('fecha') || columnLower.includes('date')) {
          type = 'date'
          confidence = Math.max(confidence, 0.7)
        } else if (columnLower.includes('cantidad') || columnLower.includes('numero') || columnLower.includes('unidades')) {
          type = 'number'
          confidence = Math.max(confidence, 0.7)
        }
      }
      
      return {
        name: columnName,
        type,
        uniqueValues,
        nullCount,
        sample: values.slice(0, 5),
        confidence: Math.round(confidence * 100) / 100
      }
    })
  }
// 🔧 FUNCIÓN MEJORADA: Generar sugerencias de gráficas
  const generateChartSuggestions = (columns: ColumnAnalysis[], data: ExcelData[]): ChartSuggestion[] => {
    const suggestions: ChartSuggestion[] = []
    
    const numberColumns = columns.filter(c => c.type === 'number' || c.type === 'currency' || c.type === 'percentage')
    const categoryColumns = columns.filter(c => c.type === 'text' && c.uniqueValues < c.sample.length * 0.7 && c.uniqueValues > 1)
    const dateColumns = columns.filter(c => c.type === 'date')
    
    console.log('🔍 Columnas detectadas para gráficas:', {
      numbers: numberColumns.map(c => `${c.name} (${c.type}, conf: ${c.confidence})`),
      categories: categoryColumns.map(c => `${c.name} (${c.uniqueValues} valores únicos)`),
      dates: dateColumns.map(c => `${c.name} (${c.type}, conf: ${c.confidence})`)
    })
    
    // Sugerencia 1: Gráfico de barras (categoría vs número)
    if (categoryColumns.length > 0 && numberColumns.length > 0) {
      const bestCategory = categoryColumns[0]
      const bestNumber = numberColumns[0]
      
      suggestions.push({
        type: 'bar',
        title: `${bestNumber.name} por ${bestCategory.name}`,
        description: `Comparación de ${bestNumber.name} agrupado por ${bestCategory.name}. Ideal para analizar diferencias entre categorías.`,
        confidence: Math.min(95, Math.round((bestCategory.confidence + bestNumber.confidence) * 50)),
        xAxis: bestCategory.name,
        yAxis: bestNumber.name
      })
    }
    
    // Sugerencia 2: Gráfico de líneas (fecha vs número)
    if (dateColumns.length > 0 && numberColumns.length > 0) {
      const bestDate = dateColumns[0]
      const bestNumber = numberColumns[0]
      
      suggestions.push({
        type: 'line',
        title: `Evolución de ${bestNumber.name} en el tiempo`,
        description: `Tendencia temporal de ${bestNumber.name} a lo largo de ${bestDate.name}. Perfecto para identificar patrones temporales.`,
        confidence: Math.min(90, Math.round((bestDate.confidence + bestNumber.confidence) * 45)),
        xAxis: bestDate.name,
        yAxis: bestNumber.name
      })
    }
    
    // Sugerencia 3: Gráfico circular (si hay pocas categorías)
    if (categoryColumns.length > 0 && numberColumns.length > 0) {
      const bestCategory = categoryColumns.find(c => c.uniqueValues <= 8) || categoryColumns[0]
      const bestNumber = numberColumns[0]
      
      if (bestCategory.uniqueValues <= 10) {
        suggestions.push({
          type: 'pie',
          title: `Distribución de ${bestNumber.name} por ${bestCategory.name}`,
          description: `Proporción de ${bestNumber.name} por cada ${bestCategory.name}. Excelente para mostrar participación relativa.`,
          confidence: Math.min(85, Math.round((bestCategory.confidence + bestNumber.confidence) * 42)),
          category: bestCategory.name,
          yAxis: bestNumber.name
        })
      }
    }
    
    // Sugerencia 4: Scatter plot (número vs número)
    if (numberColumns.length >= 2) {
      const firstNumber = numberColumns[0]
      const secondNumber = numberColumns[1]
      
      suggestions.push({
        type: 'scatter',
        title: `Correlación: ${firstNumber.name} vs ${secondNumber.name}`,
        description: `Relación entre ${firstNumber.name} y ${secondNumber.name}. Útil para identificar correlaciones y patrones.`,
        confidence: Math.min(80, Math.round((firstNumber.confidence + secondNumber.confidence) * 40)),
        xAxis: firstNumber.name,
        yAxis: secondNumber.name
      })
    }
    
    // Sugerencia 5: Área chart para múltiples números en el tiempo
    if (dateColumns.length > 0 && numberColumns.length >= 2) {
      const bestDate = dateColumns[0]
      const bestNumber = numberColumns[0]
      
      suggestions.push({
        type: 'area',
        title: `Área de ${bestNumber.name} en el tiempo`,
        description: `Evolución acumulativa de ${bestNumber.name} por ${bestDate.name}. Ideal para mostrar volúmenes temporales.`,
        confidence: Math.min(75, Math.round((bestDate.confidence + bestNumber.confidence) * 37)),
        xAxis: bestDate.name,
        yAxis: bestNumber.name
      })
    }
    
    return suggestions.sort((a, b) => b.confidence - a.confidence)
  }

  // Procesar datos para gráficas
  const processDataForChart = (suggestion: ChartSuggestion): any[] => {
    if (!rawData.length) return []
    
    console.log('📊 Procesando datos para gráfica:', suggestion.type, suggestion.title)
    
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
        
        const result = Object.entries(grouped)
          .map(([name, value]) => ({
            name,
            value: Math.round(value),
            [suggestion.yAxis || 'value']: Math.round(value)
          }))
          .sort((a, b) => b.value - a.value) // Ordenar por valor descendente
          .slice(0, 15) // Limitar a 15 categorías máximo
        
        console.log('📊 Datos agrupados:', result.length, 'categorías')
        return result
        
      case 'line':
      case 'area':
        // Agrupar por fecha y promediar
        const dateGrouped = rawData.reduce((acc, row) => {
          const key = row[suggestion.xAxis || '']
          if (!acc[key]) acc[key] = { sum: 0, count: 0 }
          acc[key].sum += Number(row[suggestion.yAxis || '']) || 0
          acc[key].count += 1
          return acc
        }, {} as Record<string, { sum: number, count: number }>)
        
        const dateResult = Object.entries(dateGrouped)
          .map(([date, data]) => ({
            date,
            [suggestion.yAxis || 'value']: Math.round(data.sum / data.count),
            total: Math.round(data.sum),
            average: Math.round(data.sum / data.count)
          }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        
        console.log('📊 Datos temporales:', dateResult.length, 'fechas')
        return dateResult
          
      case 'scatter':
        const scatterResult = rawData
          .slice(0, 500) // Limitar para rendimiento
          .map(row => ({
            x: Number(row[suggestion.xAxis || '']),
            y: Number(row[suggestion.yAxis || '']),
            name: row.vendedor || row.id || 'Punto'
          }))
          .filter(point => !isNaN(point.x) && !isNaN(point.y)) // Filtrar valores inválidos
        
        console.log('📊 Datos scatter:', scatterResult.length, 'puntos')
        return scatterResult
        
      default:
        return []
    }
  }

  // Renderizar gráfica según tipo
  const renderChart = (suggestion: ChartSuggestion, data: any[]) => {
    if (!data.length) {
      return (
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center', 
          color: 'rgba(255, 255, 255, 0.6)' 
        }}>
          No hay datos suficientes para esta visualización
        </div>
      )
    }
    
    switch (suggestion.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
              <XAxis 
                dataKey="name" 
                stroke="rgba(255,255,255,0.8)"
                fontSize={12}
                angle={data.length > 8 ? -45 : 0}
                textAnchor={data.length > 8 ? 'end' : 'middle'}
                height={data.length > 8 ? 80 : 60}
              />
              <YAxis stroke="rgba(255,255,255,0.8)" fontSize={12} />
              <Tooltip 
                formatter={(value: any) => [value.toLocaleString(), suggestion.yAxis]}
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '8px',
                  color: 'white'
                }}
              />
              <Legend />
              <Bar dataKey={suggestion.yAxis || 'value'} fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        )
        
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
              <XAxis 
                dataKey="date" 
                stroke="rgba(255,255,255,0.8)"
                fontSize={12}
              />
              <YAxis stroke="rgba(255,255,255,0.8)" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '8px',
                  color: 'white'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey={suggestion.yAxis || 'value'} 
                stroke="#8884d8" 
                strokeWidth={3}
                dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#8884d8', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )
        
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
              <XAxis 
                dataKey="date" 
                stroke="rgba(255,255,255,0.8)"
                fontSize={12}
              />
              <YAxis stroke="rgba(255,255,255,0.8)" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '8px',
                  color: 'white'
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey={suggestion.yAxis || 'value'} 
                stroke="#8884d8" 
                fill="#8884d8"
                fillOpacity={0.6}
              />
            </AreaChart>
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
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any) => [value.toLocaleString(), 'Valor']}
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '8px',
                  color: 'white'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )
        
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.2)" />
              <XAxis 
                dataKey="x" 
                type="number" 
                name={suggestion.xAxis}
                stroke="rgba(255,255,255,0.8)"
                fontSize={12}
              />
              <YAxis 
                dataKey="y" 
                type="number" 
                name={suggestion.yAxis}
                stroke="rgba(255,255,255,0.8)"
                fontSize={12}
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                formatter={(value: any, name: string) => [value, name]}
                labelFormatter={(label) => `Punto: ${label}`}
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '8px',
                  color: 'white'
                }}
              />
              <Scatter dataKey="y" fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        )
        
      default:
        return (
          <div style={{ 
            padding: '2rem', 
            textAlign: 'center', 
            color: 'rgba(255, 255, 255, 0.6)' 
          }}>
            Tipo de gráfica no soportado: {suggestion.type}
          </div>
        )
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
                background: 'rgba(255, 255, 255, 0.05)',
                transition: 'all 0.3s ease'
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
                  { 
                    icon: '🔍', 
                    title: 'Detección Automática', 
                    desc: 'Identifica tipos de datos: números, fechas, monedas, porcentajes y texto',
                    color: '#2196F3'
                  },
                  { 
                    icon: '🤖', 
                    title: 'Sugerencias IA', 
                    desc: 'Propone gráficas inteligentes basadas en la estructura de tus datos',
                    color: '#9C27B0'
                  },
                  { 
                    icon: '⚡', 
                    title: 'Optimizado', 
                    desc: 'Maneja archivos grandes hasta 50K filas con procesamiento eficiente',
                    color: '#FF9800'
                  },
                  { 
                    icon: '📊', 
                    title: 'Visualizaciones', 
                    desc: 'Gráficas interactivas: barras, líneas, circular, scatter y área',
                    color: '#4CAF50'
                  }
                ].map((feature, index) => (
                  <div key={index} style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '15px',
                    padding: '1.5rem',
                    textAlign: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    transition: 'transform 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => {
                    (e.target as HTMLElement).style.transform = 'translateY(-5px)'
                    ;(e.target as HTMLElement).style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)'
                  }}
                  onMouseOut={(e) => {
                    (e.target as HTMLElement).style.transform = 'translateY(0)'
                    ;(e.target as HTMLElement).style.boxShadow = 'none'
                  }}
                  >
                    <div style={{ 
                      fontSize: '2.5rem', 
                      marginBottom: '1rem',
                      filter: `drop-shadow(0 0 10px ${feature.color})`
                    }}>
                      {feature.icon}
                    </div>
                    <h4 style={{ 
                      color: 'white', 
                      margin: '0 0 0.5rem 0',
                      fontSize: '1.1rem',
                      fontWeight: 'bold'
                    }}>
                      {feature.title}
                    </h4>
                    <p style={{ 
                      color: 'rgba(255, 255, 255, 0.7)', 
                      margin: 0, 
                      fontSize: '0.9rem',
                      lineHeight: '1.4'
                    }}>
                      {feature.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Supported Formats */}
              <div style={{
                marginTop: '2rem',
                padding: '1.5rem',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <h4 style={{ 
                  color: 'white', 
                  margin: '0 0 1rem 0',
                  textAlign: 'center'
                }}>
                  📁 Formatos Soportados
                </h4>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  gap: '2rem',
                  flexWrap: 'wrap'
                }}>
                  {[
                    { format: '.XLSX', desc: 'Excel 2007+', icon: '📗' },
                    { format: '.XLS', desc: 'Excel Clásico', icon: '📘' },
                    { format: '.CSV', desc: 'Valores Separados', icon: '📄' }
                  ].map((format, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: 'rgba(255, 255, 255, 0.8)'
                    }}>
                      <span style={{ fontSize: '1.5rem' }}>{format.icon}</span>
                      <div>
                        <strong>{format.format}</strong>
                        <br />
                        <small style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                          {format.desc}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Tips */}
              <div style={{
                marginTop: '2rem',
                padding: '1.5rem',
                background: 'rgba(76, 175, 80, 0.1)',
                borderRadius: '10px',
                border: '1px solid rgba(76, 175, 80, 0.3)'
              }}>
                <h4 style={{ 
                  color: '#4CAF50', 
                  margin: '0 0 1rem 0',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}>
                  💡 Consejos para Mejores Resultados
                </h4>
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  fontSize: '0.9rem'
                }}>
                  {[
                    '✅ Usa headers descriptivos en la primera fila',
                    '✅ Evita celdas combinadas',
                    '✅ Mantén formatos consistentes por columna',
                    '✅ Incluye al menos 10 filas de datos'
                  ].map((tip, index) => (
                    <div key={index} style={{ 
                      color: 'rgba(255, 255, 255, 0.8)',
                      padding: '0.5rem'
                    }}>
                      {tip}
                    </div>
                  ))}
                </div>
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
                  <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '2rem' }}>
                    Detectando estructura, tipos de datos y generando sugerencias inteligentes
                  </p>
                  
                  {/* Loading Animation */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    marginBottom: '2rem'
                  }}>
                    {[1, 2, 3, 4, 5].map((dot) => (
                      <div
                        key={dot}
                        style={{
                          width: '12px',
                          height: '12px',
                          backgroundColor: 'rgba(255, 255, 255, 0.6)',
                          borderRadius: '50%',
                          animation: `pulse 1.5s ease-in-out ${dot * 0.2}s infinite`
                        }}
                      />
                    ))}
                  </div>
                  
                  {/* Progress Steps */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '2rem',
                    flexWrap: 'wrap'
                  }}>
                    {[
                      { icon: '📄', text: 'Leyendo archivo' },
                      { icon: '🔍', text: 'Analizando columnas' },
                      { icon: '🤖', text: 'Generando sugerencias' },
                      { icon: '📊', text: 'Preparando visualización' }
                    ].map((step, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.9rem'
                      }}>
                        <span style={{ fontSize: '1.2rem' }}>{step.icon}</span>
                        {step.text}
                      </div>
                    ))}
                  </div>
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
                    <h3 style={{ 
                      color: 'white', 
                      margin: '0 0 1rem 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      📄 Información del Archivo
                      <span style={{
                        background: 'rgba(76, 175, 80, 0.2)',
                        color: '#4CAF50',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '15px',
                        fontSize: '0.8rem',
                        fontWeight: 'normal'
                      }}>
                        ✓ Análisis Completo
                      </span>
                    </h3>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                      gap: '1rem' 
                    }}>
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        padding: '1rem',
                        borderRadius: '10px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '1.2rem' }}>📁</span>
                          <strong style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Archivo:</strong>
                        </div>
                        <p style={{ color: 'white', margin: 0, wordBreak: 'break-word' }}>{file?.name}</p>
                      </div>
                      
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        padding: '1rem',
                        borderRadius: '10px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '1.2rem' }}>📊</span>
                          <strong style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Filas:</strong>
                        </div>
                        <p style={{ color: 'white', margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>
                          {rawData.length.toLocaleString()}
                        </p>
                      </div>
                      
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        padding: '1rem',
                        borderRadius: '10px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '1.2rem' }}>🗂️</span>
                          <strong style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Columnas:</strong>
                        </div>
                        <p style={{ color: 'white', margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>
                          {columns.length}
                        </p>
                      </div>
                      
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        padding: '1rem',
                        borderRadius: '10px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '1.2rem' }}>💾</span>
                          <strong style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Tamaño:</strong>
                        </div>
                        <p style={{ color: 'white', margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>
                          {((file?.size || 0) / 1024 / 1024).toFixed(2)} MB
                        </p>
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
                    <h3 style={{ 
                      color: 'white', 
                      margin: '0 0 1rem 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      🔍 Análisis de Columnas
                      <span style={{
                        background: 'rgba(33, 150, 243, 0.2)',
                        color: '#2196F3',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '15px',
                        fontSize: '0.8rem',
                        fontWeight: 'normal'
                      }}>
                        {columns.length} detectadas
                      </span>
                    </h3>
                    
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            <th style={{ 
                              padding: '1rem 0.75rem', 
                              textAlign: 'left', 
                              color: 'rgba(255, 255, 255, 0.9)', 
                              borderBottom: '2px solid rgba(255, 255, 255, 0.2)',
                              background: 'rgba(255, 255, 255, 0.05)',
                              fontSize: '0.9rem',
                              fontWeight: 'bold'
                            }}>
                              Columna
                            </th>
                            <th style={{ 
                              padding: '1rem 0.75rem', 
                              textAlign: 'left', 
                              color: 'rgba(255, 255, 255, 0.9)', 
                              borderBottom: '2px solid rgba(255, 255, 255, 0.2)',
                              background: 'rgba(255, 255, 255, 0.05)',
                              fontSize: '0.9rem',
                              fontWeight: 'bold'
                            }}>
                              Tipo Detectado
                            </th>
                            <th style={{ 
                              padding: '1rem 0.75rem', 
                              textAlign: 'left', 
                              color: 'rgba(255, 255, 255, 0.9)', 
                              borderBottom: '2px solid rgba(255, 255, 255, 0.2)',
                              background: 'rgba(255, 255, 255, 0.05)',
                              fontSize: '0.9rem',
                              fontWeight: 'bold'
                            }}>
                              Confianza
                            </th>
                            <th style={{ 
                              padding: '1rem 0.75rem', 
                              textAlign: 'left', 
                              color: 'rgba(255, 255, 255, 0.9)', 
                              borderBottom: '2px solid rgba(255, 255, 255, 0.2)',
                              background: 'rgba(255, 255, 255, 0.05)',
                              fontSize: '0.9rem',
                              fontWeight: 'bold'
                            }}>
                              Valores Únicos
                            </th>
                            <th style={{ 
                              padding: '1rem 0.75rem', 
                              textAlign: 'left', 
                              color: 'rgba(255, 255, 255, 0.9)', 
                              borderBottom: '2px solid rgba(255, 255, 255, 0.2)',
                              background: 'rgba(255, 255, 255, 0.05)',
                              fontSize: '0.9rem',
                              fontWeight: 'bold'
                            }}>
                              Muestra de Datos
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {columns.map((column, index) => (
                            <tr key={index} style={{
                              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                              transition: 'background 0.2s ease'
                            }}
                            onMouseOver={(e) => {
                              const target = e.currentTarget as HTMLElement
                              target.style.background = 'rgba(255, 255, 255, 0.05)'
                            }}
                            onMouseOut={(e) => {
                              const target = e.currentTarget as HTMLElement
                              target.style.background = 'transparent'
                            }}
                            >
                              <td style={{ padding: '0.75rem', color: 'white', fontWeight: '500' }}>
                                {column.name}
                              </td>
                              <td style={{ padding: '0.75rem' }}>
                                <span style={{
                                  padding: '0.4rem 0.8rem',
                                  borderRadius: '20px',
                                  background: column.type === 'number' ? '#4CAF50' : 
                                            column.type === 'currency' ? '#FF9800' :
                                            column.type === 'date' ? '#2196F3' :
                                            column.type === 'percentage' ? '#9C27B0' : '#607D8B',
                                  color: 'white',
                                  fontSize: '0.8rem',
                                  fontWeight: 'bold',
                                  textTransform: 'capitalize'
                                }}>
                                  {column.type === 'currency' ? '💰 Moneda' :
                                   column.type === 'number' ? '🔢 Número' :
                                   column.type === 'date' ? '📅 Fecha' :
                                   column.type === 'percentage' ? '📊 Porcentaje' : '📝 Texto'}
                                </span>
                              </td>
                              <td style={{ padding: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <div style={{
                                    width: '60px',
                                    height: '6px',
                                    background: 'rgba(255, 255, 255, 0.2)',
                                    borderRadius: '3px',
                                    overflow: 'hidden'
                                  }}>
                                    <div style={{
                                      width: `${(column.confidence || 0) * 100}%`,
                                      height: '100%',
                                      background: `linear-gradient(90deg, ${
                                        (column.confidence || 0) >= 0.8 ? '#4CAF50' :
                                        (column.confidence || 0) >= 0.6 ? '#FF9800' : '#F44336'
                                      }, ${
                                        (column.confidence || 0) >= 0.8 ? '#2E7D32' :
                                        (column.confidence || 0) >= 0.6 ? '#E65100' : '#C62828'
                                      })`,
                                      borderRadius: '3px'
                                    }} />
                                  </div>
                                  <span style={{ 
                                    color: 'rgba(255, 255, 255, 0.8)',
                                    fontSize: '0.8rem',
                                    fontWeight: 'bold'
                                  }}>
                                    {Math.round((column.confidence || 0) * 100)}%
                                  </span>
                                </div>
                              </td>
                              <td style={{ padding: '0.75rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                                <span style={{
                                  background: 'rgba(255, 255, 255, 0.1)',
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '15px',
                                  fontSize: '0.8rem'
                                }}>
                                  {column.uniqueValues.toLocaleString()}
                                </span>
                              </td>
                              <td style={{ 
                                padding: '0.75rem', 
                                color: 'rgba(255, 255, 255, 0.7)',
                                fontSize: '0.8rem',
                                maxWidth: '200px'
                              }}>
                                <div style={{
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}>
                                  {column.sample.slice(0, 3).join(', ')}
                                  {column.sample.length > 3 && '...'}
                                </div>
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
                    <h3 style={{ 
                      color: 'white', 
                      margin: '0 0 1rem 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      🤖 Sugerencias de Gráficas (IA)
                      <span style={{
                        background: 'rgba(156, 39, 176, 0.2)',
                        color: '#9C27B0',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '15px',
                        fontSize: '0.8rem',
                        fontWeight: 'normal'
                      }}>
                        {suggestions.length} sugerencias
                      </span>
                    </h3>

                    {suggestions.length > 0 ? (
                      <>
                        <p style={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          margin: '0 0 1.5rem 0',
                          fontSize: '0.9rem'
                        }}>
                          🎯 Haz clic en las gráficas que quieres generar. La IA ha analizado tu estructura de datos y sugiere estas visualizaciones:
                        </p>

                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                          gap: '1rem',
                          marginBottom: '1.5rem'
                        }}>
                          {suggestions.map((suggestion, index) => (
                            <div key={index} style={{
                              background: selectedCharts.includes(suggestion) 
                                ? 'rgba(76, 175, 80, 0.15)' 
                                : 'rgba(255, 255, 255, 0.05)',
                              borderRadius: '12px',
                              padding: '1.2rem',
                              border: selectedCharts.includes(suggestion)
                                ? '2px solid rgba(76, 175, 80, 0.5)'
                                : '1px solid rgba(255, 255, 255, 0.1)',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              transform: selectedCharts.includes(suggestion) ? 'scale(1.02)' : 'scale(1)',
                              boxShadow: selectedCharts.includes(suggestion) 
                                ? '0 8px 25px rgba(76, 175, 80, 0.3)' 
                                : '0 2px 10px rgba(0, 0, 0, 0.1)',
                              position: 'relative' as const,
                              overflow: 'hidden' as const
                            }}
                            onClick={() => {
                              if (selectedCharts.includes(suggestion)) {
                                setSelectedCharts(selectedCharts.filter(s => s !== suggestion))
                              } else {
                                setSelectedCharts([...selectedCharts, suggestion])
                              }
                            }}
                            onMouseOver={(e) => {
                              if (!selectedCharts.includes(suggestion)) {
                                const target = e.currentTarget as HTMLElement
                                target.style.background = 'rgba(255, 255, 255, 0.1)'
                                target.style.transform = 'scale(1.01)'
                              }
                            }}
                            onMouseOut={(e) => {
                              if (!selectedCharts.includes(suggestion)) {
                                const target = e.currentTarget as HTMLElement
                                target.style.background = 'rgba(255, 255, 255, 0.05)'
                                target.style.transform = 'scale(1)'
                              }
                            }}
                            >
                              {/* Selection Indicator */}
                              {selectedCharts.includes(suggestion) && (
                                <div style={{
                                  position: 'absolute',
                                  top: '0.5rem',
                                  right: '0.5rem',
                                  background: 'rgba(76, 175, 80, 1)',
                                  color: 'white',
                                  borderRadius: '50%',
                                  width: '24px',
                                  height: '24px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.8rem',
                                  fontWeight: 'bold',
                                  zIndex: 1
                                }}>
                                  ✓
                                </div>
                              )}

                              <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'flex-start', 
                                marginBottom: '0.8rem' 
                              }}>
                                <h4 style={{ 
                                  color: 'white', 
                                  margin: 0, 
                                  fontSize: '1.1rem',
                                  fontWeight: 'bold',
                                  flex: 1,
                                  paddingRight: '1rem'
                                }}>
                                  <span style={{ marginRight: '0.5rem' }}>
                                    {suggestion.type === 'bar' ? '📊' : 
                                     suggestion.type === 'line' ? '📈' :
                                     suggestion.type === 'pie' ? '🥧' :
                                     suggestion.type === 'scatter' ? '🎯' : 
                                     suggestion.type === 'area' ? '📉' : '📊'}
                                  </span>
                                  {suggestion.title}
                                </h4>
                                <div style={{
                                  background: `linear-gradient(135deg, hsl(${suggestion.confidence * 1.2}, 70%, 50%), hsl(${suggestion.confidence * 1.2}, 70%, 40%))`,
                                  color: 'white',
                                  padding: '0.3rem 0.6rem',
                                  borderRadius: '20px',
                                  fontSize: '0.75rem',
                                  fontWeight: 'bold',
                                  minWidth: '60px',
                                  textAlign: 'center' as const,
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                                }}>
                                  {suggestion.confidence}%
                                </div>
                              </div>

                              <p style={{ 
                                color: 'rgba(255, 255, 255, 0.7)', 
                                margin: '0 0 1rem 0', 
                                fontSize: '0.9rem',
                                lineHeight: '1.4'
                              }}>
                                {suggestion.description}
                              </p>

                              {/* Chart Details */}
                              <div style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: '8px',
                                padding: '0.8rem',
                                fontSize: '0.8rem'
                              }}>
                                <div style={{ 
                                  display: 'flex', 
                                  flexWrap: 'wrap' as const, 
                                  gap: '0.5rem',
                                  color: 'rgba(255, 255, 255, 0.8)'
                                }}>
                                  {suggestion.xAxis && (
                                    <span style={{
                                      background: 'rgba(33, 150, 243, 0.2)',
                                      color: '#2196F3',
                                      padding: '0.2rem 0.5rem',
                                      borderRadius: '12px',
                                      fontSize: '0.75rem'
                                    }}>
                                      📊 Eje X: {suggestion.xAxis}
                                    </span>
                                  )}
                                  {suggestion.yAxis && (
                                    <span style={{
                                      background: 'rgba(255, 152, 0, 0.2)',
                                      color: '#FF9800',
                                      padding: '0.2rem 0.5rem',
                                      borderRadius: '12px',
                                      fontSize: '0.75rem'
                                    }}>
                                      📈 Eje Y: {suggestion.yAxis}
                                    </span>
                                  )}
                                  {suggestion.category && (
                                    <span style={{
                                      background: 'rgba(156, 39, 176, 0.2)',
                                      color: '#9C27B0',
                                      padding: '0.2rem 0.5rem',
                                      borderRadius: '12px',
                                      fontSize: '0.75rem'
                                    }}>
                                      🏷️ Categoría: {suggestion.category}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {selectedCharts.includes(suggestion) && (
                                <div style={{
                                  marginTop: '1rem',
                                  padding: '0.8rem',
                                  background: 'rgba(76, 175, 80, 0.2)',
                                  borderRadius: '8px',
                                  border: '1px solid rgba(76, 175, 80, 0.3)'
                                }}>
                                  <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '0.5rem',
                                    color: '#4CAF50',
                                    fontSize: '0.85rem',
                                    fontWeight: 'bold'
                                  }}>
                                    <span style={{ fontSize: '1.1rem' }}>✓</span>
                                    Seleccionado para generar
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        {selectedCharts.length > 0 && (
                          <div style={{ 
                            textAlign: 'center',
                            padding: '1.5rem',
                            background: 'rgba(76, 175, 80, 0.1)',
                            borderRadius: '12px',
                            border: '1px solid rgba(76, 175, 80, 0.3)'
                          }}>
                            <div style={{
                              marginBottom: '1rem',
                              color: 'rgba(255, 255, 255, 0.9)',
                              fontSize: '0.9rem'
                            }}>
                              🎯 <strong>{selectedCharts.length}</strong> gráfica{selectedCharts.length > 1 ? 's' : ''} seleccionada{selectedCharts.length > 1 ? 's' : ''} para generar
                            </div>
                            
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
                                borderRadius: '12px',
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                margin: '0 auto'
                              }}
                              onMouseOver={(e) => {
                                const target = e.target as HTMLButtonElement
                                target.style.transform = 'translateY(-2px)'
                                target.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.4)'
                              }}
                              onMouseOut={(e) => {
                                const target = e.target as HTMLButtonElement
                                target.style.transform = 'translateY(0)'
                                target.style.boxShadow = '0 4px 15px rgba(76, 175, 80, 0.3)'
                              }}
                            >
                              <span style={{ fontSize: '1.2rem' }}>📊</span>
                              Generar {selectedCharts.length} Gráfica{selectedCharts.length > 1 ? 's' : ''}
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div style={{
                        textAlign: 'center',
                        padding: '3rem',
                        color: 'rgba(255, 255, 255, 0.6)'
                      }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>🤖</div>
                        <h4 style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.5rem' }}>
                          No se pudieron generar sugerencias automáticas
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.9rem' }}>
                          Los datos necesitan más columnas numéricas o categóricas para generar visualizaciones apropiadas.
                        </p>
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
                    <h3 style={{ 
                      color: 'white', 
                      margin: '0 0 1rem 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      👁️ Vista Previa de Datos
                      <span style={{
                        background: 'rgba(255, 193, 7, 0.2)',
                        color: '#FFC107',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '15px',
                        fontSize: '0.8rem',
                        fontWeight: 'normal'
                      }}>
                        Primeras {Math.min(dataPreview.length, 10)} filas de {rawData.length.toLocaleString()}
                      </span>
                    </h3>

                    {dataPreview.length > 0 ? (
                      <>
                        <p style={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          margin: '0 0 1.5rem 0',
                          fontSize: '0.9rem'
                        }}>
                          📋 Muestra representativa de tus datos para verificar que la detección de tipos sea correcta:
                        </p>

                        <div style={{ 
                          overflowX: 'auto', 
                          overflowY: 'auto', 
                          maxHeight: '500px',
                          background: 'rgba(0, 0, 0, 0.2)',
                          borderRadius: '10px',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                          <table style={{ 
                            width: '100%', 
                            borderCollapse: 'collapse', 
                            fontSize: '0.85rem',
                            minWidth: '800px'
                          }}>
                            <thead>
                              <tr>
                                {/* Row Number Column */}
                                <th style={{
                                  padding: '1rem 0.75rem',
                                  textAlign: 'center',
                                  color: 'rgba(255, 255, 255, 0.9)',
                                  borderBottom: '2px solid rgba(255, 255, 255, 0.2)',
                                  position: 'sticky',
                                  top: 0,
                                  background: 'rgba(0, 0, 0, 0.4)',
                                  backdropFilter: 'blur(10px)',
                                  fontWeight: 'bold',
                                  fontSize: '0.8rem',
                                  minWidth: '60px',
                                  borderRight: '1px solid rgba(255, 255, 255, 0.2)'
                                }}>
                                  #
                                </th>
                                {columns.map((column, index) => (
                                  <th key={index} style={{
                                    padding: '1rem 0.75rem',
                                    textAlign: 'left',
                                    color: 'rgba(255, 255, 255, 0.9)',
                                    borderBottom: '2px solid rgba(255, 255, 255, 0.2)',
                                    position: 'sticky',
                                    top: 0,
                                    background: 'rgba(0, 0, 0, 0.4)',
                                    backdropFilter: 'blur(10px)',
                                    fontWeight: 'bold',
                                    minWidth: '120px',
                                    borderRight: index < columns.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
                                  }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                      <span>{column.name}</span>
                                      <span style={{
                                        fontSize: '0.7rem',
                                        fontWeight: 'normal',
                                        padding: '0.2rem 0.4rem',
                                        borderRadius: '10px',
                                        background: column.type === 'number' ? '#4CAF50' : 
                                                  column.type === 'currency' ? '#FF9800' :
                                                  column.type === 'date' ? '#2196F3' :
                                                  column.type === 'percentage' ? '#9C27B0' : '#607D8B',
                                        color: 'white',
                                        textAlign: 'center' as const
                                      }}>
                                        {column.type === 'currency' ? '💰' :
                                         column.type === 'number' ? '🔢' :
                                         column.type === 'date' ? '📅' :
                                         column.type === 'percentage' ? '📊' : '📝'}
                                      </span>
                                    </div>
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {dataPreview.map((row, rowIndex) => (
                                <tr key={rowIndex} style={{
                                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                  transition: 'background 0.2s ease',
                                  background: rowIndex % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.02)'
                                }}
                                onMouseOver={(e) => {
                                  const target = e.currentTarget as HTMLElement
                                  target.style.background = 'rgba(255, 255, 255, 0.08)'
                                }}
                                onMouseOut={(e) => {
                                  const target = e.currentTarget as HTMLElement
                                  target.style.background = rowIndex % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.02)'
                                }}
                                >
                                  {/* Row Number */}
                                  <td style={{
                                    padding: '0.75rem',
                                    textAlign: 'center',
                                    color: 'rgba(255, 255, 255, 0.6)',
                                    borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                                    fontWeight: 'bold',
                                    fontSize: '0.8rem',
                                    background: 'rgba(255, 255, 255, 0.02)'
                                  }}>
                                    {rowIndex + 1}
                                  </td>
                                  
                                  {columns.map((column, colIndex) => {
                                    const cellValue = row[column.name]
                                    let displayValue = String(cellValue || '')
                                    
                                    // Format values based on detected type
                                    if (column.type === 'currency' && cellValue != null) {
                                      const numValue = Number(cellValue)
                                      if (!isNaN(numValue)) {
                                        displayValue = `$${numValue.toLocaleString()}`
                                      }
                                    } else if (column.type === 'percentage' && cellValue != null) {
                                      displayValue = `${cellValue}%`
                                    } else if (column.type === 'number' && cellValue != null) {
                                      const numValue = Number(cellValue)
                                      if (!isNaN(numValue)) {
                                        displayValue = numValue.toLocaleString()
                                      }
                                    } else if (column.type === 'date' && cellValue != null) {
                                      try {
                                        const date = new Date(cellValue)
                                        if (!isNaN(date.getTime())) {
                                          displayValue = date.toLocaleDateString('es-MX')
                                        }
                                      } catch (e) {
                                        // Keep original value if date parsing fails
                                      }
                                    }
                                    
                                    return (
                                      <td key={colIndex} style={{
                                        padding: '0.75rem',
                                        color: 'rgba(255, 255, 255, 0.8)',
                                        borderRight: colIndex < columns.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                                        whiteSpace: 'nowrap' as const,
                                        maxWidth: '150px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        fontFamily: column.type === 'number' || column.type === 'currency' ? 'monospace' : 'inherit',
                                        textAlign: column.type === 'number' || column.type === 'currency' || column.type === 'percentage' ? 'right' : 'left'
                                      }}
                                      title={displayValue} // Tooltip for truncated text
                                      >
                                        {cellValue == null || cellValue === '' ? (
                                          <span style={{ 
                                            color: 'rgba(255, 255, 255, 0.4)', 
                                            fontStyle: 'italic',
                                            fontSize: '0.8rem'
                                          }}>
                                            (vacío)
                                          </span>
                                        ) : (
                                          <span style={{
                                            color: column.type === 'currency' ? '#4CAF50' :
                                                   column.type === 'number' ? '#2196F3' :
                                                   column.type === 'percentage' ? '#9C27B0' :
                                                   column.type === 'date' ? '#FF9800' : 'rgba(255, 255, 255, 0.8)'
                                          }}>
                                            {displayValue}
                                          </span>
                                        )}
                                      </td>
                                    )
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Data Summary */}
                        <div style={{
                          marginTop: '1.5rem',
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                          gap: '1rem'
                        }}>
                          <div style={{
                            background: 'rgba(33, 150, 243, 0.1)',
                            padding: '1rem',
                            borderRadius: '10px',
                            border: '1px solid rgba(33, 150, 243, 0.3)',
                            textAlign: 'center'
                          }}>
                            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📊</div>
                            <div style={{ color: '#2196F3', fontWeight: 'bold', fontSize: '1.1rem' }}>
                              {rawData.length.toLocaleString()}
                            </div>
                            <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem' }}>
                              Total de Filas
                            </div>
                          </div>

                          <div style={{
                            background: 'rgba(76, 175, 80, 0.1)',
                            padding: '1rem',
                            borderRadius: '10px',
                            border: '1px solid rgba(76, 175, 80, 0.3)',
                            textAlign: 'center'
                          }}>
                            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🗂️</div>
                            <div style={{ color: '#4CAF50', fontWeight: 'bold', fontSize: '1.1rem' }}>
                              {columns.length}
                            </div>
                            <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem' }}>
                              Columnas Detectadas
                            </div>
                          </div>

                          <div style={{
                            background: 'rgba(255, 152, 0, 0.1)',
                            padding: '1rem',
                            borderRadius: '10px',
                            border: '1px solid rgba(255, 152, 0, 0.3)',
                            textAlign: 'center'
                          }}>
                            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🎯</div>
                            <div style={{ color: '#FF9800', fontWeight: 'bold', fontSize: '1.1rem' }}>
                              {Math.round(columns.reduce((acc, col) => acc + (col.confidence || 0), 0) / columns.length * 100)}%
                            </div>
                            <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem' }}>
                              Confianza Promedio
                            </div>
                          </div>

                          <div style={{
                            background: 'rgba(156, 39, 176, 0.1)',
                            padding: '1rem',
                            borderRadius: '10px',
                            border: '1px solid rgba(156, 39, 176, 0.3)',
                            textAlign: 'center'
                          }}>
                            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🤖</div>
                            <div style={{ color: '#9C27B0', fontWeight: 'bold', fontSize: '1.1rem' }}>
                              {suggestions.length}
                            </div>
                            <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem' }}>
                              Gráficas Sugeridas
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div style={{
                        textAlign: 'center',
                        padding: '3rem',
                        color: 'rgba(255, 255, 255, 0.6)'
                      }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>📋</div>
                        <h4 style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.5rem' }}>
                          No hay datos para previsualizar
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.9rem' }}>
                          Sube un archivo Excel para ver una muestra de los datos.
                        </p>
                      </div>
                    )}
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
                    <h2 style={{ 
                      color: 'white', 
                      margin: '0 0 1rem 0',
                      fontSize: '2rem',
                      fontWeight: 'bold'
                    }}>
                      📊 Gráficas Generadas ({processedData.length})
                    </h2>
                    <p style={{ 
                      color: 'rgba(255, 255, 255, 0.8)', 
                      margin: 0,
                      fontSize: '1rem'
                    }}>
                      Visualizaciones interactivas basadas en tus datos. Haz hover para más detalles.
                    </p>
                  </div>

                  {/* Charts Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
                    gap: '2rem',
                    marginBottom: '2rem'
                  }}>
                    {processedData.map((chart, index) => (
                      <div key={index} style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '15px',
                        padding: '1.5rem',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        cursor: 'pointer'
                      }}
                      onMouseOver={(e) => {
                        const target = e.currentTarget as HTMLElement
                        target.style.transform = 'translateY(-5px)'
                        target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)'
                      }}
                      onMouseOut={(e) => {
                        const target = e.currentTarget as HTMLElement
                        target.style.transform = 'translateY(0)'
                        target.style.boxShadow = 'none'
                      }}
                      >
                        {/* Chart Header */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '1rem',
                          flexWrap: 'wrap' as const,
                          gap: '1rem'
                        }}>
                          <div style={{ flex: 1 }}>
                            <h3 style={{ 
                              color: 'white', 
                              margin: '0 0 0.5rem 0', 
                              fontSize: '1.3rem',
                              fontWeight: 'bold',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}>
                              <span style={{ fontSize: '1.5rem' }}>
                                {chart.type === 'bar' ? '📊' : 
                                 chart.type === 'line' ? '📈' :
                                 chart.type === 'pie' ? '🥧' :
                                 chart.type === 'scatter' ? '🎯' : 
                                 chart.type === 'area' ? '📉' : '📊'}
                              </span>
                              {chart.title}
                            </h3>
                            <p style={{
                              color: 'rgba(255, 255, 255, 0.7)',
                              margin: 0,
                              fontSize: '0.9rem',
                              lineHeight: '1.4'
                            }}>
                              {chart.description}
                            </p>
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                            <span style={{
                              background: `linear-gradient(135deg, hsl(${chart.confidence * 1.2}, 70%, 50%), hsl(${chart.confidence * 1.2}, 70%, 40%))`,
                              color: 'white',
                              padding: '0.4rem 0.8rem',
                              borderRadius: '20px',
                              fontSize: '0.8rem',
                              fontWeight: 'bold',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                              whiteSpace: 'nowrap' as const
                            }}>
                              Confianza: {chart.confidence}%
                            </span>
                            
                            <div style={{
                              background: 'rgba(255, 255, 255, 0.1)',
                              padding: '0.3rem 0.6rem',
                              borderRadius: '15px',
                              fontSize: '0.75rem',
                              color: 'rgba(255, 255, 255, 0.8)',
                              whiteSpace: 'nowrap' as const
                            }}>
                              📊 {chart.data?.length || 0} puntos
                            </div>
                          </div>
                        </div>

                        {/* Chart Details */}
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap' as const,
                          gap: '0.5rem',
                          marginBottom: '1.5rem'
                        }}>
                          {chart.xAxis && (
                            <span style={{
                              background: 'rgba(33, 150, 243, 0.2)',
                              color: '#2196F3',
                              padding: '0.3rem 0.6rem',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: 'bold'
                            }}>
                              📊 X: {chart.xAxis}
                            </span>
                          )}
                          {chart.yAxis && (
                            <span style={{
                              background: 'rgba(255, 152, 0, 0.2)',
                              color: '#FF9800',
                              padding: '0.3rem 0.6rem',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: 'bold'
                            }}>
                              📈 Y: {chart.yAxis}
                            </span>
                          )}
                          {chart.category && (
                            <span style={{
                              background: 'rgba(156, 39, 176, 0.2)',
                              color: '#9C27B0',
                              padding: '0.3rem 0.6rem',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: 'bold'
                            }}>
                              🏷️ Cat: {chart.category}
                            </span>
                          )}
                          <span style={{
                            background: 'rgba(76, 175, 80, 0.2)',
                            color: '#4CAF50',
                            padding: '0.3rem 0.6rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            textTransform: 'capitalize' as const
                          }}>
                            🎨 {chart.type}
                          </span>
                        </div>

                        {/* Chart Container */}
                        <div style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '10px',
                          padding: '1rem',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          minHeight: '320px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {chart.data && chart.data.length > 0 ? (
                            renderChart(chart, chart.data)
                          ) : (
                            <div style={{
                              textAlign: 'center',
                              color: 'rgba(255, 255, 255, 0.6)',
                              padding: '2rem'
                            }}>
                              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
                              <div>No hay datos disponibles para esta gráfica</div>
                            </div>
                          )}
                        </div>

                        {/* Chart Statistics */}
                        {chart.data && chart.data.length > 0 && (
                          <div style={{
                            marginTop: '1rem',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                            gap: '0.5rem',
                            padding: '1rem',
                            background: 'rgba(0, 0, 0, 0.2)',
                            borderRadius: '8px'
                          }}>
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.7rem' }}>PUNTOS</div>
                              <div style={{ color: 'white', fontWeight: 'bold' }}>{chart.data.length}</div>
                            </div>
                            
                            {chart.type !== 'pie' && chart.yAxis && (
                              <>
                                <div style={{ textAlign: 'center' }}>
                                  <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.7rem' }}>MÁXIMO</div>
                                  <div style={{ color: '#4CAF50', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                    {Math.max(...chart.data.map((d: any) => Number(d[chart.yAxis!] || d.value || 0))).toLocaleString()}
                                  </div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                  <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.7rem' }}>MÍNIMO</div>
                                  <div style={{ color: '#F44336', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                    {Math.min(...chart.data.map((d: any) => Number(d[chart.yAxis!] || d.value || 0))).toLocaleString()}
                                  </div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                  <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.7rem' }}>PROMEDIO</div>
                                  <div style={{ color: '#2196F3', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                    {Math.round(chart.data.reduce((acc: number, d: any) => acc + Number(d[chart.yAxis!] || d.value || 0), 0) / chart.data.length).toLocaleString()}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Chart Actions */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '15px',
                    padding: '2rem',
                    textAlign: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    <h3 style={{ color: 'white', margin: '0 0 1rem 0' }}>
                      🎯 ¿Qué quieres hacer ahora?
                    </h3>
                    
                    <div style={{
                      display: 'flex',
                      gap: '1rem',
                      justifyContent: 'center',
                      flexWrap: 'wrap' as const
                    }}>
                      <button
                        onClick={() => setViewMode('analysis')}
                        style={{
                          padding: '1rem 2rem',
                          background: 'rgba(33, 150, 243, 0.2)',
                          color: '#2196F3',
                          border: '2px solid rgba(33, 150, 243, 0.5)',
                          borderRadius: '12px',
                          fontSize: '1rem',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                        onMouseOver={(e) => {
                          const target = e.target as HTMLButtonElement
                          target.style.background = 'rgba(33, 150, 243, 0.3)'
                          target.style.transform = 'translateY(-2px)'
                        }}
                        onMouseOut={(e) => {
                          const target = e.target as HTMLButtonElement
                          target.style.background = 'rgba(33, 150, 243, 0.2)'
                          target.style.transform = 'translateY(0)'
                        }}
                      >
                        <span>🔍</span>
                        Volver al Análisis
                      </button>
                      
                      <button
                        onClick={() => {
                          // Reset all states for new analysis
                          setViewMode('upload')
                          setFile(null)
                          setRawData([])
                          setColumns([])
                          setSuggestions([])
                          setSelectedCharts([])
                          setProcessedData([])
                          setDataPreview([])
                          setAnalysisComplete(false)
                          setIsAnalyzing(false)
                        }}
                        style={{
                          padding: '1rem 2rem',
                          background: 'linear-gradient(135deg, #FF5722, #E64A19)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '12px',
                          fontSize: '1rem',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          boxShadow: '0 4px 15px rgba(255, 87, 34, 0.3)'
                        }}
                        onMouseOver={(e) => {
                          const target = e.target as HTMLButtonElement
                          target.style.transform = 'translateY(-2px)'
                          target.style.boxShadow = '0 6px 20px rgba(255, 87, 34, 0.4)'
                        }}
                        onMouseOut={(e) => {
                          const target = e.target as HTMLButtonElement
                          target.style.transform = 'translateY(0)'
                          target.style.boxShadow = '0 4px 15px rgba(255, 87, 34, 0.3)'
                        }}
                      >
                        <span>📁</span>
                        Nuevo Análisis
                      </button>

                      <button
                        onClick={() => {
                          // Add more charts functionality
                          setViewMode('analysis')
                          setSelectedCharts([])
                        }}
                        style={{
                          padding: '1rem 2rem',
                          background: 'rgba(76, 175, 80, 0.2)',
                          color: '#4CAF50',
                          border: '2px solid rgba(76, 175, 80, 0.5)',
                          borderRadius: '12px',
                          fontSize: '1rem',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                        onMouseOver={(e) => {
                          const target = e.target as HTMLButtonElement
                          target.style.background = 'rgba(76, 175, 80, 0.3)'
                          target.style.transform = 'translateY(-2px)'
                        }}
                        onMouseOut={(e) => {
                          const target = e.target as HTMLButtonElement
                          target.style.background = 'rgba(76, 175, 80, 0.2)'
                          target.style.transform = 'translateY(0)'
                        }}
                      >
                        <span>➕</span>
                        Agregar Más Gráficas
                      </button>
                    </div>

                    <div style={{
                      marginTop: '1.5rem',
                      padding: '1rem',
                      background: 'rgba(255, 193, 7, 0.1)',
                      borderRadius: '10px',
                      border: '1px solid rgba(255, 193, 7, 0.3)'
                    }}>
                      <div style={{
                        color: '#FFC107',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        marginBottom: '0.5rem'
                      }}>
                        💡 Consejo: Estas gráficas son interactivas
                      </div>
                      <div style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.8rem'
                      }}>
                        Pasa el mouse sobre las gráficas para ver detalles adicionales y valores específicos.
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.3 }}>📊</div>
                  <h3 style={{ 
                    color: 'rgba(255, 255, 255, 0.7)',
                    marginBottom: '1rem'
                  }}>
                    No hay gráficas para mostrar
                  </h3>
                  <p style={{ 
                    color: 'rgba(255, 255, 255, 0.6)',
                    marginBottom: '2rem',
                    fontSize: '0.9rem'
                  }}>
                    Selecciona gráficas en la sección de análisis y genera las visualizaciones.
                  </p>
                  
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' as const }}>
                    <button
                      onClick={() => setViewMode('analysis')}
                      style={{
                        padding: '1rem 2rem',
                        background: 'rgba(33, 150, 243, 0.2)',
                        color: '#2196F3',
                        border: '2px solid rgba(33, 150, 243, 0.5)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={(e) => {
                        const target = e.target as HTMLButtonElement
                        target.style.background = 'rgba(33, 150, 243, 0.3)'
                      }}
                      onMouseOut={(e) => {
                        const target = e.target as HTMLButtonElement
                        target.style.background = 'rgba(33, 150, 243, 0.2)'
                      }}
                    >
                      🔍 Ir al Análisis
                    </button>
                    
                    <button
                      onClick={() => setViewMode('upload')}
                      style={{
                        padding: '1rem 2rem',
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: 'rgba(255, 255, 255, 0.8)',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={(e) => {
                        const target = e.target as HTMLButtonElement
                        target.style.background = 'rgba(255, 255, 255, 0.2)'
                      }}
                      onMouseOut={(e) => {
                        const target = e.target as HTMLButtonElement
                        target.style.background = 'rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      📁 Subir Archivo
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          </div>
      </div>

      {/* Global Styles */}
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideIn {
          from { transform: translateX(-20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
          40%, 43% { transform: translate3d(0,-30px,0); }
          70% { transform: translate3d(0,-15px,0); }
          90% { transform: translate3d(0,-4px,0); }
        }
        
        @keyframes glow {
          0% { box-shadow: 0 0 5px rgba(255,255,255,0.2); }
          50% { box-shadow: 0 0 20px rgba(255,255,255,0.4); }
          100% { box-shadow: 0 0 5px rgba(255,255,255,0.2); }
        }
        
        /* Scrollbar Styling */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
        
        /* Custom table styling */
        table {
          border-spacing: 0;
        }
        
        table td, table th {
          border-collapse: collapse;
        }
        
        /* Recharts tooltip customization */
        .recharts-tooltip-wrapper {
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
        }
        
        /* Selection animation */
        .chart-selected {
          animation: glow 2s infinite;
        }
        
        /* Loading dots animation */
        .loading-dot {
          animation: pulse 1.5s ease-in-out infinite;
        }
        
        .loading-dot:nth-child(1) { animation-delay: 0s; }
        .loading-dot:nth-child(2) { animation-delay: 0.2s; }
        .loading-dot:nth-child(3) { animation-delay: 0.4s; }
        .loading-dot:nth-child(4) { animation-delay: 0.6s; }
        .loading-dot:nth-child(5) { animation-delay: 0.8s; }
        
        /* Feature cards animation */
        .feature-card {
          animation: fadeIn 0.6s ease-out;
        }
        
        .feature-card:nth-child(1) { animation-delay: 0.1s; }
        .feature-card:nth-child(2) { animation-delay: 0.2s; }
        .feature-card:nth-child(3) { animation-delay: 0.3s; }
        .feature-card:nth-child(4) { animation-delay: 0.4s; }
        
        /* Responsive design */
        @media (max-width: 768px) {
          .nav-links {
            flex-direction: column;
            gap: 0.5rem;
          }
          
          .chart-grid {
            grid-template-columns: 1fr;
          }
          
          .mode-navigation {
            flex-direction: column;
            gap: 0.5rem;
          }
          
          .action-buttons {
            flex-direction: column;
            width: 100%;
          }
          
          .feature-grid {
            grid-template-columns: 1fr;
          }
          
          .data-preview-table {
            font-size: 0.75rem;
          }
          
          .chart-container {
            min-height: 250px;
          }
        }
        
        @media (max-width: 480px) {
          .main-container {
            padding: 1rem;
          }
          
          .content-card {
            padding: 1rem;
          }
          
          .chart-card {
            padding: 1rem;
          }
          
          .table-container {
            font-size: 0.7rem;
          }
          
          .header-title {
            font-size: 1.8rem;
          }
          
          .chart-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
        }
        
        /* Accessibility improvements */
        button:focus {
          outline: 2px solid rgba(255, 255, 255, 0.5);
          outline-offset: 2px;
        }
        
        .nav-link:focus {
          outline: 2px solid rgba(255, 255, 255, 0.5);
          outline-offset: 2px;
          border-radius: 4px;
        }
        
        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .glassmorphism {
            background: rgba(0, 0, 0, 0.8) !important;
            border: 2px solid white !important;
          }
          
          .text-secondary {
            color: white !important;
          }
        }
        
        /* Reduced motion for accessibility */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
        
        /* Print styles */
        @media print {
          .nav-container {
            display: none;
          }
          
          .chart-container {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          
          .action-buttons {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}