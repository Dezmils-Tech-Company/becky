import { z } from 'zod'

export const updateProfileSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters').max(50, 'Display name must not exceed 50 characters').optional(),
  phone: z.string().regex(/^(?:254|\+254|0)?([17]\d{8})$/, 'Invalid Kenyan phone number').optional(),
  address: z.object({
    line1: z.string().optional(),
    line2: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional()
  }).optional()
})

export type UpdateProfileValues = z.infer<typeof updateProfileSchema>

export const setRoleSchema = z.object({
  role: z.enum(['customer', 'admin'])
})

export type SetRoleValues = z.infer<typeof setRoleSchema>