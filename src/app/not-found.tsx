import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #041B4D 0%, #0d2d6e 60%, #041B4D 100%)' }}>
      <div className="text-center">
        <div className="text-8xl font-black text-white/10 mb-2">404</div>
        <div className="text-5xl mb-6">🔍</div>
        <h1 className="text-2xl font-bold text-white mb-3">Page introuvable</h1>
        <p className="text-blue-200 mb-8 max-w-sm">
          Cette page n'existe pas ou a été déplacée.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-xl font-bold text-white shadow-lg hover:scale-105 transition-all"
          style={{ background: 'linear-gradient(135deg, #FF6A00, #ee5a24)' }}
        >
          Retour à l'accueil
        </Link>
      </div>
    </main>
  )
}
