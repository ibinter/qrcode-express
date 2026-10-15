import Link from 'next/link'

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-[#041B4D] to-[#0a2d7a] text-white py-16 px-4 text-center">
      <p className="text-sm font-semibold text-[#FF6A00] uppercase tracking-widest mb-3">
        par IBIG SOFT
      </p>
      <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
        Créez votre QR code<br className="hidden md:block" /> en un clic
      </h1>
      <p className="text-lg text-blue-100 max-w-xl mx-auto mb-8">
        Gratuit, sans inscription, sans filigrane. QR statique illimité.
        Fonctions pro disponibles dès 500 FCFA.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="#generateur"
          className="px-6 py-3 rounded-xl font-bold text-white text-base transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #FF6A00, #ee5a24)' }}
        >
          Créer mon QR gratuit →
        </Link>
        <Link
          href="/inscription"
          className="px-6 py-3 rounded-xl font-semibold text-white text-base border border-white/30 hover:bg-white/10 transition-colors"
        >
          Ouvrir un compte
        </Link>
      </div>
      <p className="mt-6 text-xs text-blue-300">
        ✓ Sans inscription &nbsp;·&nbsp; ✓ PNG gratuit &nbsp;·&nbsp; ✓ Aucun filigrane &nbsp;·&nbsp; ✓ Moins de 30 secondes
      </p>
    </section>
  )
}
