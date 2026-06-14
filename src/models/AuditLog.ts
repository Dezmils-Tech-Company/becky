import { connectDB } from '../lib/mongodb/client'
import mongoose, { Schema, model, Document } from 'mongoose'

export interface IAuditLog extends Document {
  actor: {
    uid: string
    email: string
    role: string
  }
  action:
    | 'CREATE'
    | 'UPDATE'
    | 'DELETE'
    | 'LOGIN'
    | 'LOGOUT'
    | 'PAYMENT_INITIATED'
    | 'PAYMENT_COMPLETED'
    | 'PAYMENT_FAILED'
    | 'ROLE_CHANGED'
  resource: string
  resourceId?: string
  meta: Record<string, unknown>
  ip?: string
  userAgent?: string
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    actor: {
      uid: { type: String, required: true },
      email: { type: String, required: true },
      role: { type: String, required: true }
    },
    action: {
      type: String,
      enum: [
        'CREATE',
        'UPDATE',
        'DELETE',
        'LOGIN',
        'LOGOUT',
        'PAYMENT_INITIATED',
        'PAYMENT_COMPLETED',
        'PAYMENT_FAILED',
        'ROLE_CHANGED'
      ],
      required: true
    },
    resource: { type: String, required: true },
    resourceId: { type: String },
    meta: { type: Schema.Types.Mixed },
    ip: { type: String },
    userAgent: { type: String }
  },
  { timestamps: true }
)

// Export the model - prevent overwriting in Next.js dev
export const AuditLog = mongoose.models.AuditLog || model<IAuditLog>('AuditLog', AuditLogSchema)