import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value ||
                request.headers.get('authorization')?.replace('Bearer ', '')

  const { pathname } = request.nextUrl

  // Routes publiques
  const publicRoutes = ['/', '/signin', '/signup', '/login']
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route))

  // Si la route est publique, laisser passer
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Si pas de token et route protégée, rediriger vers signin
  if (!token) {
    const url = request.nextUrl.clone()
    url.pathname = '/signin'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ],
}
