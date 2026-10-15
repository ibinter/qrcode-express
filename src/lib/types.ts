export type QRType =
  | 'url'
  | 'text'
  | 'email'
  | 'phone'
  | 'sms'
  | 'wifi'
  | 'vcard'
  | 'whatsapp'
  | 'social'
  | 'location'
  | 'event'
  | 'pdf'
  | 'vcard_plus'
  | 'biolink'
  | 'app'
  | 'menu'
  | 'catalog'
  | 'review'

export type QRMode = 'static' | 'dynamic'

export interface QRDesign {
  fgColor: string
  bgColor: string
  moduleStyle: 'squares' | 'rounded' | 'dots'
  eyeStyle: 'square' | 'rounded'
  frameStyle?: 'none' | 'simple' | 'rounded' | 'banner_bottom' | 'banner_top' | 'bubble'
  frameLabel?: string
  frameColor?: string
  logoUrl?: string
  errorCorrection: 'L' | 'M' | 'Q' | 'H'
}

export interface QRCode {
  id: string
  user_id?: string
  org_id?: string
  type: QRType
  mode: QRMode
  content: string
  slug?: string
  design: QRDesign
  status: 'active' | 'paused' | 'expired' | 'archived'
  created_at: string
  updated_at: string
  expires_at?: string
  scan_count: number
  name?: string
  folder_id?: string
}

export interface User {
  id: string
  email: string
  phone?: string
  full_name?: string
  avatar_url?: string
  lang: string
  credits: number
  plan: 'free' | 'essential' | 'pro' | 'business' | 'agency' | 'enterprise'
  created_at: string
}

export interface ScanEvent {
  id: string
  qr_id: string
  scanned_at: string
  device_type?: string
  os?: string
  browser?: string
  country?: string
  city?: string
  is_bot: boolean
}

export interface PricingPlan {
  id: string
  name: string
  price_fcfa: number
  price_usd: number
  dynamic_qr_limit: number
  features: string[]
}
