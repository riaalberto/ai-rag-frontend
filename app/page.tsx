import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            🤖 AI RAG Assistant
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Sistema RAG empresarial con análisis inteligente de documentos Excel. 
            Sube tus archivos y obtén insights automáticos con IA.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">Análisis de Excel</h3>
            <p className="text-gray-600">
              Sube archivos .xlsx y obtén análisis automático con gráficas 
              y estadísticas descriptivas generadas por IA.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="text-lg font-semibold mb-2">Chat Inteligente</h3>
            <p className="text-gray-600">
              Haz preguntas sobre tus documentos y recibe respuestas 
              contextuales basadas en el contenido analizado.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="text-4xl mb-4">🏗️</div>
            <h3 className="text-lg font-semibold mb-2">Arquitectura Modular</h3>
            <p className="text-gray-600">
              Sistema escalable listo para agregar PowerPoint, Word, 
              PDF y otros tipos de documentos.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-16">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">1</div>
              <div className="text-gray-600">Procesador Activo</div>
              <div className="text-sm text-gray-500">Excel Processor</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">3</div>
              <div className="text-gray-600">Gráficas Automáticas</div>
              <div className="text-sm text-gray-500">Histogramas, Correlaciones</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">100%</div>
              <div className="text-gray-600">Funcional</div>
              <div className="text-sm text-gray-500">Backend + Frontend</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600">∞</div>
              <div className="text-gray-600">Escalable</div>
              <div className="text-sm text-gray-500">Arquitectura Modular</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link 
            href="/chat"
            className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            🚀 Empezar Chat Inteligente
          </Link>
          <p className="text-gray-500 mt-4">
            Prueba con: "¿Qué insights puedes darme del archivo Datos_Gonpal_1.xlsx?"
          </p>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-200 text-center text-gray-500">
          <p>🏗️ Sistema RAG con Arquitectura Modular • Powered by OpenAI & FastAPI</p>
          <div className="mt-2 flex justify-center space-x-4 text-sm">
            <span>✅ Upload Funcionando</span>
            <span>✅ Análisis Automático</span>
            <span>✅ Chat Inteligente</span>
            <span>✅ Base de Datos Supabase</span>
          </div>
        </footer>
      </div>
    </div>
  )
}