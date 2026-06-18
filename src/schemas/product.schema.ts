import { z } from 'zod'

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().min(1, 'Slug is required').optional(), // Will be auto-generated if not provided
  description: z.string().min(1, 'Description is required'),
  // z.coerce.number() accepts either a string (e.g. raw form input) or a
  // number (e.g. an already-parsed payload, or a JSON body sent directly
  // as a number) and always outputs a number. This makes the schema
  // idempotent — safe to parse the same data twice, which matters here
  // since the client validates once before sending, and the server
  // validates again on receipt.
  price: z.coerce.number().nonnegative('Price must be a valid non-negative number'),
  currency: z.enum(['KES', 'USD']),
  images: z.array(z.string().url('Invalid URL')).min(1, 'At least one image is required'),
  category: z.string().min(1, 'Category is required'),
  stock: z.coerce.number().int().nonnegative('Stock must be a valid non-negative number').default(0),
  isActive: z.boolean().default(true)
})

export type CreateProductValues = z.infer<typeof createProductSchema>

export const updateProductSchema = createProductSchema.partial()

export type UpdateProductValues = z.infer<typeof updateProductSchema>

export const productQuerySchema = z.object({
  // Same idempotency fix applied here for consistency, even though nothing
  // currently double-parses this schema — prevents the same trap from
  // resurfacing if a future caller does (e.g. re-validating parsed query
  // params before forwarding them somewhere else).
  page: z.coerce.number().int().min(1, 'Page must be a valid positive integer').optional(),
  limit: z.coerce.number().int().min(1).max(100, 'Limit must be between 1 and 100').optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  isActive: z.union([z.boolean(), z.string().transform((val) => val === 'true')]).optional()
})

export type ProductQueryValues = z.infer<typeof productQuerySchema>