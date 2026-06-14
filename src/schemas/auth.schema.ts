import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long')
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const registerSchema = loginSchema.extend({
  displayName: z.string().min(2, 'Display name must be at least 2 characters').max(50, 'Display name must not exceed 50 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

export type RegisterFormValues = z.infer<typeof registerSchema>

export const sessionSchema = z.object({
  idToken: z.string().min(1, 'ID token is required')
})

export type SessionFormValues = z.infer<typeof sessionSchema>