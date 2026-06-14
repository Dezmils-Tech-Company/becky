import { z } from 'zod'

export const createOrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().min(1, 'Product ID is required'),
      quantity: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 1, {
        message: 'Quantity must be a valid positive integer'
      }).transform((val) => Number(val))
    })
  ).min(1, 'At least one item is required'),
  shippingAddress: z.object({
    line1: z.string().min(1, 'Address line 1 is required'),
    line2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    country: z.string().min(1, 'Country is required'),
    postalCode: z.string().min(1, 'Postal code is required')
  }),
  paymentMethod: z.enum(['mpesa', 'stripe']),
  currency: z.enum(['KES', 'USD']),
  notes: z.string().optional()
})

export type CreateOrderValues = z.infer<typeof createOrderSchema>

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
})

export type UpdateOrderStatusValues = z.infer<typeof updateOrderStatusSchema>