import { v2 as cloudinary } from 'cloudinary'
import { env } from '@/config/env'

cloudinary.config({
  cloud_name: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
})

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
    crop,
    quality,
    format,
    fetchFormat,
  } = options

  // Build transformation object
  const transformations: any = {}
  if (width) transformations.width = width
  if (height) transformations.height = height
  if (crop) transformations.crop = crop
  if (quality) transformations.quality = quality
  if (format) transformations.format = format
  if (fetchFormat) transformations.fetchFormat = fetchFormat

  // Generate URL
  return cloudinary.url(publicId, {
    transformation: Object.keys(transformations).length > 0 ? transformations : [],
  })
}