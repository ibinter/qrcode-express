import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#041B4D] text-white mt-20">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <p className="text-xl font-bold mb-2">
            QR <span className="text-[#FF6A00]">CODE</span> EXPRESS
          </p>
          <p className="text-sm text-gray-300">Vos QR codes en un clic</p>
          <p className="text-xs text-gray-400 mt-2">par IBIG SOFT — IBIG SARL</p>
        </div>
        <div>
          <p className="font-semibold mb-3 text-sm">Produit</p>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><Link href="/#generateur" className="hover:text-[#FF6A00]">Créer un QR</Link></li>
            <li><Link href="/tarifs" className="hover:text-[#FF6A00]">Tarifs</Link></li>
            <li><Link href="/fonctionnalites" className="hover:text-[#FF6A00]">Fonctionnalités</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold mb-3 text-sm">Ressources</p>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><Link href="/guide" className="hover:text-[#FF6A00]">Guide d'impression</Link></li>
            <li><Link href="/blog" className="hover:text-[#FF6A00]">Blog</Link></li>
            <li><Link href="/support" className="hover:text-[#FF6A00]">Support</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold mb-3 text-sm">Légal</p>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><Link href="/cgu" className="hover:text-[#FF6A00]">CGU</Link></li>
            <li><Link href="/confidentialite" className="hover:text-[#FF6A00]">Confidentialité</Link></li>
            <li><Link href="/cookies" className="hover:text-[#FF6A00]">Cookies</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-blue-900 py-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} IBIG SOFT — INTERMARK BUSINESS INTERNATIONAL GROUP (IBIG SARL), Abidjan
      </div>
    </footer>
  )
}
