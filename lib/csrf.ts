import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const CSRF_COOKIE_NAME = 'csrf_token'
const CSRF_HEADER_NAME = 'x-csrf-token'

export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export async function setCsrfCookie(response: NextResponse, token: string): Promise<void> {
  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24
  })
}

export async function getCsrfTokenFromCookie(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(CSRF_COOKIE_NAME)?.value || null
}

export function getCsrfTokenFromRequest(request: NextRequest): string | null {
  const headerToken = request.headers.get(CSRF_HEADER_NAME)
  if (headerToken) return headerToken
  return null
}

export function getCsrfTokenFromCookieRequest(request: NextRequest): string | null {
  return request.cookies.get(CSRF_COOKIE_NAME)?.value || null
}

export function validateCsrfToken(request: NextRequest): boolean {
  const cookieToken = getCsrfTokenFromCookieRequest(request)
  const headerToken = getCsrfTokenFromRequest(request)

  if (!cookieToken || !headerToken) {
    return false
  }

  try {
    return crypto.timingSafeEqual(
      Buffer.from(cookieToken),
      Buffer.from(headerToken)
    )
  } catch {
    return false
  }
}

export function csrfProtection(request: NextRequest): NextResponse | null {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS']
  if (safeMethods.includes(request.method)) {
    return null
  }

  if (!validateCsrfToken(request)) {
    return NextResponse.json(
      { error: 'Token CSRF inválido ou ausente' },
      { status: 403 }
    )
  }

  return null
}
