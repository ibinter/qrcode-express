import Link from 'next/link'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  dark?: boolean
  href?: string
}

export default function Logo({ size = 'md', dark = false, href = '/' }: LogoProps) {
  const sizes = { sm: 28, md: 36, lg: 52 }
  const textSizes = { sm: 'text-base', md: 'text-xl', lg: 'text-3xl' }
  const s = sizes[size]

  const logo = (
    <span className={`flex items-center gap-2 select-none`}>
      {/* QR icon with speed lines */}
      <svg width={s} height={s} viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Speed lines */}
        <line x1="0" y1="20" x2="10" y2="20" stroke="#FF6A00" strokeWidth="3" strokeLinecap="round" opacity="0.7"/>
        <line x1="0" y1="26" x2="8" y2="26" stroke="#FF6A00" strokeWidth="2.5" strokeLinecap="round" opacity="0.5"/>
        <line x1="0" y1="32" x2="10" y2="32" stroke="#FF6A00" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
        {/* QR body */}
        <rect x="12" y="10" width="32" height="32" rx="6" fill="#041B4D"/>
        {/* QR modules */}
        <rect x="16" y="14" width="10" height="10" rx="2" fill="white"/>
        <rect x="18" y="16" width="6" height="6" rx="1" fill="#FF6A00"/>
        <rect x="30" y="14" width="10" height="10" rx="2" fill="white"/>
        <rect x="32" y="16" width="6" height="6" rx="1" fill="#FF6A00"/>
        <rect x="16" y="28" width="10" height="10" rx="2" fill="white"/>
        <rect x="18" y="30" width="6" height="6" rx="1" fill="#FF6A00"/>
        {/* Center dots */}
        <rect x="28" y="26" width="4" height="4" rx="1" fill="white" opacity="0.9"/>
        <rect x="34" y="26" width="4" height="4" rx="1" fill="white" opacity="0.6"/>
        <rect x="28" y="32" width="4" height="4" rx="1" fill="white" opacity="0.6"/>
        <rect x="34" y="32" width="4" height="4" rx="1" fill="white" opacity="0.4"/>
        {/* Arrow */}
        <path d="M40 22 L46 26 L40 30" stroke="#FF6A00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {/* Text */}
      <span className={`font-extrabold ${textSizes[size]} tracking-tight`}
        style={{ color: dark ? 'white' : '#041B4D' }}>
        QR <span style={{ color: '#FF6A00' }}>CODE</span> EXPRESS
      </span>
    </span>
  )

  if (!href) return logo
  return <Link href={href}>{logo}</Link>
}
