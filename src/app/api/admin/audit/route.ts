import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb/client'
import { AuditLog, User } from '@/models'
import { requireSession } from '@/lib/session/get-session'
import { DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT } from '@/config/constants'
import { z } from 'zod'

/**
 * GET /api/admin/audit
 * Get paginated audit logs.
 * Requires admin role.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Check session and require admin role
    let session
    try {
      session = await requireSession(request)
    } catch (err) {
      if (err !== null && typeof err === 'object' && 'code' in err && err.code === 'UNAUTHORIZED') {
        return NextResponse.json(
          { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
          { status: 401 }
        )
      }
      throw err
    }

    await connectDB()
    const requesterUser = await User.findOne({ uid: session.uid })
    if (!requesterUser || requesterUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Forbidden' } },
        { status: 403 }
      )
    }
    if (!requesterUser || requesterUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Forbidden' } },
        { status: 403 }
      )
    }

    // Parse query params
    const { searchParams } = new URL(request.url)
    const queryData = Object.fromEntries(searchParams.entries())
    const auditLogQuerySchema = z.object({
      page: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 1, {
        message: 'Page must be a valid positive integer'
      }).transform((val) => Number(val)).optional(),
      limit: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 1 && Number(val) <= 100, {
        message: 'Limit must be between 1 and 100'
      }).transform((val) => Number(val)).optional(),
      action: z.enum([
        'CREATE',
        'UPDATE',
        'DELETE',
        'LOGIN',
        'LOGOUT',
        'PAYMENT_INITIATED',
        'PAYMENT_COMPLETED',
        'PAYMENT_FAILED',
        'ROLE_CHANGED'
      ]).optional(),
      resource: z.string().optional(),
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional()
    })

    const parsed = auditLogQuerySchema.safeParse(queryData)
    if (!parsed.success) {
      const { fieldErrors } = parsed.error.flatten()
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            details: fieldErrors
          }
        },
        { status: 400 }
      )
    }

    const { page = 1, limit = DEFAULT_PAGE_LIMIT, action, resource, startDate, endDate } = parsed.data

    // Build filter
    const filter: Record<string, unknown> = {}

    if (action) {
      filter.action = action
    }

    if (resource) {
      filter.resource = resource
    }

    if (startDate || endDate) {
      filter.createdAt = {}
      if (startDate) {
        // @ts-expect-error - We know we are setting $gte
        filter.createdAt.$gte = new Date(startDate)
      }
      if (endDate) {
        // @ts-expect-error - We know we are setting $lte
        filter.createdAt.$lte = new Date(endDate)
      }
    }

    // Count total
    const total = await AuditLog.countDocuments(filter)

    // Paginate
    const skip = (page - 1) * Math.min(limit, MAX_PAGE_LIMIT)
    const safeLimit = Math.min(limit, MAX_PAGE_LIMIT)

    const auditLogs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean()

    const pages = Math.ceil(total / safeLimit)

    return NextResponse.json({
      success: true,
      data: auditLogs,
      pagination: {
        total,
        page,
        limit: safeLimit,
        pages
      }
    })
  } catch (err) {
    console.error('Error fetching audit logs:', err)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch audit logs'
        }
      },
      { status: 500 }
    )
  }
}