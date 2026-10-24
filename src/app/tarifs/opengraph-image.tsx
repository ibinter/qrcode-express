import { ImageResponse } from 'next/og'

export const alt = 'Tarifs QR CODE EXPRESS — Plans gratuit, Essentiel, Pro, Business'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #041B4D 0%, #0a2d7a 100%)',
        fontFamily: 'sans-serif', padding: '60px',
      }}>
        <div style={{ display: 'flex', color: '#FF6A00', fontSize: '20px', fontWeight: 700, letterSpacing: '3px', marginBottom: '16px' }}>
          QR CODE EXPRESS
        </div>
        <div style={{ display: 'flex', color: 'white', fontSize: '60px', fontWeight: 800, textAlign: 'center', marginBottom: '16px' }}>
          Nos Tarifs
        </div>
        <div style={{ display: 'flex', color: 'rgba(255,255,255,0.7)', fontSize: '24px', textAlign: 'center', marginBottom: '48px' }}>
          Du plan gratuit à l'entreprise — transparent et sans surprise
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          {[
            { name: 'Gratuit', price: '0 FCFA', color: '#6b7280' },
            { name: 'Starter', price: '4 900 FCFA', color: '#0ea5e9' },
            { name: 'Essentiel', price: '9 900 FCFA', color: '#3b82f6' },
            { name: 'Pro', price: '19 900 FCFA', color: '#8b5cf6' },
            { name: 'Business', price: '29 900 FCFA', color: '#FF6A00' },
          ].map((plan) => (
            <div key={plan.name} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              background: 'rgba(255,255,255,0.08)',
              border: `2px solid ${plan.color}`,
              borderRadius: '16px',
              padding: '20px 28px',
              textAlign: 'center',
            }}>
              <span style={{ display: 'flex', color: plan.color, fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>{plan.name}</span>
              <span style={{ display: 'flex', color: 'white', fontSize: '18px', fontWeight: 800 }}>{plan.price}</span>
              <span style={{ display: 'flex', color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>/mois</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  )
}
