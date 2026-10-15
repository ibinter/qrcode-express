import Link from 'next/link'

export default function QRIntrouvable() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-6xl mb-4">🔍</p>
        <h1 className="text-2xl font-bold text-[#041B4D] mb-2">QR code introuvable</h1>
        <p className="text-gray-500 text-sm mb-6">Ce QR code n&apos;existe pas ou a été supprimé.</p>
        <Link href="/" className="px-5 py-2.5 rounded-xl font-semibold text-white text-sm"
          style={{ background: 'linear-gradient(135deg, #FF6A00, #ee5a24)' }}>
          Créer un QR code
        </Link>
      </div>
    </main>
  )
}
