import { z } from 'zod'

export const mpesaInitiateSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  phone: z.string().regex(/^(?:254|\+254|0)?([17]\d{8})$/, 'Invalid Kenyan phone number')
})

export type MpesaInitiateValues = z.infer<typeof mpesaInitiateSchema>

export const mpesaCallbackSchema = z.object({
  Body: z.object({
    stkCallback: z.object({
      MerchantRequestID: z.string(),
      CheckoutRequestID: z.string(),
      ResultCode: z.number(),
      ResultDesc: z.string(),
      CallbackMetadata: z.object({
        Item: z.array(
          z.object({
            Name: z.string(),
            Value: z.union([z.string(), z.number()])
          })
        )
      })
    })
  })
})

export type MpesaCallbackValues = z.infer<typeof mpesaCallbackSchema>

export const stripeIntentSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  currency: z.enum(['usd', 'kes'])
})

export type StripeIntentValues = z.infer<typeof stripeIntentSchema>