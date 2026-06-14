import { z } from 'zod'

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().min(1, 'Slug is required').optional(), // Will be auto-generated if not provided
  description: z.string().min(1, 'Description is required'),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Price must be a valid non-negative number'
  }).transform((val) => Number(val)),
  currency: z.enum(['KES', 'USD']),
  images: z.array(z.string().url('Invalid URL')).min(1, 'At least one image is required'),
  category: z.string().min(1, 'Category is required'),
  stock: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Stock must be a valid non-negative number'
  }).transform((val) => Number(val)),
  isActive: z.boolean().default(true)
})

export type CreateProductValues = z.infer<typeof createProductSchema>

export const updateProductSchema = createProductSchema.partial()

export type UpdateProductValues = z.infer<typeof updateProductSchema>

export const productQuerySchema = z.object({
  page: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 1, {
    message: 'Page must be a valid positive integer'
  }).transform((val) => Number(val)).optional(),
  limit: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 1 && Number(val) <= 100, {
    message: 'Limit must be between 1 and 100'
  }).transform((val) => Number(val)).optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  isActive: z.union([z.boolean(), z.string().transform((val) => val === 'true')]).optional()
})

export type ProductQueryValues = z.infer<typeof productQuerySchema>