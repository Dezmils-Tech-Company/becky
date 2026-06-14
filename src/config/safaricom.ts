import { env } from './env'
import { SAFARICOM_CALLBACK_IPS } from './constants'

// Helper to get Daraja base URL based on environment
export function getDarajaBaseUrl(): string {
  return env.DARAJA_ENV === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke'
}

// Create a Set for O(1) lookup of Safaricom IPs
// Note: In production, you'd want to parse CIDR ranges properly
// For simplicity, we're storing the raw strings and doing basic matching
// A production implementation would use a library like ip-range-check
export const safaricomIps = new Set(SAFARICOM_CALLBACK_IPS)

// Helper to check if an IP is from Safaricom
// This is a simplified version - in production, use proper CIDR matching
export function isSafaricomIp(ip: string): boolean {
  // Remove port if present
  const cleanIp = ip.split(':')[0]

  // Check against known Safaricom IPs/ranges
  // For now, we do exact match or subnet matching for /24 ranges
  return SAFARICOM_CALLBACK_IPS.some(range => {
    if (range.includes('/')) {
      const [base, subnet] = range.split('/')
      if (subnet === '24') {
        const baseParts = base.split('.')
        const ipParts = cleanIp.split('.')
        // Compare first 3 octets
        return (
          baseParts[0] === ipParts[0] &&
          baseParts[1] === ipParts[1] &&
          baseParts[2] === ipParts[2]
        )
      }
    }
    return range === cleanIp
  })
}