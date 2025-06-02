'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter
} from 'recharts'
import * as XLSX from 'xlsx'

interface ExcelData {
  [key: string]: any
}

interface ColumnAnalysis {
  name: string
  type: 'number' | 'date' | 'text' | 'currency' | 'percentage'
  uniqueValues: number
  nullCount: number
  sample: any[]
  confidence: number
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
  const [selectedCharts, setSelectedCharts] = useState<ChartSuggestion[]>([]) // TU ESTADO ORIGINAL
  const [selectedSuggestions, setSelectedSuggestions] = useState<number[]>([]) // ✅ AGREGAR ESTE
  const [processedData, setProcessedData] = useState<{suggestion: ChartSuggestion, data: any[]}[]>([]) // ✅ CAMBIAR TIPO
  
  // Estados de UI
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false) // TU ESTADO ADICIONAL
  const [viewMode, setViewMode] = useState<'upload' | 'analysis' | 'charts'>('upload')
  const [dataPreview, setDataPreview] = useState<ExcelData[]>([]) // TU ESTADO ADICIONAL

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
// Función para leer archivo Excel REAL
  const handleFileUpload = async (selectedFile: File) => {
    if (!selectedFile) return
    
    setFile(selectedFile)
    setIsAnalyzing(true)
    setViewMode('analysis')
    
    try {
      console.log('📊 Analizando archivo Excel REAL:', selectedFile.name, 'Tamaño:', selectedFile.size, 'bytes')
      
      // Lectura real del archivo Excel con SheetJS
      const arrayBuffer = await selectedFile.arrayBuffer()
      console.log('📄 Archivo leído en memoria, procesando...')
      
      // Leer el workbook
      const workbook = XLSX.read(arrayBuffer, {
        cellDates: true,    // Convertir fechas automáticamente
        cellNF: false,      // No aplicar formato de número
        cellText: false,    // No convertir todo a texto
        raw: false          // Aplicar formato apropiado
      })
      
      console.log('📋 Hojas disponibles:', workbook.SheetNames)
      
      // Usar la primera hoja
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      
      // Convertir hoja a JSON
      const realData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,          // Usar números como headers inicialmente
        defval: '',         // Valor por defecto para celdas vacías
        raw: false          // Aplicar formato
      }) as any[][]
      
      console.log('📊 Datos brutos extraídos:', realData.length, 'filas')
      
      if (realData.length === 0) {
        throw new Error('El archivo Excel está vacío o no contiene datos')
      }
      
      // Procesar datos: primera fila como headers, resto como datos
      const headers = realData[0].map((header, index) => 
        header && header.toString().trim() || `Columna_${index + 1}`
      )
      
      const dataRows = realData.slice(1).filter(row => 
        row.some(cell => cell !== null && cell !== undefined && cell !== '')
      )
      
      console.log('📋 Headers detectados:', headers)
      console.log('📊 Filas de datos válidas:', dataRows.length)
      
      if (dataRows.length === 0) {
        throw new Error('No se encontraron datos válidos en el archivo Excel')
      }
      
      // Convertir a formato objeto
      const processedData: ExcelData[] = dataRows.map((row, index) => {
        const rowObj: ExcelData = {}
        headers.forEach((header, colIndex) => {
          const cellValue = row[colIndex]
          
          // Procesar valor de celda
          if (cellValue === null || cellValue === undefined || cellValue === '') {
            rowObj[header] = null
          } else if (typeof cellValue === 'string') {
            // Limpiar strings
            const cleanValue = cellValue.trim()
            rowObj[header] = cleanValue === '' ? null : cleanValue
          } else if (cellValue instanceof Date) {
            // Formatear fechas
            rowObj[header] = cellValue.toISOString().split('T')[0]
          } else {
            // Números y otros tipos
            rowObj[header] = cellValue
          }
        })
        return rowObj
      })
      
      console.log('✅ Datos procesados exitosamente:', processedData.length, 'filas')
      console.log('📋 Muestra de datos:', processedData.slice(0, 3))
      
      // Validar que tengamos datos útiles
      if (processedData.length < 2) {
        throw new Error('El archivo necesita al menos 2 filas de datos para análisis')
      }
      
      setRawData(processedData)
      setDataPreview(processedData.slice(0, 10)) // Solo primeras 10 filas para preview
      
      // Analizar columnas con lógica corregida
      const columnAnalysis = analyzeColumns(processedData)
      setColumns(columnAnalysis)
      console.log('🔍 Análisis de columnas completado:', columnAnalysis)
      
      // Generar sugerencias automáticas
      const chartSuggestions = generateChartSuggestions(columnAnalysis, processedData)
      setSuggestions(chartSuggestions)
      console.log('🤖 Sugerencias generadas:', chartSuggestions)
      
      setAnalysisComplete(true)
      
    } catch (error) {
      console.error('❌ Error analizando archivo Excel:', error)
      
      // Mostrar error específico al usuario
      let errorMessage = 'Error desconocido al procesar el archivo'
      
      if (error instanceof Error) {
        if (error.message.includes('zip')) {
          errorMessage = 'El archivo parece estar corrupto o no es un archivo Excel válido'
        } else if (error.message.includes('vacío')) {
          errorMessage = 'El archivo Excel está vacío o no contiene datos'
        } else if (error.message.includes('datos válidos')) {
          errorMessage = 'No se encontraron datos válidos en el archivo'
        } else if (error.message.includes('2 filas')) {
          errorMessage = 'El archivo necesita al menos 2 filas de datos para análisis'
        } else {
          errorMessage = error.message
        }
      }
      
      // Resetear estado en caso de error
      setRawData([])
      setColumns([])
      setSuggestions([])
      setDataPreview([])
      setAnalysisComplete(false)
      setViewMode('upload')
      
      // Mostrar error al usuario
      alert(`Error al procesar el archivo Excel:\n\n${errorMessage}\n\nVerifica que:\n- El archivo no esté corrupto\n- Contenga datos en la primera hoja\n- Tenga headers en la primera fila\n- Tenga al menos 2 filas de datos`)
      
    } finally {
      setIsAnalyzing(false)
    }
  }
// Analizar tipos de columnas con datos reales
  const analyzeColumns = (data: ExcelData[]): ColumnAnalysis[] => {
    if (data.length === 0) return []
    
    console.log('🔍 Iniciando análisis de columnas con', data.length, 'filas de datos reales')
    
    const sample = data.slice(0, Math.min(100, data.length)) // Analizar muestra para optimización
    const columnNames = Object.keys(sample[0] || {})
    
    console.log('📋 Columnas encontradas:', columnNames)
    
    return columnNames.map(columnName => {
      const values = sample
        .map(row => row[columnName])
        .filter(v => v !== null && v !== undefined && v !== '')
      
      const uniqueValues = new Set(values).size
      const nullCount = sample.length - values.length
      
      console.log(`🔍 Analizando columna "${columnName}":`, {
        totalValues: values.length,
        uniqueValues,
        nullCount,
        sampleValues: values.slice(0, 3)
      })
      
      // Detección mejorada de tipos para datos reales
      let type: ColumnAnalysis['type'] = 'text'
      let confidence = 0
      let numericCount = 0
      let dateCount = 0
      let currencyCount = 0
      let percentageCount = 0
      
      values.forEach(value => {
        const strValue = String(value).trim()
        
        // Detectar moneda (símbolos $, €, ¥, etc. o números con formato de moneda)
        if (/^[\$€¥£₹]?[\d,]+\.?\d*$/.test(strValue) || 
            /^[\d,]+\.?\d*[\$€¥£₹]$/.test(strValue) ||
            (typeof value === 'number' && columnName.toLowerCase().match(/(precio|costo|ingreso|ganancia|monto|valor)/))) {
          currencyCount++
        }
        // Detectar porcentaje (símbolo % o valores entre 0-100 en columnas de porcentaje)
        else if (/^\d+\.?\d*%$/.test(strValue) ||
                (typeof value === 'number' && value >= 0 && value <= 100 && 
                 columnName.toLowerCase().match(/(porcentaje|rentabilidad|%)/))) {
          percentageCount++
        }
        // Detectar fecha (formatos comunes de fecha)
        else if (value instanceof Date || 
                strValue.match(/^\d{4}[-\/]\d{1,2}[-\/]\d{1,2}$/) ||
                strValue.match(/^\d{1,2}[-\/]\d{1,2}[-\/]\d{4}$/) ||
                (!isNaN(Date.parse(strValue)) && strValue.length > 6 && strValue.length < 12 && strValue.includes('/'))) {
          dateCount++
        }
        // Detectar número puro (sin símbolos de moneda o porcentaje)
        else if (typeof value === 'number' || 
                (!isNaN(parseFloat(strValue)) && isFinite(parseFloat(strValue)) && 
                 !strValue.includes('/') && !strValue.includes('-') && strValue.length < 10)) {
          numericCount++
        }
      })
      
      const totalValues = values.length
      
      console.log(`📊 Conteos para "${columnName}":`, {
        numericCount,
        currencyCount,
        percentageCount,
        dateCount,
        totalValues
      })
      
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
      
      // Detección por nombre de columna mejorada (fallback)
      if (confidence < 0.8) {
        const columnLower = columnName.toLowerCase()
        
        // Patrones para moneda/dinero
        if (columnLower.match(/(precio|ingreso|costo|ganancia|monto|valor|dinero|pago|factura|venta)/)) {
          type = 'currency'
          confidence = Math.max(confidence, 0.75)
        } 
        // Patrones para porcentaje
        else if (columnLower.match(/(rentabilidad|porcentaje|%|tasa|ratio|proporcion)/)) {
          type = 'percentage'
          confidence = Math.max(confidence, 0.75)
        } 
        // Patrones para fecha
        else if (columnLower.match(/(fecha|date|dia|mes|año|time|cuando)/)) {
          type = 'date'
          confidence = Math.max(confidence, 0.75)
        } 
        // Patrones para número
        else if (columnLower.match(/(cantidad|numero|unidades|total|count|id|edad|años)/)) {
          type = 'number'
          confidence = Math.max(confidence, 0.75)
        }
      }
      
      const result = {
        name: columnName,
        type,
        uniqueValues,
        nullCount,
        sample: values.slice(0, 5),
        confidence: Math.round(confidence * 100) / 100
      }
      
      console.log(`✅ Resultado para "${columnName}":`, result)
      
      return result
    })
  }
// Generar sugerencias de gráficas
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
        padding: '1rem 0'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 1rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <Link href="/" style={{ 
            color: 'white', 
            textDecoration: 'none', 
            fontSize: '1.5rem', 
            fontWeight: 'bold' 
          }}>
            🤖 AI RAG Agent
          </Link>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link href="/analyzer" style={{ 
              color: 'white', 
              textDecoration: 'none', 
              padding: '0.5rem 1rem', 
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              📊 Excel Analyzer
            </Link>
            <span style={{ 
              color: 'rgba(255, 255, 255, 0.8)', 
              fontSize: '0.9rem' 
            }}>
              {currentTime}
            </span>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 1rem',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(15px)',
        borderRadius: '20px',
        marginTop: '2rem',
        marginBottom: '2rem',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ 
            color: 'white', 
            fontSize: '3rem', 
            fontWeight: 'bold', 
            marginBottom: '0.5rem',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
          }}>
            📊 Excel Data Analyzer
          </h1>
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.8)', 
            fontSize: '1.2rem',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Sube tu archivo Excel y obtén análisis automático con sugerencias de visualización inteligentes
          </p>
        </div>

        {/* Navigation Steps */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginBottom: '3rem',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          {['upload', 'analysis', 'charts'].map((mode, index) => (
           <button
            key={mode}
            onClick={() => setViewMode(mode as any)}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '12px',
              background: viewMode === mode 
                ? 'rgba(255, 255, 255, 0.3)' 
                : 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${viewMode === mode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.2)'}`, // ✅ SOLO UNA VEZ
              fontWeight: viewMode === mode ? 'bold' : 'normal'
         }}
            >
              {index + 1}. {mode === 'upload' ? '📁 Upload' : mode === 'analysis' ? '🔍 Analysis' : '📊 Charts'}
            </button>
          ))}
        </div>

        {/* Content based on view mode - UPLOAD VIEW */}
        {viewMode === 'upload' && (
          <div style={{ textAlign: 'center' }}>
            {/* File Drop Zone */}
            <div style={{
              border: '2px dashed rgba(255, 255, 255, 0.3)',
              borderRadius: '15px',
              padding: '3rem',
              marginBottom: '2rem',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              background: 'rgba(255, 255, 255, 0.05)'
            }}
            onClick={() => document.getElementById('fileInput')?.click()}
            onDrop={(e) => {
              e.preventDefault()
              const files = e.dataTransfer.files
              if (files.length > 0) {
                handleFileUpload(files[0])
              }
            }}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={(e) => {
              e.preventDefault()
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.6)'
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
            }}
            onDragLeave={(e) => {
              e.preventDefault()
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
            }}
            >
              <input
                id="fileInput"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file)
                }}
                style={{ display: 'none' }}
              />
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📊</div>
              <h3 style={{ 
                color: 'white', 
                marginBottom: '1rem',
                fontSize: '1.5rem'
              }}>
                Arrastra tu archivo Excel aquí o haz clic para seleccionar
              </h3>
              <p style={{ 
                color: 'rgba(255, 255, 255, 0.7)', 
                marginBottom: '1.5rem',
                fontSize: '1rem'
              }}>
                Formatos soportados: .xlsx, .xls, .csv (máximo 50MB)
              </p>
              <button style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)'
              }}
              >
                📂 Seleccionar Archivo
              </button>
            </div>

            {/* Features Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
              marginTop: '3rem'
            }}>
              {[
                { 
                  icon: '🔍', 
                  title: 'Análisis Automático', 
                  desc: 'Detecta tipos de datos automáticamente con alta precisión',
                  color: '#3b82f6'
                },
                { 
                  icon: '📊', 
                  title: 'Sugerencias de Gráficas', 
                  desc: 'Recomendaciones inteligentes de visualización basadas en tus datos',
                  color: '#22c55e'
                },
                { 
                  icon: '⚡', 
                  title: 'Procesamiento Rápido', 
                  desc: 'Análisis en tiempo real de hasta 50K filas con SheetJS',
                  color: '#f59e0b'
                },
                { 
                  icon: '🎨', 
                  title: 'Visualizaciones Interactivas', 
                  desc: 'Gráficas profesionales y responsivas con Recharts',
                  color: '#a855f7'
                }
              ].map((feature, index) => (
                <div key={index} style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '15px',
                  padding: '1.5rem',
                  textAlign: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
                >
                  <div style={{ 
                    fontSize: '2.5rem', 
                    marginBottom: '1rem',
                    filter: `drop-shadow(0 0 10px ${feature.color}50)`
                  }}>
                    {feature.icon}
                  </div>
                  <h4 style={{ 
                    color: 'white', 
                    marginBottom: '0.5rem',
                    fontSize: '1.1rem',
                    fontWeight: 'bold'
                  }}>
                    {feature.title}
                  </h4>
                  <p style={{ 
                    color: 'rgba(255, 255, 255, 0.7)', 
                    fontSize: '0.9rem',
                    lineHeight: '1.5'
                  }}>
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Supported Formats Section */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '15px',
              padding: '2rem',
              marginTop: '3rem',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <h3 style={{ 
                color: 'white', 
                fontSize: '1.5rem', 
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                📁 Formatos Soportados
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginTop: '1.5rem'
              }}>
                {[
                  { format: '.xlsx', desc: 'Excel 2007+', icon: '📊', color: '#22c55e' },
                  { format: '.xls', desc: 'Excel 97-2003', icon: '📋', color: '#3b82f6' },
                  { format: '.csv', desc: 'Valores separados por comas', icon: '📄', color: '#f59e0b' }
                ].map((format, index) => (
                  <div key={index} style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '10px',
                    padding: '1rem',
                    textAlign: 'center',
                    border: `1px solid ${format.color}30`
                  }}>
                    <div style={{ 
                      fontSize: '2rem', 
                      marginBottom: '0.5rem',
                      filter: `drop-shadow(0 0 8px ${format.color}40)`
                    }}>
                      {format.icon}
                    </div>
                    <div style={{ 
                      color: format.color, 
                      fontWeight: 'bold', 
                      fontSize: '1.1rem',
                      marginBottom: '0.25rem'
                    }}>
                      {format.format}
                    </div>
                    <div style={{ 
                      color: 'rgba(255, 255, 255, 0.7)', 
                      fontSize: '0.875rem' 
                    }}>
                      {format.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips Section */}
            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '15px',
              padding: '2rem',
              marginTop: '2rem',
              border: '1px solid rgba(59, 130, 246, 0.3)'
            }}>
              <h3 style={{ 
                color: '#3b82f6', 
                fontSize: '1.3rem', 
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                💡 Consejos para Mejores Resultados
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1rem'
              }}>
                {[
                  '📋 Asegúrate de que la primera fila contenga los nombres de las columnas',
                  '🔢 Usa formatos consistentes para números y fechas',
                  '📊 Incluye al menos una columna numérica para generar gráficas',
                  '🧹 Elimina filas vacías y datos inconsistentes antes de subir'
                ].map((tip, index) => (
                  <div key={index} style={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '0.9rem',
                    padding: '0.5rem 0',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem'
                  }}>
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
{/* Content based on view mode - ANALYSIS VIEW */}
        {viewMode === 'analysis' && (
          <div>
            {isAnalyzing ? (
              /* Loading State */
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{
                  fontSize: '4rem',
                  marginBottom: '1.5rem',
                  animation: 'pulse 2s infinite'
                }}>📊</div>
                <h3 style={{ 
                  color: 'white', 
                  marginBottom: '1rem',
                  fontSize: '2rem',
                  fontWeight: 'bold'
                }}>
                  Analizando tu archivo Excel...
                </h3>
                <p style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '1.1rem',
                  marginBottom: '2rem'
                }}>
                  Procesando datos reales con SheetJS
                </p>
                
                {/* Loading Dots Animation */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  gap: '0.5rem',
                  marginBottom: '3rem'
                }}>
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      style={{
                        width: '16px',
                        height: '16px',
                        background: 'white',
                        borderRadius: '50%',
                        animation: `pulse 1.5s infinite ${i * 0.3}s`
                      }}
                    />
                  ))}
                </div>

                {/* Processing Steps */}
                <div style={{ 
                  color: 'rgba(255, 255, 255, 0.8)', 
                  fontSize: '1rem',
                  textAlign: 'left',
                  maxWidth: '400px',
                  margin: '0 auto',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '15px',
                  padding: '2rem',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <h4 style={{ 
                    color: 'white', 
                    marginBottom: '1rem',
                    fontSize: '1.2rem',
                    textAlign: 'center'
                  }}>
                    🔄 Proceso de Análisis
                  </h4>
                  {[
                    { step: '📖 Leyendo estructura del archivo Excel', delay: '0s' },
                    { step: '🔍 Detectando tipos de datos automáticamente', delay: '0.5s' },
                    { step: '📊 Analizando columnas y calculando confianza', delay: '1s' },
                    { step: '🤖 Generando sugerencias inteligentes', delay: '1.5s' },
                    { step: '✨ Preparando vista previa de datos', delay: '2s' }
                  ].map((item, index) => (
                    <div 
                      key={index}
                      style={{
                        padding: '0.75rem 0',
                        borderBottom: index < 4 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                        animation: `fadeIn 0.8s ease-out ${item.delay} both`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <span style={{ minWidth: '20px' }}>
                        {index < 3 ? '⏳' : index === 3 ? '🔄' : '✅'}
                      </span>
                      {item.step}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Analysis Results */
              <div>
                {/* File Information Section */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '15px',
                  padding: '2rem',
                  marginBottom: '2rem',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '1.5rem',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}>
                    <h3 style={{ 
                      color: 'white', 
                      fontSize: '1.8rem',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      📄 Información del Archivo
                    </h3>
                    <span style={{
                      background: 'rgba(34, 197, 94, 0.2)',
                      color: '#22c55e',
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      ✅ Análisis Completo
                    </span>
                  </div>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1.5rem'
                  }}>
                    {[
                      { 
                        label: 'Archivo', 
                        value: file?.name || 'N/A', 
                        icon: '📄',
                        color: '#3b82f6'
                      },
                      { 
                        label: 'Tamaño', 
                        value: file ? `${(file.size / 1024).toFixed(1)} KB` : 'N/A', 
                        icon: '💾',
                        color: '#22c55e'
                      },
                      { 
                        label: 'Filas', 
                        value: rawData.length.toLocaleString(), 
                        icon: '📊',
                        color: '#f59e0b'
                      },
                      { 
                        label: 'Columnas', 
                        value: columns.length.toString(), 
                        icon: '📋',
                        color: '#a855f7'
                      }
                    ].map((info, index) => (
                      <div key={index} style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        textAlign: 'center',
                        border: `1px solid ${info.color}30`,
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-3px)'
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'
                        e.currentTarget.style.boxShadow = `0 8px 25px ${info.color}20`
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                      >
                        <div style={{ 
                          fontSize: '2rem', 
                          marginBottom: '0.75rem',
                          filter: `drop-shadow(0 0 8px ${info.color}60)`
                        }}>
                          {info.icon}
                        </div>
                        <div style={{ 
                          color: 'rgba(255, 255, 255, 0.7)', 
                          fontSize: '0.9rem',
                          marginBottom: '0.5rem',
                          fontWeight: '500'
                        }}>
                          {info.label}
                        </div>
                        <div style={{ 
                          color: info.color, 
                          fontWeight: 'bold',
                          fontSize: '1.3rem'
                        }}>
                          {info.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column Analysis Section */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '15px',
                  padding: '2rem',
                  marginBottom: '2rem',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}>
                    <h3 style={{ 
                      color: 'white', 
                      fontSize: '1.8rem',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      🔍 Análisis de Columnas
                    </h3>
                    <span style={{
                      background: 'rgba(59, 130, 246, 0.2)',
                      color: '#3b82f6',
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      border: '1px solid rgba(59, 130, 246, 0.3)'
                    }}>
                      {columns.length} columna{columns.length !== 1 ? 's' : ''} detectada{columns.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div style={{ 
                    overflowX: 'auto',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <table style={{ 
                      width: '100%', 
                      borderCollapse: 'collapse',
                      fontSize: '0.95rem'
                    }}>
                      <thead style={{ 
                        background: 'rgba(255, 255, 255, 0.15)',
                        position: 'sticky',
                        top: 0
                      }}>
                        <tr>
                          <th style={{ 
                            padding: '1rem', 
                            textAlign: 'left', 
                            color: 'white', 
                            fontWeight: 'bold',
                            borderBottom: '2px solid rgba(255, 255, 255, 0.2)',
                            fontSize: '1rem'
                          }}>
                            Columna
                          </th>
                          <th style={{ 
                            padding: '1rem', 
                            textAlign: 'left', 
                            color: 'white', 
                            fontWeight: 'bold',
                            borderBottom: '2px solid rgba(255, 255, 255, 0.2)',
                            fontSize: '1rem'
                          }}>
                            Tipo Detectado
                          </th>
                          <th style={{ 
                            padding: '1rem', 
                            textAlign: 'left', 
                            color: 'white', 
                            fontWeight: 'bold',
                            borderBottom: '2px solid rgba(255, 255, 255, 0.2)',
                            fontSize: '1rem'
                          }}>
                            Confianza
                          </th>
                          <th style={{ 
                            padding: '1rem', 
                            textAlign: 'left', 
                            color: 'white', 
                            fontWeight: 'bold',
                            borderBottom: '2px solid rgba(255, 255, 255, 0.2)',
                            fontSize: '1rem'
                          }}>
                            Muestra de Datos
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {columns.map((column, index) => {
                          const typeConfig = {
                            number: { icon: '🔢', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.2)' },
                            currency: { icon: '💰', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.2)' },
                            percentage: { icon: '📊', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.2)' },
                            date: { icon: '📅', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.2)' },
                            text: { icon: '📄', color: '#9ca3af', bg: 'rgba(156, 163, 175, 0.2)' }
                          }
                          const config = typeConfig[column.type] || typeConfig.text
                          
                          return (
                            <tr key={index} style={{
                              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                              transition: 'all 0.3s ease',
                              background: index % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = index % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent'
                            }}
                            >
                              <td style={{ 
                                padding: '1rem', 
                                color: 'white', 
                                fontWeight: 'bold',
                                fontSize: '1rem'
                              }}>
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem'
                                }}>
                                  <span style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: config.color,
                                    display: 'inline-block'
                                  }} />
                                  {column.name}
                                </div>
                              </td>
                              <td style={{ padding: '1rem' }}>
                                <span style={{
                                  padding: '0.4rem 0.8rem',
                                  borderRadius: '20px',
                                  fontSize: '0.85rem',
                                  fontWeight: 'bold',
                                  background: config.bg,
                                  color: config.color,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.4rem',
                                  border: `1px solid ${config.color}40`
                                }}>
                                  {config.icon} {column.type}
                                </span>
                              </td>
                              <td style={{ padding: '1rem' }}>
                                <div style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '0.5rem'
                                }}>
                                  <div style={{ 
                                    width: '100%', 
                                    background: 'rgba(255, 255, 255, 0.1)', 
                                    borderRadius: '10px',
                                    height: '12px',
                                    overflow: 'hidden',
                                    position: 'relative'
                                  }}>
                                    <div style={{
                                      width: `${column.confidence}%`,
                                      height: '100%',
                                      background: column.confidence >= 80 ? 
                                        'linear-gradient(90deg, #22c55e, #16a34a)' :
                                        column.confidence >= 60 ? 
                                        'linear-gradient(90deg, #f59e0b, #d97706)' : 
                                        'linear-gradient(90deg, #ef4444, #dc2626)',
                                      borderRadius: '10px',
                                      transition: 'width 0.8s ease-out',
                                      position: 'relative'
                                    }}>
                                      <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                                        animation: 'shimmer 2s infinite'
                                      }} />
                                    </div>
                                  </div>
                                  <span style={{ 
                                    color: column.confidence >= 80 ? '#22c55e' :
                                          column.confidence >= 60 ? '#f59e0b' : '#ef4444', 
                                    fontSize: '0.9rem',
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem'
                                  }}>
                                    {column.confidence >= 80 ? '🟢' :
                                    column.confidence >= 60 ? '🟡' : '🔴'} {column.confidence}%
                                  </span>
                                </div>
                              </td>
                              <td style={{ 
                                padding: '1rem', 
                                color: 'rgba(255, 255, 255, 0.8)',
                                maxWidth: '200px'
                              }}>
                                <div style={{
                                  display: 'flex',
                                  flexWrap: 'wrap',
                                  gap: '0.25rem'
                                }}>
                                  {(column.sample?.slice(0, 3) || []).map((sample, sampleIndex) => (
                                    <span key={sampleIndex} style={{
                                      background: 'rgba(255, 255, 255, 0.1)',
                                      padding: '0.2rem 0.5rem',
                                      borderRadius: '6px',
                                      fontSize: '0.8rem',
                                      border: '1px solid rgba(255, 255, 255, 0.2)',
                                      maxWidth: '80px',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap'
                                    }}>
                                      {sample?.toString() || 'N/A'}
                                    </span>
                                  ))}
                                  {(column.sample?.length || 0) > 3 && (
                                    <span style={{
                                      color: 'rgba(255, 255, 255, 0.6)',
                                      fontSize: '0.8rem'
                                    }}>
                                      +{(column.sample?.length || 0) - 3} más...
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Column Analysis Summary */}
                  <div style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                      gap: '1rem',
                      textAlign: 'center'
                    }}>
                      {[
                        { 
                          label: 'Números', 
                          count: columns.filter(c => c.type === 'number').length,
                          icon: '🔢',
                          color: '#3b82f6'
                        },
                        { 
                          label: 'Monedas', 
                          count: columns.filter(c => c.type === 'currency').length,
                          icon: '💰',
                          color: '#22c55e'
                        },
                        { 
                          label: 'Fechas', 
                          count: columns.filter(c => c.type === 'date').length,
                          icon: '📅',
                          color: '#f59e0b'
                        },
                        { 
                          label: 'Texto', 
                          count: columns.filter(c => c.type === 'text').length,
                          icon: '📄',
                          color: '#9ca3af'
                        }
                      ].map((stat, index) => (
                        <div key={index}>
                          <div style={{ 
                            fontSize: '1.5rem', 
                            marginBottom: '0.25rem',
                            filter: `drop-shadow(0 0 6px ${stat.color}50)`
                          }}>
                            {stat.icon}
                          </div>
                          <div style={{ 
                            color: stat.color, 
                            fontWeight: 'bold', 
                            fontSize: '1.2rem' 
                          }}>
                            {stat.count}
                          </div>
                          <div style={{ 
                            color: 'rgba(255, 255, 255, 0.7)', 
                            fontSize: '0.8rem' 
                          }}>
                            {stat.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
{/* Chart Suggestions Section */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '15px',
                  padding: '2rem',
                  marginBottom: '2rem',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '1.5rem',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}>
                    <h3 style={{ 
                      color: 'white', 
                      fontSize: '1.8rem',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      🤖 Sugerencias de Gráficas Inteligentes
                    </h3>
                    <span style={{
                      background: suggestions.length > 0 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(156, 163, 175, 0.2)',
                      color: suggestions.length > 0 ? '#22c55e' : '#9ca3af',
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      border: suggestions.length > 0 ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(156, 163, 175, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      {suggestions.length > 0 ? '✨' : '⚠️'} {suggestions.length} sugerencia{suggestions.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  {suggestions.length > 0 ? (
                    <>
                      {/* Instructions */}
                      <div style={{
                        background: 'rgba(59, 130, 246, 0.1)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        marginBottom: '2rem',
                        border: '1px solid rgba(59, 130, 246, 0.3)'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          marginBottom: '0.75rem'
                        }}>
                          <span style={{ fontSize: '1.5rem' }}>💡</span>
                          <h4 style={{ 
                            color: '#3b82f6', 
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            margin: 0
                          }}>
                            Basado en tus datos reales
                          </h4>
                        </div>
                        <p style={{ 
                          color: 'rgba(255, 255, 255, 0.9)', 
                          margin: 0,
                          fontSize: '1rem',
                          lineHeight: '1.5'
                        }}>
                          Hemos analizado tu archivo Excel y generado estas recomendaciones automáticas. 
                          <strong style={{ color: '#3b82f6' }}> Selecciona las gráficas que quieres generar</strong> haciendo clic en las tarjetas.
                        </p>
                      </div>

                      {/* Suggestions Grid */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                        gap: '1.5rem',
                        marginBottom: '2rem'
                      }}>
                        {suggestions.map((suggestion, index) => {
                          const isSelected = selectedSuggestions.includes(index)
                          const chartIcons = {
                            bar: '📊',
                            line: '📈', 
                            pie: '🥧',
                            scatter: '🎯',
                            area: '📉'
                          }
                          
                          return (
                            <div
                              key={index}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedSuggestions(selectedSuggestions.filter(i => i !== index))
                                } else {
                                  setSelectedSuggestions([...selectedSuggestions, index])
                                }
                              }}
                              style={{
                                background: isSelected 
                                  ? 'rgba(34, 197, 94, 0.15)' 
                                  : 'rgba(255, 255, 255, 0.08)',
                                border: isSelected
                                  ? '2px solid #22c55e'
                                  : '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '15px',
                                padding: '1.5rem',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                position: 'relative',
                                overflow: 'hidden'
                              }}
                              onMouseEnter={(e) => {
                                if (!isSelected) {
                                  e.currentTarget.style.transform = 'translateY(-3px)'
                                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'
                                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)'
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isSelected) {
                                  e.currentTarget.style.transform = 'translateY(0)'
                                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                                  e.currentTarget.style.boxShadow = 'none'
                                }
                              }}
                            >
                              {/* Selection Indicator */}
                              {isSelected && (
                                <div style={{
                                  position: 'absolute',
                                  top: '1rem',
                                  right: '1rem',
                                  background: '#22c55e',
                                  color: 'white',
                                  borderRadius: '50%',
                                  width: '32px',
                                  height: '32px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '1rem',
                                  fontWeight: 'bold',
                                  boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)',
                                  animation: 'bounce 0.6s ease-out'
                                }}>
                                  ✓
                                </div>
                              )}

                              {/* Chart Icon and Title */}
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                marginBottom: '1rem'
                              }}>
                                <span style={{ 
                                  fontSize: '2.5rem',
                                  filter: isSelected ? 'drop-shadow(0 0 10px #22c55e50)' : 'none'
                                }}>
                                  {chartIcons[suggestion.type] || '📊'}
                                </span>
                                <h4 style={{ 
                                  color: 'white', 
                                  fontSize: '1.3rem',
                                  fontWeight: 'bold',
                                  margin: 0,
                                  flex: 1
                                }}>
                                  {suggestion.title}
                                </h4>
                              </div>

                              {/* Description */}
                              <p style={{ 
                                color: 'rgba(255, 255, 255, 0.85)', 
                                fontSize: '0.95rem',
                                marginBottom: '1.25rem',
                                lineHeight: '1.5'
                              }}>
                                {suggestion.description}
                              </p>

                              {/* Chart Details Tags */}
                              <div style={{ 
                                display: 'flex', 
                                gap: '0.5rem',
                                flexWrap: 'wrap',
                                marginBottom: '1rem'
                              }}>
                                <span style={{
                                  background: 'rgba(59, 130, 246, 0.2)',
                                  color: '#3b82f6',
                                  padding: '0.4rem 0.8rem',
                                  borderRadius: '20px',
                                  fontSize: '0.8rem',
                                  fontWeight: 'bold',
                                  border: '1px solid rgba(59, 130, 246, 0.3)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.25rem'
                                }}>
                                  📐 X: {suggestion.xAxis}
                                </span>
                                <span style={{
                                  background: 'rgba(34, 197, 94, 0.2)',
                                  color: '#22c55e',
                                  padding: '0.4rem 0.8rem',
                                  borderRadius: '20px',
                                  fontSize: '0.8rem',
                                  fontWeight: 'bold',
                                  border: '1px solid rgba(34, 197, 94, 0.3)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.25rem'
                                }}>
                                  📊 Y: {suggestion.yAxis}
                                </span>
                                {suggestion.category && (
                                  <span style={{
                                    background: 'rgba(168, 85, 247, 0.2)',
                                    color: '#a855f7',
                                    padding: '0.4rem 0.8rem',
                                    borderRadius: '20px',
                                    fontSize: '0.8rem',
                                    fontWeight: 'bold',
                                    border: '1px solid rgba(168, 85, 247, 0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem'
                                  }}>
                                    🏷️ Cat: {suggestion.category}
                                  </span>
                                )}
                                <span style={{
                                  background: 'rgba(245, 158, 11, 0.2)',
                                  color: '#f59e0b',
                                  padding: '0.4rem 0.8rem',
                                  borderRadius: '20px',
                                  fontSize: '0.8rem',
                                  fontWeight: 'bold',
                                  border: '1px solid rgba(245, 158, 11, 0.3)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.25rem'
                                }}>
                                  📈 {suggestion.type.toUpperCase()}
                                </span>
                              </div>

                              {/* Confidence and Stats */}
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}>
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem'
                                }}>
                                  <span style={{
                                    color: suggestion.confidence >= 80 ? '#22c55e' :
                                          suggestion.confidence >= 60 ? '#f59e0b' : '#ef4444',
                                    fontSize: '1rem'
                                  }}>
                                    {suggestion.confidence >= 80 ? '🟢' :
                                    suggestion.confidence >= 60 ? '🟡' : '🔴'}
                                  </span>
                                  <span style={{ 
                                    fontSize: '0.9rem', 
                                    color: 'rgba(255, 255, 255, 0.8)',
                                    fontWeight: '500'
                                  }}>
                                    Confianza: <strong style={{ color: 'white' }}>{suggestion.confidence}%</strong>
                                  </span>
                                </div>
                                <span style={{
                                  fontSize: '0.85rem',
                                  color: 'rgba(255, 255, 255, 0.6)',
                                  background: 'rgba(255, 255, 255, 0.1)',
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '8px'
                                }}>
                                  #{index + 1}
                                </span>
                              </div>

                              {/* Hover Effect Overlay */}
                              {!isSelected && (
                                <div style={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
                                  opacity: 0,
                                  transition: 'opacity 0.3s ease',
                                  pointerEvents: 'none'
                                }} />
                              )}
                            </div>
                          )
                        })}
                      </div>
                      
                      {/* Generation Area */}
                      {selectedSuggestions.length > 0 ? (
                        <div style={{
                          background: 'rgba(34, 197, 94, 0.1)',
                          borderRadius: '15px',
                          padding: '2rem',
                          textAlign: 'center',
                          border: '2px solid rgba(34, 197, 94, 0.3)',
                          position: 'relative',
                          overflow: 'hidden'
                        }}>
                          {/* Animated Background */}
                          <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(45deg, transparent 30%, rgba(34, 197, 94, 0.05) 50%, transparent 70%)',
                            animation: 'shimmer 3s ease-in-out infinite'
                          }} />
                          
                          <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{
                              fontSize: '3rem',
                              marginBottom: '1rem',
                              animation: 'bounce 2s ease-in-out infinite'
                            }}>
                              🎉
                            </div>
                            <h4 style={{ 
                              color: 'white', 
                              marginBottom: '1rem',
                              fontSize: '1.5rem',
                              fontWeight: 'bold'
                            }}>
                              ¡Perfecto! {selectedSuggestions.length} gráfica{selectedSuggestions.length > 1 ? 's' : ''} seleccionada{selectedSuggestions.length > 1 ? 's' : ''}
                            </h4>
                            <p style={{
                              color: 'rgba(255, 255, 255, 0.9)',
                              marginBottom: '1.5rem',
                              fontSize: '1rem'
                            }}>
                              Listas para generar visualizaciones interactivas con tus datos reales
                            </p>
                            <button
                              onClick={() => {
                                const processed = selectedSuggestions.map(index => {
                                  const suggestion = suggestions[index]
                                  return {
                                    suggestion,
                                    data: processDataForChart(suggestion)
                                  }
                                })
                                setProcessedData(processed)
                                setViewMode('charts')
                              }}
                              style={{
                                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '1.2rem 2.5rem',
                                borderRadius: '15px',
                                fontSize: '1.2rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 8px 25px rgba(34, 197, 94, 0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                margin: '0 auto'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'
                                e.currentTarget.style.boxShadow = '0 12px 35px rgba(34, 197, 94, 0.4)'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0) scale(1)'
                                e.currentTarget.style.boxShadow = '0 8px 25px rgba(34, 197, 94, 0.3)'
                              }}
                            >
                              <span style={{ fontSize: '1.3rem' }}>🚀</span>
                              Generar {selectedSuggestions.length} Gráfica{selectedSuggestions.length > 1 ? 's' : ''}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{
                          background: 'rgba(59, 130, 246, 0.1)',
                          borderRadius: '15px',
                          padding: '2rem',
                          textAlign: 'center',
                          border: '1px solid rgba(59, 130, 246, 0.3)'
                        }}>
                          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>👆</div>
                          <h4 style={{ 
                            color: '#3b82f6', 
                            marginBottom: '0.5rem',
                            fontSize: '1.2rem'
                          }}>
                            Selecciona las gráficas que quieres generar
                          </h4>
                          <p style={{ 
                            color: 'rgba(255, 255, 255, 0.8)', 
                            fontSize: '0.95rem' 
                          }}>
                            Haz clic en las tarjetas de arriba para seleccionar las visualizaciones
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    /* No Suggestions State */
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '3rem',
                      background: 'rgba(245, 158, 11, 0.1)',
                      borderRadius: '15px',
                      border: '1px solid rgba(245, 158, 11, 0.3)'
                    }}>
                      <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🤔</div>
                      <h4 style={{ 
                        color: '#f59e0b', 
                        marginBottom: '1rem',
                        fontSize: '1.5rem',
                        fontWeight: 'bold'
                      }}>
                        No se pudieron generar sugerencias automáticas
                      </h4>
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        marginTop: '1.5rem',
                        textAlign: 'left'
                      }}>
                        <h5 style={{ 
                          color: 'white', 
                          marginBottom: '1rem',
                          fontSize: '1.1rem'
                        }}>
                          💡 Para generar gráficas, asegúrate de que tu archivo tenga:
                        </h5>
                        <ul style={{ 
                          color: 'rgba(255, 255, 255, 0.8)', 
                          fontSize: '0.95rem',
                          lineHeight: '1.6',
                          paddingLeft: '1.5rem'
                        }}>
                          <li>Al menos una columna numérica (números, monedas, porcentajes)</li>
                          <li>Datos limpios sin demasiados valores vacíos</li>
                          <li>Headers claros en la primera fila</li>
                          <li>Formato consistente en las columnas</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                {/* Data Preview Section */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '15px',
                  padding: '2rem',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '1.5rem',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}>
                    <h3 style={{ 
                      color: 'white', 
                      fontSize: '1.8rem',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      👁️ Vista Previa de Datos Reales
                    </h3>
                    <span style={{
                      background: 'rgba(245, 158, 11, 0.2)',
                      color: '#f59e0b',
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      📊 Mostrando {Math.min(10, rawData.length)} de {rawData.length.toLocaleString()} filas
                    </span>
                  </div>
                  
                  {/* Data Table */}
                  <div style={{ 
                    overflowX: 'auto', 
                    overflowY: 'auto',
                    maxHeight: '500px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    position: 'relative'
                  }}>
                    <table style={{ 
                      width: '100%', 
                      borderCollapse: 'collapse',
                      fontSize: '0.9rem'
                    }}>
                      <thead style={{ 
                        position: 'sticky', 
                        top: 0, 
                        background: 'rgba(255, 255, 255, 0.2)',
                        zIndex: 2
                      }}>
                        <tr>
                          <th style={{ 
                            padding: '1rem', 
                            textAlign: 'center', 
                            color: 'white', 
                            fontWeight: 'bold',
                            borderBottom: '2px solid rgba(255, 255, 255, 0.3)',
                            background: 'rgba(156, 163, 175, 0.2)',
                            minWidth: '60px'
                          }}>
                            #️⃣
                          </th>
                          {columns.map((column, index) => {
                            const typeConfig = {
                              number: { icon: '🔢', color: '#3b82f6' },
                              currency: { icon: '💰', color: '#22c55e' },
                              percentage: { icon: '📊', color: '#a855f7' },
                              date: { icon: '📅', color: '#f59e0b' },
                              text: { icon: '📄', color: '#9ca3af' }
                            }
                            const config = typeConfig[column.type] || typeConfig.text
                            
                            return (
                              <th key={index} style={{ 
                                padding: '1rem', 
                                textAlign: 'left', 
                                color: 'white', 
                                fontWeight: 'bold',
                                borderBottom: '2px solid rgba(255, 255, 255, 0.3)',
                                minWidth: '150px',
                                background: `${config.color}20`
                              }}>
                                <div style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '0.5rem',
                                  flexDirection: 'column',
                                  textAlign: 'center'
                                }}>
                                  <span style={{
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '8px',
                                    fontSize: '0.75rem',
                                    background: `${config.color}30`,
                                    color: config.color,
                                    border: `1px solid ${config.color}40`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem'
                                  }}>
                                    {config.icon} {column.type}
                                  </span>
                                  <span style={{ fontSize: '0.9rem' }}>
                                    {column.name}
                                  </span>
                                </div>
                              </th>
                            )
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {rawData.slice(0, 10).map((row, rowIndex) => (
                          <tr key={rowIndex} style={{
                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                            background: rowIndex % 2 === 0 ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                            e.currentTarget.style.transform = 'scale(1.01)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = rowIndex % 2 === 0 ? 'rgba(255, 255, 255, 0.03)' : 'transparent'
                            e.currentTarget.style.transform = 'scale(1)'
                          }}
                          >
                            <td style={{ 
                              padding: '1rem', 
                              color: 'rgba(255, 255, 255, 0.6)',
                              fontWeight: 'bold',
                              textAlign: 'center',
                              background: 'rgba(156, 163, 175, 0.1)'
                            }}>
                              {rowIndex + 1}
                            </td>
                            {columns.map((column, colIndex) => {
                              const value = row[column.name]
                              const isEmpty = value === null || value === undefined || value === ''
                              
                              let displayValue
                              if (isEmpty) {
                                displayValue = (
                                  <span style={{ 
                                    color: 'rgba(255, 255, 255, 0.4)', 
                                    fontStyle: 'italic',
                                    background: 'rgba(156, 163, 175, 0.2)',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '6px',
                                    fontSize: '0.8rem'
                                  }}>
                                    vacío
                                  </span>
                                )
                              } else {
                                const strValue = value.toString()
                                displayValue = strValue.length > 40 ? 
                                  strValue.substring(0, 40) + '...' : 
                                  strValue
                              }
                              
                              return (
                                <td key={colIndex} style={{ 
                                  padding: '1rem', 
                                  color: isEmpty ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.9)',
                                  textAlign: column.type === 'number' || column.type === 'currency' || column.type === 'percentage' ? 'right' : 'left',
                                  fontFamily: column.type === 'number' || column.type === 'currency' || column.type === 'percentage' ? 'monospace' : 'inherit',
                                  fontWeight: column.type === 'number' || column.type === 'currency' || column.type === 'percentage' ? 'bold' : 'normal',
                                  maxWidth: '200px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                                title={isEmpty ? 'Valor vacío' : value?.toString()}
                                >
                                  {displayValue}
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Data Summary Stats */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '1.5rem',
                    marginTop: '2rem'
                  }}>
                    {[
                      { 
                        label: 'Total de Filas', 
                        value: rawData.length.toLocaleString(), 
                        icon: '📊', 
                        color: '#3b82f6',
                        desc: 'Registros en el archivo'
                      },
                      { 
                        label: 'Columnas Analizadas', 
                        value: columns.length.toString(), 
                        icon: '📋', 
                        color: '#22c55e',
                        desc: 'Campos detectados'
                      },
                      { 
                        label: 'Confianza Promedio', 
                        value: columns.length > 0 ? `${Math.round(columns.reduce((acc, col) => acc + col.confidence, 0) / columns.length)}%` : '0%', 
                        icon: '🎯', 
                        color: '#f59e0b',
                        desc: 'Precisión de detección'
                      },
                      { 
                        label: 'Sugerencias Generadas', 
                        value: suggestions.length.toString(), 
                        icon: '💡', 
                        color: '#a855f7',
                        desc: 'Gráficas recomendadas'
                      },
                      {
                        label: 'Columnas Numéricas',
                        value: columns.filter(c => c.type === 'number' || c.type === 'currency' || c.type === 'percentage').length.toString(),
                        icon: '🔢',
                        color: '#06b6d4',
                        desc: 'Aptas para gráficas'
                      },
                      {
                        label: 'Datos Procesados',
                        value: file ? `${(file.size / 1024).toFixed(1)} KB` : '0 KB',
                        icon: '⚡',
                        color: '#84cc16',
                        desc: 'Tamaño del archivo'
                      }
                    ].map((stat, index) => (
                      <div key={index} style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        textAlign: 'center',
                        border: `1px solid ${stat.color}30`,
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-3px)'
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'
                        e.currentTarget.style.boxShadow = `0 8px 25px ${stat.color}30`
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                      >
                        {/* Background Effect */}
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: `linear-gradient(135deg, ${stat.color}10 0%, transparent 50%)`,
                          opacity: 0.5
                        }} />
                        
                        <div style={{ position: 'relative', zIndex: 1 }}>
                          <div style={{ 
                            fontSize: '2.5rem', 
                            marginBottom: '0.75rem',
                            filter: `drop-shadow(0 0 8px ${stat.color}60)`
                          }}>
                            {stat.icon}
                          </div>
                          <div style={{ 
                            color: 'rgba(255, 255, 255, 0.7)', 
                            fontSize: '0.9rem',
                            marginBottom: '0.5rem',
                            fontWeight: '500'
                          }}>
                            {stat.label}
                          </div>
                          <div style={{ 
                            color: stat.color, 
                            fontWeight: 'bold',
                            fontSize: '1.8rem',
                            marginBottom: '0.25rem'
                          }}>
                            {stat.value}
                          </div>
                          <div style={{
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontSize: '0.8rem',
                            fontStyle: 'italic'
                          }}>
                            {stat.desc}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Additional Data Insights */}
                  {rawData.length > 10 && (
                    <div style={{
                      background: 'rgba(59, 130, 246, 0.1)',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      marginTop: '2rem',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem',
                        marginBottom: '0.75rem'
                      }}>
                        <span style={{ fontSize: '1.5rem' }}>ℹ️</span>
                        <h4 style={{ 
                          color: '#3b82f6', 
                          fontSize: '1.2rem',
                          fontWeight: 'bold',
                          margin: 0
                        }}>
                          Vista Previa Limitada
                        </h4>
                      </div>
                      <p style={{ 
                        color: 'rgba(255, 255, 255, 0.9)', 
                        margin: 0,
                        fontSize: '0.95rem',
                        lineHeight: '1.5'
                      }}>
                        Se muestran las primeras 10 filas para optimizar el rendimiento. 
                        <strong style={{ color: '#3b82f6' }}> Todas las {rawData.length.toLocaleString()} filas</strong> se 
                        utilizan para generar las gráficas y análisis.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
{/* Content based on view mode - CHARTS VIEW */}
        {viewMode === 'charts' && (
          <div>
            {processedData.length > 0 ? (
              <div>
                {/* Charts Header */}
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '1rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '20px',
                    padding: '1rem 2rem',
                    marginBottom: '1.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    <span style={{ fontSize: '2.5rem' }}>🎉</span>
                    <div>
                      <h2 style={{ 
                        color: 'white', 
                        fontSize: '2.5rem', 
                        marginBottom: '0.25rem',
                        fontWeight: 'bold',
                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                      }}>
                        Gráficas Generadas
                      </h2>
                      <p style={{ 
                        color: 'rgba(255, 255, 255, 0.8)', 
                        fontSize: '1.1rem',
                        margin: 0
                      }}>
                        {processedData.length} visualización{processedData.length > 1 ? 'es' : ''} basada{processedData.length > 1 ? 's' : ''} en tus datos reales
                      </p>
                    </div>
                  </div>

                  {/* Charts Statistics */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '1rem',
                    maxWidth: '800px',
                    margin: '0 auto 2rem auto'
                  }}>
                    {[
                      { 
                        label: 'Gráficas', 
                        value: processedData.length.toString(), 
                        icon: '📊', 
                        color: '#3b82f6' 
                      },
                      { 
                        label: 'Datos Procesados', 
                        value: processedData.reduce((acc, item) => acc + item.data.length, 0).toLocaleString(), 
                        icon: '📈', 
                        color: '#22c55e' 
                      },
                      { 
                        label: 'Confianza Promedio', 
                        value: `${Math.round(processedData.reduce((acc, item) => acc + item.suggestion.confidence, 0) / processedData.length)}%`, 
                        icon: '🎯', 
                        color: '#f59e0b' 
                      },
                      { 
                        label: 'Tipos Únicos', 
                        value: new Set(processedData.map(item => item.suggestion.type)).size.toString(), 
                        icon: '🎨', 
                        color: '#a855f7' 
                      }
                    ].map((stat, index) => (
                      <div key={index} style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        padding: '1rem',
                        textAlign: 'center',
                        border: `1px solid ${stat.color}30`
                      }}>
                        <div style={{ 
                          fontSize: '1.5rem', 
                          marginBottom: '0.5rem',
                          filter: `drop-shadow(0 0 6px ${stat.color}50)`
                        }}>
                          {stat.icon}
                        </div>
                        <div style={{ 
                          color: stat.color, 
                          fontWeight: 'bold', 
                          fontSize: '1.3rem',
                          marginBottom: '0.25rem'
                        }}>
                          {stat.value}
                        </div>
                        <div style={{ 
                          color: 'rgba(255, 255, 255, 0.7)', 
                          fontSize: '0.8rem' 
                        }}>
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Interactive Tip */}
                  <div style={{ 
                    background: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: '15px',
                    padding: '1.5rem',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    display: 'inline-block',
                    maxWidth: '600px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.75rem',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{ fontSize: '1.5rem' }}>💡</span>
                      <h4 style={{ 
                        color: '#3b82f6', 
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        margin: 0
                      }}>
                        Gráficas Interactivas
                      </h4>
                    </div>
                    <p style={{ 
                      color: 'rgba(255, 255, 255, 0.9)', 
                      margin: 0,
                      fontSize: '0.95rem' 
                    }}>
                      Haz <strong style={{ color: '#3b82f6' }}>hover</strong> sobre las gráficas para ver detalles, 
                      <strong style={{ color: '#3b82f6' }}> zoom</strong> para explorar datos y 
                      <strong style={{ color: '#3b82f6' }}> click</strong> en las leyendas para filtrar series
                    </p>
                  </div>
                </div>

                {/* Charts Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))',
                  gap: '2.5rem'
                }}>
                  {processedData.map((item, index) => {
                    const chartIcons = {
                      bar: '📊',
                      line: '📈', 
                      pie: '🥧',
                      scatter: '🎯',
                      area: '📉'
                    }
                    
                    // Calculate stats for numeric data
                    const isNumericData = item.data.length > 0 && typeof item.data[0][item.suggestion.yAxis] === 'number'
                    let stats = null
                    if (isNumericData) {
                      const values = item.data.map(d => d[item.suggestion.yAxis]).filter(v => typeof v === 'number')
                      stats = {
                        max: Math.max(...values),
                        min: Math.min(...values),
                        avg: Math.round(values.reduce((acc, v) => acc + v, 0) / values.length),
                        total: values.reduce((acc, v) => acc + v, 0)
                      }
                    }

                    return (
                      <div key={index} style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '20px',
                        padding: '2rem',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-5px)'
                        e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.2)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                      >
                        {/* Chart Number Badge */}
                        <div style={{
                          position: 'absolute',
                          top: '1.5rem',
                          right: '1.5rem',
                          background: 'rgba(59, 130, 246, 0.2)',
                          color: '#3b82f6',
                          borderRadius: '50%',
                          width: '40px',
                          height: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.1rem',
                          fontWeight: 'bold',
                          border: '2px solid rgba(59, 130, 246, 0.4)'
                        }}>
                          #{index + 1}
                        </div>

                        {/* Chart Header */}
                        <div style={{ marginBottom: '1.5rem', paddingRight: '3rem' }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            marginBottom: '0.75rem'
                          }}>
                            <span style={{ 
                              fontSize: '2.5rem',
                              filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.3))'
                            }}>
                              {chartIcons[item.suggestion.type] || '📊'}
                            </span>
                            <h3 style={{ 
                              color: 'white', 
                              fontSize: '1.5rem', 
                              margin: 0,
                              fontWeight: 'bold',
                              flex: 1
                            }}>
                              {item.suggestion.title}
                            </h3>
                          </div>
                          
                          <p style={{ 
                            color: 'rgba(255, 255, 255, 0.85)', 
                            fontSize: '1rem',
                            marginBottom: '1rem',
                            lineHeight: '1.5'
                          }}>
                            {item.suggestion.description}
                          </p>
                        </div>

                        {/* Chart Technical Details */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                          gap: '0.75rem',
                          marginBottom: '1.5rem'
                        }}>
                          <div style={{
                            background: 'rgba(59, 130, 246, 0.2)',
                            color: '#3b82f6',
                            padding: '0.5rem',
                            borderRadius: '10px',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            textAlign: 'center'
                          }}>
                            <div style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>📐</div>
                            <div>Eje X</div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>{item.suggestion.xAxis}</div>
                          </div>
                          <div style={{
                            background: 'rgba(34, 197, 94, 0.2)',
                            color: '#22c55e',
                            padding: '0.5rem',
                            borderRadius: '10px',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                            textAlign: 'center'
                          }}>
                            <div style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>📊</div>
                            <div>Eje Y</div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>{item.suggestion.yAxis}</div>
                          </div>
                          {item.suggestion.category && (
                            <div style={{
                              background: 'rgba(168, 85, 247, 0.2)',
                              color: '#a855f7',
                              padding: '0.5rem',
                              borderRadius: '10px',
                              fontSize: '0.85rem',
                              fontWeight: 'bold',
                              border: '1px solid rgba(168, 85, 247, 0.3)',
                              textAlign: 'center'
                            }}>
                              <div style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>🏷️</div>
                              <div>Categoría</div>
                              <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>{item.suggestion.category}</div>
                            </div>
                          )}
                          <div style={{
                            background: 'rgba(245, 158, 11, 0.2)',
                            color: '#f59e0b',
                            padding: '0.5rem',
                            borderRadius: '10px',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                            textAlign: 'center'
                          }}>
                            <div style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>🎨</div>
                            <div>Tipo</div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>{item.suggestion.type.toUpperCase()}</div>
                          </div>
                        </div>

                        {/* Chart Statistics */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                          gap: '1rem',
                          marginBottom: '1.5rem',
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '12px',
                          padding: '1rem',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ 
                              color: '#3b82f6', 
                              fontWeight: 'bold', 
                              fontSize: '1.2rem' 
                            }}>
                              {item.suggestion.confidence}%
                            </div>
                            <div style={{ 
                              color: 'rgba(255, 255, 255, 0.7)', 
                              fontSize: '0.8rem' 
                            }}>
                              Confianza
                            </div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ 
                              color: '#22c55e', 
                              fontWeight: 'bold', 
                              fontSize: '1.2rem' 
                            }}>
                              {item.data.length}
                            </div>
                            <div style={{ 
                              color: 'rgba(255, 255, 255, 0.7)', 
                              fontSize: '0.8rem' 
                            }}>
                              Puntos
                            </div>
                          </div>
                          {stats && (
                            <>
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ 
                                  color: '#f59e0b', 
                                  fontWeight: 'bold', 
                                  fontSize: '1.2rem' 
                                }}>
                                  {stats.max.toLocaleString()}
                                </div>
                                <div style={{ 
                                  color: 'rgba(255, 255, 255, 0.7)', 
                                  fontSize: '0.8rem' 
                                }}>
                                  Máximo
                                </div>
                              </div>
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ 
                                  color: '#a855f7', 
                                  fontWeight: 'bold', 
                                  fontSize: '1.2rem' 
                                }}>
                                  {stats.min.toLocaleString()}
                                </div>
                                <div style={{ 
                                  color: 'rgba(255, 255, 255, 0.7)', 
                                  fontSize: '0.8rem' 
                                }}>
                                  Mínimo
                                </div>
                              </div>
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ 
                                  color: '#06b6d4', 
                                  fontWeight: 'bold', 
                                  fontSize: '1.2rem' 
                                }}>
                                  {stats.avg.toLocaleString()}
                                </div>
                                <div style={{ 
                                  color: 'rgba(255, 255, 255, 0.7)', 
                                  fontSize: '0.8rem' 
                                }}>
                                  Promedio
                                </div>
                              </div>
                              {item.suggestion.type !== 'pie' && (
                                <div style={{ textAlign: 'center' }}>
                                  <div style={{ 
                                    color: '#84cc16', 
                                    fontWeight: 'bold', 
                                    fontSize: '1.2rem' 
                                  }}>
                                    {stats.total.toLocaleString()}
                                  </div>
                                  <div style={{ 
                                    color: 'rgba(255, 255, 255, 0.7)', 
                                    fontSize: '0.8rem' 
                                  }}>
                                    Total
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>

                        {/* Chart Container */}
                        <div style={{
                          background: 'rgba(255, 255, 255, 0.08)',
                          borderRadius: '15px',
                          padding: '1.5rem',
                          height: '450px',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          position: 'relative'
                        }}>
                          {item.data.length > 0 ? (
                            renderChart(item.suggestion, item.data)
                          ) : (
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              height: '100%',
                              color: 'rgba(255, 255, 255, 0.6)'
                            }}>
                              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
                              <h4 style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '0.5rem' }}>
                                No hay datos para mostrar
                              </h4>
                              <p style={{ fontSize: '0.9rem', textAlign: 'center' }}>
                                Los datos filtrados no contienen información suficiente para esta visualización
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Chart Actions */}
                        <div style={{
                          marginTop: '1rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '0.5rem'
                        }}>
                          <div style={{ 
                            fontSize: '0.85rem', 
                            color: 'rgba(255, 255, 255, 0.6)' 
                          }}>
                            Generado a las {new Date().toLocaleTimeString()}
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button style={{
                              background: 'rgba(59, 130, 246, 0.2)',
                              color: '#3b82f6',
                              border: '1px solid rgba(59, 130, 246, 0.4)',
                              padding: '0.5rem 1rem',
                              borderRadius: '8px',
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(59, 130, 246, 0.3)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'
                            }}
                            >
                              📤 Exportar
                            </button>
                            <button style={{
                              background: 'rgba(34, 197, 94, 0.2)',
                              color: '#22c55e',
                              border: '1px solid rgba(34, 197, 94, 0.4)',
                              padding: '0.5rem 1rem',
                              borderRadius: '8px',
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(34, 197, 94, 0.3)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(34, 197, 94, 0.2)'
                            }}
                            >
                              🔍 Detalles
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Action Buttons */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '1.5rem',
                  marginTop: '4rem',
                  flexWrap: 'wrap'
                }}>
                  <button
                    onClick={() => setViewMode('analysis')}
                    style={{
                      background: 'rgba(59, 130, 246, 0.2)',
                      color: '#3b82f6',
                      border: '2px solid rgba(59, 130, 246, 0.4)',
                      padding: '1.2rem 2.5rem',
                      borderRadius: '15px',
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)'
                      e.currentTarget.style.background = 'rgba(59, 130, 246, 0.3)'
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.3)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <span style={{ fontSize: '1.3rem' }}>🔙</span>
                    Volver al Análisis
                  </button>
                  
                  <button
                    onClick={() => {
                      setViewMode('upload')
                      setFile(null)
                      setRawData([])
                      setColumns([])
                      setSuggestions([])
                      setSelectedSuggestions([])
                      setProcessedData([])
                      setIsAnalyzing(false)
                    }}
                    style={{
                      background: 'rgba(34, 197, 94, 0.2)',
                      color: '#22c55e',
                      border: '2px solid rgba(34, 197, 94, 0.4)',
                      padding: '1.2rem 2.5rem',
                      borderRadius: '15px',
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)'
                      e.currentTarget.style.background = 'rgba(34, 197, 94, 0.3)'
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(34, 197, 94, 0.3)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.background = 'rgba(34, 197, 94, 0.2)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <span style={{ fontSize: '1.3rem' }}>📂</span>
                    Nuevo Análisis
                  </button>
                  
                  <button
                    onClick={() => setViewMode('analysis')}
                    style={{
                      background: 'rgba(168, 85, 247, 0.2)',
                      color: '#a855f7',
                      border: '2px solid rgba(168, 85, 247, 0.4)',
                      padding: '1.2rem 2.5rem',
                      borderRadius: '15px',
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)'
                      e.currentTarget.style.background = 'rgba(168, 85, 247, 0.3)'
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(168, 85, 247, 0.3)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.background = 'rgba(168, 85, 247, 0.2)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <span style={{ fontSize: '1.3rem' }}>➕</span>
                    Agregar Más Gráficas
                  </button>
                </div>
              </div>
            ) : (
              /* No Charts State */
              <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '20px',
                  padding: '3rem',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  maxWidth: '600px',
                  margin: '0 auto'
                }}>
                  <div style={{ 
                    fontSize: '5rem', 
                    marginBottom: '1.5rem',
                    filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.3))'
                  }}>
                    📊
                  </div>
                  <h3 style={{ 
                    color: 'white', 
                    marginBottom: '1rem',
                    fontSize: '2rem',
                    fontWeight: 'bold'
                  }}>
                    No hay gráficas generadas aún
                  </h3>
                  <p style={{ 
                    color: 'rgba(255, 255, 255, 0.8)', 
                    marginBottom: '2.5rem',
                    fontSize: '1.1rem',
                    lineHeight: '1.6'
                  }}>
                    Ve al análisis y selecciona algunas sugerencias para generar visualizaciones interactivas con tus datos reales
                  </p>
                  
                  <div style={{ 
                    display: 'flex', 
                    gap: '1.5rem', 
                    justifyContent: 'center', 
                    flexWrap: 'wrap' 
                  }}>
                    <button
                      onClick={() => setViewMode('analysis')}
                      style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '1.2rem 2.5rem',
                        borderRadius: '15px',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'
                        e.currentTarget.style.boxShadow = '0 12px 35px rgba(59, 130, 246, 0.4)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)'
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.3)'
                      }}
                    >
                      <span style={{ fontSize: '1.3rem' }}>🔍</span>
                      Ir al Análisis
                    </button>
                    
                    <button
                      onClick={() => setViewMode('upload')}
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        padding: '1.2rem 2.5rem',
                        borderRadius: '15px',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-3px)'
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 255, 255, 0.2)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      <span style={{ fontSize: '1.3rem' }}>📂</span>
                      Subir Archivo
                    </button>
                  </div>

                  {/* Quick Start Guide */}
                  <div style={{
                    background: 'rgba(34, 197, 94, 0.1)',
                    borderRadius: '15px',
                    padding: '2rem',
                    marginTop: '2.5rem',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    textAlign: 'left'
                  }}>
                    <h4 style={{
                      color: '#22c55e',
                      fontSize: '1.2rem',
                      marginBottom: '1rem',
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}>
                      <span style={{ fontSize: '1.5rem' }}>🚀</span>
                      Guía Rápida
                    </h4>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '1rem'
                    }}>
                      {[
                        { step: '1', icon: '📂', title: 'Sube tu Excel', desc: 'Archivo .xlsx, .xls o .csv' },
                        { step: '2', icon: '🔍', title: 'Revisa el análisis', desc: 'Tipos de datos detectados' },
                        { step: '3', icon: '✅', title: 'Selecciona gráficas', desc: 'Elige las sugerencias' },
                        { step: '4', icon: '📊', title: 'Visualiza resultados', desc: 'Gráficas interactivas' }
                      ].map((item, index) => (
                        <div key={index} style={{
                          textAlign: 'center',
                          padding: '1rem'
                        }}>
                          <div style={{
                            background: 'rgba(34, 197, 94, 0.2)',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 0.75rem auto',
                            color: '#22c55e',
                            fontWeight: 'bold',
                            border: '2px solid rgba(34, 197, 94, 0.4)'
                          }}>
                            {item.step}
                          </div>
                          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                            {item.icon}
                          </div>
                          <h5 style={{
                            color: 'white',
                            fontSize: '0.9rem',
                            marginBottom: '0.25rem',
                            fontWeight: 'bold'
                          }}>
                            {item.title}
                          </h5>
                          <p style={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: '0.8rem',
                            margin: 0
                          }}>
                            {item.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        </div>

      {/* Global Styles */}
      <style>{`
        /* Core Animations */
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        
        @keyframes fadeIn {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes slideIn {
          from { 
            transform: translateX(-100%); 
            opacity: 0;
          }
          to { 
            transform: translateX(0); 
            opacity: 1;
          }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { 
            transform: translateY(0); 
          }
          40% { 
            transform: translateY(-10px); 
          }
          60% { 
            transform: translateY(-5px); 
          }
        }
        
        @keyframes glow {
          0%, 100% { 
            box-shadow: 0 0 5px rgba(255, 255, 255, 0.2); 
          }
          50% { 
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.4), 0 0 30px rgba(255, 255, 255, 0.2); 
          }
        }
        
        @keyframes shimmer {
          0% { 
            transform: translateX(-100%); 
          }
          50% { 
            transform: translateX(100%); 
          }
          100% { 
            transform: translateX(100%); 
          }
        }
        
        @keyframes loadingDots {
          0%, 80%, 100% { 
            opacity: 0; 
            transform: scale(0.8);
          }
          40% { 
            opacity: 1; 
            transform: scale(1.2);
          }
        }
        
        @keyframes rotateIn {
          from { 
            transform: rotate(-180deg) scale(0.5); 
            opacity: 0;
          }
          to { 
            transform: rotate(0deg) scale(1); 
            opacity: 1;
          }
        }
        
        @keyframes zoomIn {
          from { 
            transform: scale(0.3); 
            opacity: 0;
          }
          to { 
            transform: scale(1); 
            opacity: 1;
          }
        }
        
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px); 
          }
          50% { 
            transform: translateY(-10px); 
          }
        }

        /* Enhanced Loading Dots */
        .loading-dot {
          animation: loadingDots 1.4s infinite ease-in-out both;
        }
        .loading-dot:nth-child(1) { animation-delay: -0.32s; }
        .loading-dot:nth-child(2) { animation-delay: -0.16s; }
        .loading-dot:nth-child(3) { animation-delay: 0s; }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .chart-grid { 
            grid-template-columns: repeat(auto-fit, minmax(500px, 1fr)) !important; 
          }
        }
        
        @media (max-width: 768px) {
          .grid-cols-responsive { 
            grid-template-columns: 1fr !important; 
          }
          .text-responsive { 
            font-size: 2rem !important; 
          }
          .padding-responsive { 
            padding: 1rem !important; 
          }
          .chart-grid { 
            grid-template-columns: 1fr !important; 
          }
          .chart-container {
            height: 350px !important;
          }
          .suggestion-grid {
            grid-template-columns: 1fr !important;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        
        @media (max-width: 480px) {
          .text-responsive { 
            font-size: 1.5rem !important; 
          }
          .padding-responsive { 
            padding: 0.5rem !important; 
          }
          .chart-container {
            height: 300px !important;
          }
          .stats-grid {
            grid-template-columns: 1fr !important;
          }
          .action-buttons {
            flex-direction: column !important;
            width: 100% !important;
          }
          .action-buttons button {
            width: 100% !important;
          }
        }

        /* Accessibility Enhancements */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
        
        @media (prefers-contrast: high) {
          * {
            border-color: white !important;
            color: white !important;
          }
          .chart-container {
            border: 2px solid white !important;
          }
        }

        @media (prefers-color-scheme: dark) {
          /* Already optimized for dark mode */
        }

        /* Focus Management for Accessibility */
        button:focus, 
        input:focus, 
        [tabindex]:focus {
          outline: 3px solid #3b82f6 !important;
          outline-offset: 2px !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3) !important;
        }

        /* Keyboard Navigation */
        .suggestion-card:focus,
        .chart-card:focus {
          outline: 2px solid #22c55e !important;
          outline-offset: 2px !important;
        }

        /* Custom Scrollbars */
        ::-webkit-scrollbar {
          width: 12px;
          height: 12px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          border: 2px solid rgba(255, 255, 255, 0.1);
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }

        ::-webkit-scrollbar-corner {
          background: rgba(255, 255, 255, 0.1);
        }

        /* Firefox Scrollbar */
        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1);
        }

        /* Print Styles */
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          nav {
            display: none !important;
          }
          .chart-container {
            background: white !important;
            border: 1px solid black !important;
          }
          button {
            display: none !important;
          }
          .no-print {
            display: none !important;
          }
        }

        /* Selection Styles */
        ::selection {
          background: rgba(59, 130, 246, 0.3);
          color: white;
        }

        ::-moz-selection {
          background: rgba(59, 130, 246, 0.3);
          color: white;
        }

        /* Recharts Custom Styling */
        .recharts-default-tooltip {
          background: rgba(0, 0, 0, 0.9) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          border-radius: 12px !important;
          color: white !important;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
          backdrop-filter: blur(10px) !important;
        }

        .recharts-tooltip-label {
          color: #3b82f6 !important;
          font-weight: bold !important;
          margin-bottom: 0.5rem !important;
        }

        .recharts-tooltip-item {
          color: white !important;
          font-weight: 500 !important;
        }

        .recharts-legend-wrapper {
          padding-top: 1rem !important;
        }

        .recharts-legend-item {
          margin-right: 1rem !important;
        }

        /* Table Hover Effects */
        tbody tr:hover {
          background: rgba(255, 255, 255, 0.08) !important;
          transform: scale(1.01) !important;
          transition: all 0.2s ease !important;
        }

        /* Loading Animation Improvements */
        .pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .float-animation {
          animation: float 3s ease-in-out infinite;
        }

        /* Gradient Text Effects */
        .gradient-text {
          background: linear-gradient(135deg, #3b82f6, #22c55e, #a855f7);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradientShift 3s ease infinite;
        }

        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        /* Advanced Card Effects */
        .card-glow:hover {
          box-shadow: 
            0 0 20px rgba(59, 130, 246, 0.3),
            0 0 40px rgba(59, 130, 246, 0.1),
            0 8px 32px rgba(0, 0, 0, 0.3) !important;
        }

        /* Backdrop Blur Support */
        @supports (backdrop-filter: blur(10px)) {
          .glass-effect {
            backdrop-filter: blur(15px) !important;
            -webkit-backdrop-filter: blur(15px) !important;
          }
        }

        /* High DPI Display Optimizations */
        @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
          .chart-container {
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          }
        }

        /* Touch Device Optimizations */
        @media (hover: none) and (pointer: coarse) {
          button {
            min-height: 44px !important;
            min-width: 44px !important;
          }
          
          .suggestion-card {
            padding: 1.5rem !important;
          }
          
          .chart-container {
            touch-action: pan-x pan-y !important;
          }
        }

        /* Error State Styles */
        .error-state {
          color: #ef4444 !important;
          background: rgba(239, 68, 68, 0.1) !important;
          border: 1px solid rgba(239, 68, 68, 0.3) !important;
        }

        /* Success State Styles */
        .success-state {
          color: #22c55e !important;
          background: rgba(34, 197, 94, 0.1) !important;
          border: 1px solid rgba(34, 197, 94, 0.3) !important;
        }

        /* Warning State Styles */
        .warning-state {
          color: #f59e0b !important;
          background: rgba(245, 158, 11, 0.1) !important;
          border: 1px solid rgba(245, 158, 11, 0.3) !important;
        }

        /* Info State Styles */
        .info-state {
          color: #3b82f6 !important;
          background: rgba(59, 130, 246, 0.1) !important;
          border: 1px solid rgba(59, 130, 246, 0.3) !important;
        }

        /* Performance Optimizations */
        .chart-container * {
          will-change: transform !important;
        }

        /* Dark Mode Specific Enhancements */
        body {
          color-scheme: dark;
        }

        /* Container Query Support */
        @container (max-width: 600px) {
          .chart-container {
            height: 300px !important;
          }
        }
      `}</style>
    </div>
  )
}