import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SESSION_COOKIE_NAME } from './config/constants'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const publicPaths = ['/', '/auth/', '/api/auth/', '/_next/', '/favicon.ico', '/public/']
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))
  if (isPublicPath) return NextResponse.next()

  const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value

  if (!sessionCookie) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 }
      )
    }
    const loginUrl = new URL('/auth/login', req.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)',],
}