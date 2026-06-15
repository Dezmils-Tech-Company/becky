import { useState } from 'react'

/**
 * Hook for handling Cloudinary image uploads
 * Returns upload function and state
 */
export function useUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadUrl, setUploadUrl] = useState<string | null>(null)

  /**
   * Upload an image file to Cloudinary
   * @param file - File object to upload
   * @param folder - Optional folder to upload to (default: 'beckie-products')
   */
  async function upload(file: File, folder = 'beckie-products'): Promise<string | null> {
    // Reset state
    setIsUploading(true)
    setUploadError(null)
    setUploadUrl(null)

    try {
      // Get signed upload parameters from our API
      const response = await fetch('/api/upload/sign', {
        method: 'POST',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to get upload credentials')
      }

      const { data } = await response.json()
      const { timestamp, signature, apiKey } = data

      // Prepare form data for Cloudinary upload
      const formData = new FormData()
      formData.append('file', file)
      formData.append('timestamp', timestamp.toString())
      formData.append('signature', signature)
      formData.append('api_key', apiKey)
      formData.append('folder', folder)

      // Upload to Cloudinary
      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      )

      if (!cloudinaryResponse.ok) {
        throw new Error('Failed to upload image to Cloudinary')
      }

      const result = await cloudinaryResponse.json()
      const secureUrl = result.secure_url

      // Update state with successful upload
      setUploadUrl(secureUrl)
      setIsUploading(false)

      return secureUrl
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error)
      setUploadError(error instanceof Error ? error.message : 'Unknown error')
      setIsUploading(false)
      return null
    }
  }

  return {
    upload,
    isUploading,
    uploadError,
    uploadUrl,
    reset: () => {
      setIsUploading(false)
      setUploadError(null)
      setUploadUrl(null)
    },
  }
}