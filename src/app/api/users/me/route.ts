import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { updateProfileSchema } from '@/schemas/user.schema'
import { requireSession } from '@/lib/session/get-session'
import { writeAuditLog } from '@/lib/audit/logger'
import { connectDB } from '@/lib/mongodb/client'
import { User } from '@/models'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await requireSession(request)
    await connectDB()

    const user = await User.findOne({ uid: session.uid })
      .select('-__v') // exclude __v if exists
      .lean()

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      )
    }

    // Return user data without sensitive fields (like password, but we don't have password in User model)
    // The User model doesn't have password field because auth is handled by Firebase.
    // We'll return the user object as is, but we can omit any fields we don't want to expose.
    // For safety, we can omit email if we want, but the frontend likely needs email.
    // We'll return the whole user doc (excluding __v) as it doesn't have password.

    return NextResponse.json({
      success: true,
      data: user
    })
  } catch (error: unknown) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch profile' } },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await requireSession(request)
    await connectDB()

    const body = await request.json()
    const parsed = updateProfileSchema.parse(body)

    const updateData: any = {}
    if (parsed.displayName !== undefined) updateData.displayName = parsed.displayName
    if (parsed.phone !== undefined) updateData.phone = parsed.phone
    if (parsed.address !== undefined) updateData.address = parsed.address

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'No fields to update' } },
        { status: 400 }
      )
    }

    const user = await User.findOneAndUpdate(
      { uid: session.uid },
      { $set: updateData },
      { new: true, runValidators: true }
    )

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      )
    }

    // Write audit log
    await writeAuditLog({
      actor: { uid: session.uid, email: user.email, role: user.role },
      action: 'UPDATE',
      resource: 'User',
      resourceId: user.uid,
      meta: {
        updatedFields: Object.keys(parsed),
        // We don't include the actual values in meta to avoid PII
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: user._id,
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        phone: user.phone,
        address: user.address,
      }
    })
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid request body', details: error.issues }
        },
        { status: 400 }
      )
    }

    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update profile' } },
      { status: 500 }
    )
  }
}