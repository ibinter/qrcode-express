import { ImageResponse } from 'next/og'

export const alt = 'QR CODE EXPRESS — La plateforme QR professionnelle d\'Afrique'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #041B4D 0%, #0a2d7a 60%, #1a3f9e 100%)',
          fontFamily: 'sans-serif',
          padding: '60px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <div style={{
            width: '72px', height: '72px',
            background: 'linear-gradient(135deg, #FF6A00, #f97316)',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '36px', color: 'white', fontWeight: 800,
          }}>
            QR
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: 'white', fontSize: '36px', fontWeight: 800, letterSpacing: '-1px' }}>
              QR CODE EXPRESS
            </span>
            <span style={{ color: '#FF6A00', fontSize: '16px', fontWeight: 600, letterSpacing: '2px' }}>
              BY IBIG SOFT
            </span>
          </div>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          color: 'white',
          fontSize: '52px',
          fontWeight: 800,
          textAlign: 'center',
          lineHeight: 1.15,
          marginBottom: '24px',
          maxWidth: '900px',
        }}>
          <span>Vos QR codes professionnels</span>
          <span style={{ color: '#FF6A00' }}>en un clic</span>
        </div>

        <div style={{
          display: 'flex',
          color: 'rgba(255,255,255,0.7)',
          fontSize: '22px',
          textAlign: 'center',
          maxWidth: '700px',
        }}>
          Menu restaurant · Billetterie · Paiement Mobile Money · Formulaires
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '40px' }}>
          {['Wave', 'Orange Money', 'MTN MoMo', "Côte d'Ivoire"].map((tag) => (
            <div key={tag} style={{
              display: 'flex',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '100px',
              padding: '8px 20px',
              color: 'white',
              fontSize: '16px',
              fontWeight: 600,
            }}>
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  )
}
