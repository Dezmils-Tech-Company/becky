import { Schema, model, models, type HydratedDocument } from 'mongoose'

export interface IOrderItem {
  productId: string
  name: string
  price: number
  quantity: number
  imageUrl: string
}

export interface IShippingAddress {
  line1: string
  line2?: string
  city: string
  country: string
  postalCode: string
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export type OrderPaymentStatus = 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded'

export type OrderPaymentMethod = 'mpesa' | 'stripe'

export type OrderCurrency = 'KES' | 'USD'

export interface IOrder {
  userId: string
  items: IOrderItem[]
  subtotal: number
  total: number
  currency: OrderCurrency
  status: OrderStatus
  paymentStatus: OrderPaymentStatus
  paymentMethod: OrderPaymentMethod
  shippingAddress: IShippingAddress
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: String, required: true, index: true },
    items: {
      type: [
        {
          productId: { type: String, required: true },
          name: { type: String, required: true },
          price: { type: Number, required: true },
          quantity: { type: Number, required: true },
          imageUrl: { type: String, required: true }
        }
      ],
      required: true,
      validate: {
        validator: (items: IOrderItem[]): boolean => items.length > 0,
        message: 'At least one item is required'
      }
    },
    subtotal: { type: Number, required: true },
    total: { type: Number, required: true },
    currency: { type: String, enum: ['KES', 'USD'], required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending'
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'pending', 'paid', 'failed', 'refunded'],
      default: 'unpaid'
    },
    paymentMethod: { type: String, enum: ['mpesa', 'stripe'], required: true },
    shippingAddress: {
      line1: { type: String, required: true },
      line2: { type: String },
      city: { type: String, required: true },
      country: { type: String, required: true },
      postalCode: { type: String, required: true }
    },
    notes: { type: String }
  },
  { timestamps: true }
)

/**
 * Recalculates `subtotal` and `total` from `items` before every save.
 * Currently `total === subtotal` (no tax/shipping line); extend here if
 * those are added later.
 */
OrderSchema.pre('save', function () {
  const doc = this as HydratedDocument<IOrder>
  if (doc.isModified('items') || doc.isNew) {
    const subtotal = doc.items.reduce(
      (sum: number, item: IOrderItem) => sum + item.price * item.quantity,
      0
    )
    doc.subtotal = subtotal
    doc.total = subtotal
  }
})

export const Order = models.Order || model<IOrder>('Order', OrderSchema)