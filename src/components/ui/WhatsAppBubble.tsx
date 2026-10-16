'use client'
import { useState } from 'react'
import { FaWhatsapp } from 'react-icons/fa6'

export default function WhatsAppBubble() {
  const [hovered, setHovered] = useState(false)

  return (
    <a
      href="https://wa.me/2250778882592?text=Bonjour%2C%20j'ai%20une%20question%20sur%20QR%20CODE%20EXPRESS"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contacter sur WhatsApp"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 group"
      style={{ filter: 'drop-shadow(0 4px 16px rgba(37,211,102,0.4))' }}
    >
      {/* Tooltip */}
      <span
        className={`bg-white text-gray-800 text-sm font-semibold px-3 py-1.5 rounded-xl shadow-lg transition-all duration-200 whitespace-nowrap ${
          hovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 pointer-events-none'
        }`}
      >
        Discutons sur WhatsApp 💬
      </span>

      {/* Bubble */}
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
        style={{ background: 'linear-gradient(135deg, #25d366, #128c5e)' }}
      >
        {/* Pulse ring */}
        <span className="absolute w-14 h-14 rounded-full bg-[#25d366] opacity-30 animate-ping" />
        <FaWhatsapp size={28} color="white" className="relative z-10" />
      </div>
    </a>
  )
}
