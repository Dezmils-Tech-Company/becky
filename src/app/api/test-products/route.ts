import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json({
    success: true,
    data: { message: 'Test products endpoint working' }
  })
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json({
    success: true,
    data: { message: 'Test products POST endpoint working' }
  }, { status: 201 })
}