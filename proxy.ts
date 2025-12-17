import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAuthTokenFromRequest, verifyToken } from '@/lib/auth'
import { defaultLocale } from './i18n'

const protectedRoutes: string[] = [
  '/curtidos',
  '/historico',
  '/perfil'
]

const authRoutes: string[] = ['/login', '/cadastro']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const token = getAuthTokenFromRequest(request)
  const user = token ? verifyToken(token) : null
  const isAuthenticated = !!user

  if (isAuthenticated && authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (!isAuthenticated && protectedRoutes.some(route => pathname.startsWith(route))) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Obter locale do cookie ou usar padrão
  const locale = request.cookies.get('NEXT_LOCALE')?.value || defaultLocale

  const response = NextResponse.next()

  // Setar locale no header para next-intl
  response.headers.set('x-next-intl-locale', locale)

  if (user) {
    response.headers.set('x-user-id', user.userId)
    response.headers.set('x-user-email', user.email)
    response.headers.set('x-user-nome', user.nome)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes - exceto /api/auth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|images/).*)',
  ]
}
