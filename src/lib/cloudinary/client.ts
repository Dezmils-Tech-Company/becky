import { env } from '@/config/env'

/**
 * Get an optimized Cloudinary URL for an image
 * @param publicId - The Cloudinary public ID of the image
 * @param options - Optional transformation parameters
 * @returns Optimized image URL
 */
export function getCloudinaryUrl(
  publicId: string,
  options: {
    width?: number
    height?: number
    crop?: string
    quality?: number
    format?: string
    fetchFormat?: string
  } = {}
): string {
  const {
    width,
    height,
    crop = 'auto',
    quality = 'auto',
    format,
    fetchFormat = 'auto',
  } = options

  // Build transformation string
  const transforms: string[] = []
  if (width) transforms.push(`w_${width}`)
  if (height) transforms.push(`h_${height}`)
  if (crop) transforms.push(`c_${crop}`)
  if (quality) transforms.push(`q_${quality}`)
  if (format) transforms.push(`f_${format}`)
  if (fetchFormat) transforms.push(`fl_${fetchFormat}`)

  const transformPath = transforms.length > 0 ? `/${transforms.join(',')}` : ''

  // Generate Cloudinary CDN URL
  return `https://res.cloudinary.com/${env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload${transformPath}/${publicId}`
}