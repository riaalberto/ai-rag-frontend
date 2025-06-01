import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata = {
  title: 'AI RAG Agent - Sistema Inteligente de Análisis',
  description: 'Plataforma avanzada de análisis de documentos con inteligencia artificial y procesamiento RAG',
  keywords: 'AI, RAG, análisis, documentos, inteligencia artificial, insights',
  authors: [{ name: 'AI RAG Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#667eea',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${inter.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#667eea" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className={`${inter.className} font-sans antialiased`}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
          {children}
        </div>
        
        {/* Global Loading Indicator */}
        <div id="global-loading" className="hidden fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-slate-600 font-medium">Cargando...</p>
          </div>
        </div>
      </body>
    </html>
  )
}