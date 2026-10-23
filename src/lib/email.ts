import nodemailer from 'nodemailer'

// Envoi via la messagerie LWS (SMTP) si SMTP_HOST est défini, sinon via Resend.
const RESEND_KEY = process.env.RESEND_API_KEY
const FROM = process.env.EMAIL_FROM ?? 'QR Code Express <noreply@qrcode-express.com>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://qrcode-express.com'

const SMTP_PORT = Number(process.env.SMTP_PORT ?? 465)
const smtp = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      // Hébergement mutualisé : on limite le débit pour ne pas être bloqué par LWS.
      pool: true,
      maxConnections: 2,
      rateDelta: 1000,
      rateLimit: 5,
    })
  : null

export function emailConfigured() {
  return Boolean(smtp || RESEND_KEY)
}

export async function sendEmail(to: string, subject: string, html: string) {
  if (smtp) {
    try {
      await smtp.sendMail({ from: FROM, to, subject, html })
      return { ok: true }
    } catch (err) {
      console.error('[email] SMTP :', err instanceof Error ? err.message : err)
      return { ok: false, reason: 'smtp_error' }
    }
  }
  if (!RESEND_KEY) return { ok: false, reason: 'no_key' }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: [to], subject, html }),
    })
    return { ok: res.ok }
  } catch {
    return { ok: false, reason: 'fetch_error' }
  }
}

function wrap(content: string) {
  return `
    <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:0;background:#fff">
      <div style="background:linear-gradient(135deg,#041B4D,#1e3a8a);padding:28px 32px;border-radius:12px 12px 0 0">
        <span style="color:#fff;font-size:18px;font-weight:800;letter-spacing:-0.3px">QR <span style="color:#FF6A00">CODE</span> EXPRESS</span>
      </div>
      <div style="padding:32px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
        ${content}
      </div>
      <p style="color:#9ca3af;font-size:11px;text-align:center;margin:16px 0 0">
        QR Code Express · <a href="${APP_URL}" style="color:#FF6A00">qrcode-express.com</a>
      </p>
    </div>
  `
}

export async function sendWelcomeEmail(to: string, name: string) {
  return sendEmail(to, '🎉 Bienvenue sur QR Code Express !', wrap(`
    <h2 style="color:#041B4D;margin:0 0 12px;font-size:22px">Bonjour ${name || 'là'} 👋</h2>
    <p style="color:#374151;margin:0 0 16px;line-height:1.6">
      Votre compte est prêt. Vous pouvez dès maintenant créer vos premiers QR codes, suivre leurs scans en temps réel et bien plus encore.
    </p>
    <a href="${APP_URL}/dashboard" style="display:inline-block;background:linear-gradient(135deg,#FF6A00,#ee5a24);color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:700;font-size:14px;margin:8px 0 24px">
      Accéder à mon dashboard →
    </a>
    <hr style="border:none;border-top:1px solid #f3f4f6;margin:24px 0">
    <p style="color:#6b7280;font-size:13px;margin:0">
      Des questions ? Consultez notre <a href="${APP_URL}/guide" style="color:#FF6A00">guide</a> ou répondez à cet email.
    </p>
  `))
}

export async function sendPaymentConfirmationEmail(to: string, name: string, plan: string, amount: number, reference: string) {
  return sendEmail(to, `✅ Paiement confirmé — Plan ${plan}`, wrap(`
    <h2 style="color:#041B4D;margin:0 0 12px;font-size:22px">Paiement reçu ✅</h2>
    <p style="color:#374151;margin:0 0 20px;line-height:1.6">
      Bonjour ${name || ''}, votre paiement a bien été reçu et votre plan <strong>${plan}</strong> est maintenant actif.
    </p>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px 20px;margin:0 0 24px">
      <table style="width:100%;font-size:14px;border-collapse:collapse">
        <tr><td style="color:#6b7280;padding:4px 0">Plan</td><td style="color:#111827;font-weight:700;text-align:right;text-transform:capitalize">${plan}</td></tr>
        <tr><td style="color:#6b7280;padding:4px 0">Montant</td><td style="color:#111827;font-weight:700;text-align:right">${amount.toLocaleString('fr-FR')} FCFA</td></tr>
        <tr><td style="color:#6b7280;padding:4px 0">Référence</td><td style="color:#6b7280;text-align:right;font-family:monospace;font-size:12px">${reference}</td></tr>
      </table>
    </div>
    <a href="${APP_URL}/dashboard" style="display:inline-block;background:linear-gradient(135deg,#FF6A00,#ee5a24);color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:700;font-size:14px">
      Accéder à mon dashboard →
    </a>
  `))
}

export async function sendQuotaWarningEmail(to: string, name: string, used: number, total: number, plan: string) {
  const pct = Math.round((used / total) * 100)
  return sendEmail(to, `⚠️ Vous avez utilisé ${pct}% de votre quota`, wrap(`
    <h2 style="color:#041B4D;margin:0 0 12px;font-size:22px">Attention : quota presque atteint ⚠️</h2>
    <p style="color:#374151;margin:0 0 16px;line-height:1.6">
      Bonjour ${name || ''}, vous avez utilisé <strong>${used} QR codes sur ${total}</strong> (${pct}%) inclus dans votre plan <strong>${plan}</strong>.
    </p>
    <div style="background:#f9f1e0;border-radius:8px;padding:4px 8px;margin:0 0 20px">
      <div style="background:#e5e7eb;border-radius:4px;height:10px;overflow:hidden">
        <div style="background:linear-gradient(90deg,#f59e0b,#d97706);height:10px;border-radius:4px;width:${pct}%"></div>
      </div>
      <p style="color:#92400e;font-size:12px;margin:6px 0 0;text-align:center">${used} / ${total} QR codes</p>
    </div>
    <p style="color:#374151;font-size:13px;margin:0 0 20px">
      Passez au plan supérieur pour continuer à créer des QR codes sans interruption.
    </p>
    <a href="${APP_URL}/portefeuille" style="display:inline-block;background:linear-gradient(135deg,#FF6A00,#ee5a24);color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:700;font-size:14px">
      Mettre à niveau mon plan →
    </a>
  `))
}

export async function sendReferralNotificationEmail(
  to: string,
  referrerName: string,
  referredName: string,
  creditsEarned: number,
  totalReferrals: number,
) {
  return sendEmail(to, `🎁 Nouveau filleul confirmé — +${creditsEarned} crédits !`, wrap(`
    <h2 style="color:#041B4D;margin:0 0 12px;font-size:22px">Nouveau filleul ! 🎉</h2>
    <p style="color:#374151;margin:0 0 16px;line-height:1.6">
      Bonjour ${referrerName || ''}, bonne nouvelle !
      <strong>${referredName || 'Un ami'}</strong> vient de rejoindre QR CODE EXPRESS grâce à votre lien de parrainage.
    </p>
    <div style="background:linear-gradient(135deg,#fff7ed,#fff);border:2px solid #FF6A00;border-radius:12px;padding:20px 24px;margin:0 0 24px;text-align:center">
      <p style="color:#FF6A00;font-size:36px;font-weight:900;margin:0;letter-spacing:-1px">+${creditsEarned}</p>
      <p style="color:#374151;font-size:14px;font-weight:700;margin:4px 0 0">crédits ajoutés à votre compte</p>
    </div>
    <div style="background:#f9fafb;border-radius:10px;padding:14px 18px;margin:0 0 24px">
      <table style="width:100%;font-size:14px;border-collapse:collapse">
        <tr>
          <td style="color:#6b7280;padding:4px 0">Filleul</td>
          <td style="color:#111827;font-weight:700;text-align:right">${referredName || 'Anonyme'}</td>
        </tr>
        <tr>
          <td style="color:#6b7280;padding:4px 0">Total parrainés</td>
          <td style="color:#111827;font-weight:700;text-align:right">${totalReferrals} filleul${totalReferrals > 1 ? 's' : ''}</td>
        </tr>
      </table>
    </div>
    <p style="color:#374151;font-size:13px;margin:0 0 20px;line-height:1.6">
      Continuez à partager votre lien pour gagner encore plus de crédits. Chaque filleul confirmé vous rapporte <strong>${creditsEarned} crédits</strong>.
    </p>
    <a href="${APP_URL}/parrainage" style="display:inline-block;background:linear-gradient(135deg,#FF6A00,#ee5a24);color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:700;font-size:14px;margin:0 0 8px">
      Voir mes parrainages →
    </a>
  `))
}

export async function sendPlanExpirationEmail(to: string, name: string, plan: string, daysLeft: number) {
  return sendEmail(to, `⏰ Votre plan ${plan} expire dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}`, wrap(`
    <h2 style="color:#041B4D;margin:0 0 12px;font-size:22px">Votre abonnement expire bientôt ⏰</h2>
    <p style="color:#374151;margin:0 0 16px;line-height:1.6">
      Bonjour ${name || ''}, votre plan <strong>${plan}</strong> expire dans <strong>${daysLeft} jour${daysLeft > 1 ? 's' : ''}</strong>.
    </p>
    <p style="color:#374151;font-size:13px;margin:0 0 20px;line-height:1.6">
      Pour continuer à profiter de toutes les fonctionnalités sans interruption, renouvelez votre abonnement dès maintenant.
    </p>
    <a href="${APP_URL}/portefeuille" style="display:inline-block;background:linear-gradient(135deg,#FF6A00,#ee5a24);color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:700;font-size:14px">
      Renouveler mon abonnement →
    </a>
    <p style="color:#9ca3af;font-size:12px;margin:20px 0 0">
      Sans renouvellement, votre compte reviendra au plan Gratuit à l'expiration.
    </p>
  `))
}
