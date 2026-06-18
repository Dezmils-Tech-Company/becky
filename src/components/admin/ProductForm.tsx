"use client"
import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Spinner } from '@/components/ui/Spinner'
import { useUpload } from '@/hooks/useUpload'
import { createProductSchema } from '@/schemas/product.schema'

interface ProductFormProps {
  productId?: string // For editing existing product
}

export default function ProductForm({ productId }: ProductFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    currency: 'KES' as const,
    category: '',
    stock: '0',
    isActive: true
  })
  const { upload: uploadImage, isUploading: isImageUploading, uploadError: imageUploadError, uploadUrl } = useUpload()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Validate form data client-side first for fast feedback
      const parsed = createProductSchema.safeParse(formData)
      if (!parsed.success) {
        const { fieldErrors } = parsed.error.flatten()
        setError('Invalid form data. Please check the fields.')
        console.error('Validation errors:', fieldErrors)
        setIsLoading(false)
        return
      }

      const payload = {
        ...parsed.data,
        imageUrl: uploadUrl || null,
      }

      const endpoint = productId ? `/api/products/${productId}` : '/api/products'
      const method = productId ? 'PATCH' : 'POST'

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setError(data?.error || 'Failed to save product. Please try again.')
        setIsLoading(false)
        return
      }

      router.push('/admin/products')
    } catch (err) {
      console.error('Error saving product:', err)
      setError('Failed to save product. Please try again.')
      setIsLoading(false)
    }
  }

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    const { name, value, type } = target
    const checked = 'checked' in target ? target.checked : undefined

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked ?? false : value
    }))
  }

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setError(null)
      const uploadedUrl = await uploadImage(file)
      if (!uploadedUrl) {
        setError('Failed to upload image. Please try again.')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <Input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          disabled={isLoading}
          placeholder="Enter product name"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <Textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          disabled={isLoading}
          placeholder="Enter product description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Price (in cents)</label>
          <Input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            disabled={isLoading}
            min="0"
            placeholder="Enter price in cents"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Currency</label>
          <select
            name="currency"
            value={formData.currency}
            onChange={handleChange}
            disabled={isLoading}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="KES">KES</option>
            <option value="USD">USD</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <Input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="Enter product category"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Stock</label>
          <Input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            disabled={isLoading}
            min="0"
            placeholder="Enter stock quantity"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Status</label>
        <div className="flex items-center">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            disabled={isLoading}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Active</span>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Images</label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={isLoading}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
              disabled={isLoading || isImageUploading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {isImageUploading ? (
                <>
                  <span className="mr-2">Uploading...</span>
                  <Spinner className="h-4 w-4" />
                </>
              ) : (
                'Upload Image'
              )}
            </button>
          </div>
          {imageUploadError && (
            <p className="mt-2 text-xs text-red-600">
              {imageUploadError}
            </p>
          )}
          {uploadUrl && (
            <div className="mt-4">
              <p className="text-xs text-gray-500 mb-1">Preview:</p>
              <img
                src={uploadUrl}
                alt="Uploaded product image"
                className="h-24 w-24 object-cover rounded border border-gray-200"
              />
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/products')}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2"
        >
          {isLoading ? (
            <>
              <Spinner className="h-4 w-4 mr-2" />
              Saving...
            </>
          ) : (
            productId ? 'Update Product' : 'Create Product'
          )}
        </Button>
      </div>
    </form>
  )
}