import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb/client'
import { User } from '@/models'
import { adminAuth } from '@/lib/firebase/admin'
import { requireSession } from '@/lib/session/get-session'
import { writeAuditLog } from '@/lib/audit/logger'
import { setRoleSchema } from '@/schemas/user.schema'
import { Types } from 'mongoose'

/**
 * PATCH /api/admin/users/[uid]/role
 * Update a user's role (admin or customer).
 * Requires admin role.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
): Promise<NextResponse> {
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
    const requester = await User.findOne({ uid: session.uid })
    if (!requester || requester.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Forbidden' } },
        { status: 403 }
      )
    }

    const routeParams = await params
    const { uid } = routeParams

    if (!Types.ObjectId.isValid(uid) && !/^[a-zA-Z0-9_-]+$/.test(uid)) {
      // Firebase UID is not a Mongo ObjectId, it's a string. We'll accept any string for uid.
      // We'll just check that it's not empty.
      if (!uid) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'User ID is required'
            }
          },
          { status: 400 }
        )
      }
    }

    const body = await request.json()
    const parsed = setRoleSchema.safeParse(body)

    if (!parsed.success) {
      const { fieldErrors } = parsed.error.flatten()
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid role data',
            details: fieldErrors
          }
        },
        { status: 400 }
      )
    }

    const { role } = parsed.data

    // Update Firebase custom claims
    await adminAuth.setCustomUserClaims(uid, { admin: role === 'admin' })

    // Update user role in MongoDB
    const updatedUser = await User.findOneAndUpdate(
      { uid },
      { $set: { role } },
      { new: true }
    )

    if (!updatedUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'User not found'
          }
        },
        { status: 404 }
      )
    }

    // Write audit log
    await writeAuditLog({
      actor: { uid: requester.uid, email: requester.email, role: requester.role },
      action: 'ROLE_CHANGED',
      resource: 'User',
      resourceId: uid,
      meta: {
        role: role
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        uid: updatedUser.uid,
        email: updatedUser.email,
        role: updatedUser.role
      }
    })
  } catch (error: unknown) {
    console.error('Error updating user role:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update user role'
        }
      },
      { status: 500 }
    )
  }
}