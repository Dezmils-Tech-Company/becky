import { NextRequest, NextResponse } from 'next/server'
import { requireSession } from '@/lib/session/get-session'
import { connectDB } from '@/lib/mongodb/client'
import { User } from '@/models'
import { getAdminStats } from '@/lib/admin/get-admin-stats'

interface RouteParams {}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
): Promise<NextResponse> {
  try {
    // Check session and require admin role
    const session = await requireSession(request)
    await connectDB()
    const user = await User.findOne({ uid: session.uid })
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Forbidden' } },
        { status: 403 }
      )
    }

    const stats = await getAdminStats()

    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error: unknown) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch statistics' }
      },
      { status: 500 }
    )
  }
}