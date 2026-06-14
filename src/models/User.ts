import { connectDB } from '../lib/mongodb/client'
import mongoose, { Schema, model, Document } from 'mongoose'

export interface IUser extends Document {
  uid: string
  email: string
  displayName: string
  role: 'customer' | 'admin'
  photoURL?: string
  phone?: string
  address?: {
    line1: string
    line2?: string
    city: string
    country: string
    postalCode: string
  }
}

const UserSchema = new Schema<IUser>(
  {
    uid: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    displayName: { type: String, required: true },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    photoURL: { type: String },
    phone: { type: String },
    address: {
      line1: { type: String },
      line2: { type: String },
      city: { type: String },
      country: { type: String },
      postalCode: { type: String }
    }
  },
  { timestamps: true }
)

// Export the model - prevent overwriting in Next.js dev
export const User = mongoose.models.User || model<IUser>('User', UserSchema)