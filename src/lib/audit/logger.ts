import mongoose from 'mongoose'
import { connectDB, isDBConnected } from '../mongodb/client'
import { env } from '../../config/env'

// AuditLog model will be defined later, but we can reference it
let AuditLogModel: mongoose.Model<any> | null = null

/**
 * Initializes the AuditLog model connection
 * Called internally when first writing to audit log
 */
async function initAuditLogModel() {
  if (AuditLogModel) return AuditLogModel

  // Ensure we're connected to DB
  if (!isDBConnected()) {
    await connectDB()
  }

  // Import the AuditLog model (will be created in Phase 3)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { AuditLog } = require('../../models')
  AuditLogModel = AuditLog

  return AuditLogModel
}

/**
 * Scrubs PII from metadata before writing to audit log
 * @param meta - Metadata object that may contain PII
 * @returns Sanitized metadata object
 */
function scrubPii(meta: Record<string, unknown>): Record<string, unknown> {
  const sanitized = { ...meta }

  // Scrub phone numbers - show only last 4 digits
  if (sanitized.phone) {
    const phoneStr = String(sanitized.phone)
    if (phoneStr.length >= 4) {
      sanitized.phone = '*'.repeat(phoneStr.length - 4) + phoneStr.slice(-4)
    } else {
      sanitized.phone = '*'.repeat(phoneStr.length)
    }
  }

  // Scrub email - show first letter and domain
  if (sanitized.email) {
    const emailStr = String(sanitized.email)
    const atIndex = emailStr.indexOf('@')
    if (atIndex > 0) {
      sanitized.email = `${emailStr[0]}***@${emailStr.slice(atIndex + 1)}`
    } else {
      sanitized.email = 'u***@domain.com'
    }
  }

  // Remove address fields completely
  delete sanitized.address
  delete sanitized.line1
  delete sanitized.line2
  delete sanitized.city
  delete sanitized.country
  delete sanitized.postalCode

  return sanitized
}

/**
 * Writes an audit log entry to the database
 * @param entry - Audit log entry (without _id and createdAt)
 */
export async function writeAuditLog(
  entry: Omit<AuditLog, '_id' | 'createdAt'>
) {
  try {
    const AuditLog = await initAuditLogModel() as mongoose.Model<any>

    // Scrub PII from meta if present
    const sanitizedEntry = {
      ...entry,
      meta: entry.meta ? scrubPii(entry.meta) : {},
    }

    // Create and save the audit log entry
    const auditLog = new AuditLog(sanitizedEntry)
    await auditLog.save()

    // Log to console for debugging (in development only)
    if (process.env.NODE_ENV === 'development') {
      console.log('📝 Audit log written:', {
        action: sanitizedEntry.action,
        resource: sanitizedEntry.resource,
        actor: sanitizedEntry.actor,
      })
    }
  } catch (error) {
    // Never throw - audit failures shouldn't break the main request
    console.error('❌ Failed to write audit log:', error)
    // In production, you might want to send this to an external monitoring service
  }
}

// Define the AuditLog type for TypeScript
export interface AuditLog {
  _id?: string
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
  createdAt?: Date
  updatedAt?: Date
}