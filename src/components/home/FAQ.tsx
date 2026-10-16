'use client'
import { useState } from 'react'

const FAQS = [
  {
    q: 'Est-ce que QR CODE EXPRESS est gratuit ?',
    a: 'Oui ! Le plan gratuit vous permet de créer jusqu\'à 3 QR codes statiques sans limite de temps, sans carte bancaire. Les QR dynamiques (modifiables), les analytics et les fonctionnalités avancées sont disponibles dès le plan Essentiel à partir de 1 500 FCFA/mois.',
  },
  {
    q: 'Quelle est la différence entre un QR statique et un QR dynamique ?',
    a: 'Un QR statique pointe vers une adresse fixe — si vous voulez changer la destination, vous devez recréer et réimprimer le QR. Un QR dynamique vous permet de modifier la destination depuis votre tableau de bord sans jamais réimprimer. C\'est indispensable pour les menus, affiches et flyers.',
  },
  {
    q: 'Quels modes de paiement sont acceptés sur la plateforme ?',
    a: 'Pour payer votre abonnement : Wave CI, Orange Money, MTN MoMo et Moov Money. Pour les QR de paiement que vous créez pour vos clients : Wave, Orange Money, MTN MoMo — les trois opérateurs les plus utilisés en Côte d\'Ivoire.',
  },
  {
    q: 'Mes QR codes fonctionnent-ils si j\'arrête mon abonnement ?',
    a: 'Les QR statiques restent actifs indéfiniment même sans abonnement. Les QR dynamiques passent en mode "en pause" si votre abonnement expire, mais reprennent immédiatement dès que vous le renouvelez. Vos données sont conservées.',
  },
  {
    q: 'Est-ce que je peux personnaliser le design de mes QR codes ?',
    a: 'Absolument. Vous pouvez choisir les couleurs, ajouter votre logo au centre, choisir parmi 34 styles de cadre, modifier la forme des modules et des yeux. Vous pouvez même générer un QR artistique avec l\'IA (disponible à partir du plan Pro).',
  },
  {
    q: 'Comment fonctionne la billetterie QR ?',
    a: 'Créez votre événement, définissez le nombre de places et les informations requises. Vos participants s\'inscrivent via le lien ou le QR de l\'événement et reçoivent un billet QR unique. À l\'entrée, le contrôleur scanne le billet et le système valide ou rejette instantanément.',
  },
  {
    q: 'Mes données sont-elles sécurisées ?',
    a: 'Oui. Nous utilisons Supabase (infrastructure PostgreSQL chiffrée) et Vercel (hébergement certifié SOC 2). Toutes les connexions sont en HTTPS. Vos données ne sont jamais revendues à des tiers.',
  },
  {
    q: 'Puis-je gérer mes QR codes en équipe ?',
    a: 'Oui, dès le plan Business. Créez une organisation, invitez vos collaborateurs et assignez des rôles : propriétaire, admin, éditeur, contrôleur ou lecteur. Chaque membre accède uniquement aux ressources de son rôle.',
  },
  {
    q: 'Y a-t-il une limite de scans par QR code ?',
    a: 'Non, il n\'y a pas de limite de scans sur les plans payants. Sur le plan gratuit, les QR statiques ne sont pas limités non plus. Vous pouvez optionnellement définir un nombre maximum de scans sur vos QR dynamiques pour des besoins spécifiques (ex: offre limitée).',
  },
  {
    q: 'Comment contacter le support ?',
    a: 'Via le bouton WhatsApp en bas à droite de toutes les pages — réponse garantie en moins de 2h en journée (8h-20h GMT). Vous pouvez aussi envoyer un email à support@qrcode-express.com.',
  },
]

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block bg-blue-50 text-[#041B4D] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4 border border-blue-100">
            💬 Questions fréquentes
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#041B4D] mb-3">
            Tout ce que vous voulez savoir
          </h2>
          <p className="text-gray-500 text-lg">
            Une question qui ne figure pas ici ? Contactez-nous sur WhatsApp.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i}
              className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                open === i ? 'border-[#FF6A00]/40 shadow-md' : 'border-gray-100 shadow-sm'
              }`}>
              <button
                className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 group"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className={`text-sm font-bold leading-snug transition-colors ${
                  open === i ? 'text-[#FF6A00]' : 'text-[#041B4D] group-hover:text-[#FF6A00]'
                }`}>
                  {faq.q}
                </span>
                <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                  open === i
                    ? 'bg-[#FF6A00] text-white rotate-45'
                    : 'bg-gray-100 text-gray-500 group-hover:bg-orange-50 group-hover:text-[#FF6A00]'
                }`}>
                  +
                </span>
              </button>
              {open === i && (
                <div className="px-6 pb-5">
                  <p className="text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-4">
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm text-gray-500">
            Vous avez d'autres questions ?{' '}
            <a href="https://wa.me/2250779380704" target="_blank" rel="noopener noreferrer"
              className="text-[#FF6A00] font-semibold hover:underline">
              Écrivez-nous sur WhatsApp →
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
