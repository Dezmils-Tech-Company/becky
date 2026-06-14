import mongoose, { Schema, model, models, type HydratedDocument } from 'mongoose'
import { slugify } from '../lib/utils/slugify'

export interface IProduct {
  name: string
  slug: string
  description: string
  price: number // in cents/KES
  currency: 'KES' | 'USD'
  images: string[] // Cloudinary URLs
  category: string
  stock: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true, index: true },
    description: { type: String, required: true },
    price: { type: Number, required: true }, // in cents/KES
    currency: { type: String, enum: ['KES', 'USD'], required: true },
    images: { type: [String], required: true },
    category: { type: String, required: true, index: true },
    stock: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
)

/**
 * Auto-generates `slug` from `name` if not provided, before saving.
 */
ProductSchema.pre('save', function () {
  const doc = this as HydratedDocument<IProduct>
  if (!doc.slug && doc.name) {
    doc.slug = slugify(doc.name)
  }
})

export const Product = models.Product || model<IProduct>('Product', ProductSchema)