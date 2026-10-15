const features = [
  { icon: '⚡', title: 'Immédiat & gratuit', desc: 'QR statique PNG en moins de 30 secondes, sans compte.' },
  { icon: '📱', title: 'Mobile Money', desc: 'Paiement via Orange Money, Wave, MTN et plus via GeniusPay.' },
  { icon: '💬', title: 'WhatsApp natif', desc: 'QR WhatsApp avec message prérempli, le canal n°1 en Afrique.' },
  { icon: '🔄', title: 'QR dynamique', desc: 'Modifiez la destination sans réimprimer, suivez les scans.' },
  { icon: '🎨', title: 'Studio de design', desc: 'Couleurs, logo, cadre, styles de modules — score de lisibilité inclus.' },
  { icon: '🔒', title: 'Sécurité anti-fraude', desc: 'Analyse des liens malveillants, protection anti-quishing.' },
]

export default function Features() {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-[#041B4D] mb-2">
          Pourquoi QR CODE EXPRESS ?
        </h2>
        <p className="text-center text-gray-500 mb-10">La plateforme QR professionnelle, ancrée en Afrique</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-[#041B4D] mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
