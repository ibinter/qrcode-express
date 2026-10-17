'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

const FAQ_COUNT = 15

export default function FAQ() {
  const t = useTranslations('pricing')
  const [open, setOpen] = useState<number | null>(0)

  const faqs = Array.from({ length: FAQ_COUNT }, (_, i) => ({
    q: t(`faq_q${i + 1}` as any),
    a: t(`faq_a${i + 1}` as any),
  }))

  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block bg-blue-50 text-[#041B4D] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4 border border-blue-100">
            💬 {t('faq_title')}
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#041B4D] mb-3">
            {t('faq_title')}
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
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
            <a href="https://wa.me/2250779380704" target="_blank" rel="noopener noreferrer"
              className="text-[#FF6A00] font-semibold hover:underline">
              WhatsApp →
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
