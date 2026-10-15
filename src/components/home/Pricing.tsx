const plans = [
  {
    name: 'Gratuit',
    price: '0',
    unit: '',
    highlight: false,
    features: ['QR statique illimité', 'PNG standard', 'Couleurs de base', 'Sans inscription'],
    cta: 'Commencer',
    href: '#generateur',
  },
  {
    name: 'Essentiel',
    price: '1 000',
    unit: 'FCFA / mois',
    highlight: false,
    features: ['10 téléchargements Premium/mois', '5 QR dynamiques', 'Statistiques simples', 'vCard Plus'],
    cta: 'Essayer 14 jours',
    href: '/inscription?plan=essential',
  },
  {
    name: 'Pro',
    price: '2 500',
    unit: 'FCFA / mois',
    highlight: true,
    features: ['PNG HD + SVG + PDF illimité', '30 QR dynamiques', 'Pages métiers', 'Routage intelligent', 'Statistiques complètes'],
    cta: 'Choisir Pro',
    href: '/inscription?plan=pro',
  },
  {
    name: 'Business',
    price: '6 000',
    unit: 'FCFA / mois',
    highlight: false,
    features: ['150 QR dynamiques', '5 collaborateurs', 'Tests A/B', 'Pixels & coupons', 'Génération en lot (1 000 QR)'],
    cta: 'Choisir Business',
    href: '/inscription?plan=business',
  },
]

export default function Pricing() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-[#041B4D] mb-2">Tarifs simples</h2>
        <p className="text-center text-gray-500 mb-10">Sans engagement · Payez en Mobile Money · Pause possible</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`rounded-2xl p-6 border-2 flex flex-col ${p.highlight ? 'border-[#FF6A00] shadow-lg' : 'border-gray-200'}`}
            >
              {p.highlight && (
                <span className="text-xs font-bold text-white bg-[#FF6A00] px-3 py-1 rounded-full self-start mb-3">
                  Populaire
                </span>
              )}
              <h3 className="font-bold text-[#041B4D] text-lg">{p.name}</h3>
              <div className="my-3">
                <span className="text-3xl font-extrabold text-[#041B4D]">{p.price}</span>
                {p.unit && <span className="text-sm text-gray-400 ml-1">{p.unit}</span>}
              </div>
              <ul className="space-y-2 text-sm text-gray-600 flex-1 mb-6">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span> {f}
                  </li>
                ))}
              </ul>
              <a
                href={p.href}
                className={`text-center py-2 rounded-lg font-semibold text-sm transition-colors ${
                  p.highlight
                    ? 'bg-[#FF6A00] text-white hover:bg-orange-600'
                    : 'border border-[#041B4D] text-[#041B4D] hover:bg-[#041B4D] hover:text-white'
                }`}
              >
                {p.cta}
              </a>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-gray-400 mt-6">
          Tous les moyens de paiement · Orange Money, Wave, MTN, Moov, carte bancaire via GeniusPay
        </p>
      </div>
    </section>
  )
}
