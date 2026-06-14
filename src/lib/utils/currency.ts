/**
 * Formats an amount in cents to Kenyan Shillings string
 * @param amount - Amount in cents (lowest currency unit)
 * @returns Formatted KES string (e.g., "KES 1,234.00")
 */
export function formatKES(amount: number): string {
  const shillings = amount / 100
  return `KES ${shillings.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/**
 * Formats an amount in cents to US Dollars string
 * @param amount - Amount in cents (lowest currency unit)
 * @returns Formatted USD string (e.g., "$12.34")
 */
export function formatUSD(amount: number): string {
  const dollars = amount / 100
  return `$${dollars.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}