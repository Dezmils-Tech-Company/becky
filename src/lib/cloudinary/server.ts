import { v2 as cloudinary } from 'cloudinary'
import { env } from '@/config/env'

/**
 * Configure Cloudinary with credentials from environment variables
 */
cloudinary.config({
  cloud_name: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
})

/**
 * Generate signed upload parameters for Cloudinary
 * @param folder - Optional folder to upload to
 * @returns Object containing timestamp and signature for upload
 */
export async function signUploadParams(folder = 'beckie-products'): Promise<{
  timestamp: number
  signature: string
}> {
  const timestamp = Math.round(new Date().getTime() / 1000)

  // Parameters to sign
  const paramsToSign = {
    timestamp,
    folder,
  }

  // Generate signature
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    env.CLOUDINARY_API_SECRET
  )

  return { timestamp, signature }
}

/**
 * Delete an image from Cloudinary
 * @param publicId - The public ID of the image to delete
 * @returns Promise that resolves when deletion is complete
 */
export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId)
}