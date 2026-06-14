import { connectDB } from '../lib/mongodb/client'
import mongoose, { Schema, model, Document, Types } from 'mongoose'

export interface IPayment extends Document {
  orderId: Types.ObjectId
  provider: 'mpesa' | 'stripe'
  status: 'pending' | 'completed' | 'failed'
  amount: number
  currency: string
  // M-Pesa specific
  merchantRequestId?: string
  checkoutRequestId?: string
  mpesaReceiptNumber?: string
  phoneNumber?: string
  // Stripe specific
  stripePaymentIntentId?: string
  stripeClientSecret?: string
  // Raw provider response
  rawResponse: Record<string, unknown>
}

const PaymentSchema = new Schema<IPayment>(
  {
    orderId: { type: Types.ObjectId, ref: 'Order', required: true, index: true },
    provider: { type: String, enum: ['mpesa', 'stripe'], required: true },
    status: { type: String, enum: ['pending', 'completed', 'failed'], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    // M-Pesa specific
    merchantRequestId: { type: String, sparse: true, index: true },
    checkoutRequestId: { type: String },
    mpesaReceiptNumber: { type: String },
    phoneNumber: { type: String },
    // Stripe specific
    stripePaymentIntentId: { type: String, sparse: true, index: true },
    stripeClientSecret: { type: String },
    // Raw provider response
    rawResponse: { type: Schema.Types.Mixed }
  },
  { timestamps: true }
)

// Export the model - prevent overwriting in Next.js dev
export const Payment = mongoose.models.Payment || model<IPayment>('Payment', PaymentSchema)