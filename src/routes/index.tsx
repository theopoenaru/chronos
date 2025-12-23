import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  ssr: false,
  component: App,
})

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="text-center px-6">
        <h1 className="text-6xl md:text-7xl font-black text-white mb-6 [letter-spacing:-0.08em]">
          <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Chronos
          </span>
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          AI-powered chat application built with TanStack Start
        </p>
        <Link
          to="/chat"
          className="inline-block px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-cyan-500/50"
        >
          Start Chatting
        </Link>
      </div>
    </div>
  )
}
