export const DEFAULT_PAGE_LIMIT = 20
export const MAX_PAGE_LIMIT = 100
export const SESSION_COOKIE_NAME = '__session'
export const SESSION_COOKIE_MAX_AGE = 1209600 // 14 days in seconds

// Daraja URLs
export const DARAJA_SANDBOX_BASE_URL = 'https://sandbox.safaricom.co.ke'
export const DARAJA_PROD_BASE_URL = 'https://api.safaricom.co.ke'

// Safaricom callback IPs (as specified in the CLAUDE.md)
// Note: These are example IPs - in production, you should get the latest from Safaricom documentation
export const SAFARICOM_CALLBACK_IPS = [
  '196.201.214.0/24',
  '196.201.212.0/24',
  '196.201.210.0/24',
  '196.201.208.0/24',
  '196.201.206.0/24',
  '196.201.204.0/24',
  '196.201.202.0/24',
  '196.41.238.0/24',
  '196.41.236.0/24',
  '196.41.234.0/24'
]

// Supported currencies
export const SUPPORTED_CURRENCIES = ['KES', 'USD'] as const

// Order statuses
export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled'
] as const

// Payment statuses
export const PAYMENT_STATUSES = [
  'unpaid',
  'pending',
  'paid',
  'failed',
  'refunded'
] as const

// Payment methods
export const PAYMENT_METHODS = ['mpesa', 'stripe'] as const