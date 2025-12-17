import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET!
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || `${JWT_SECRET}_refresh`
const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m'
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET não está configurado nas variáveis de ambiente')
}

const COOKIE_NAME = 'auth_token'
const REFRESH_COOKIE_NAME = 'refresh_token'

export interface JWTPayload {
  userId: string
  email: string
  nome: string
}

interface RefreshTokenPayload extends JWTPayload {
  type: 'refresh'
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN
  } as jwt.SignOptions)
}

export function generateRefreshToken(payload: JWTPayload): string {
  const refreshPayload: RefreshTokenPayload = { ...payload, type: 'refresh' }
  return jwt.sign(refreshPayload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN
  } as jwt.SignOptions)
}

export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET) as RefreshTokenPayload
    if (decoded.type !== 'refresh') {
      console.warn('[AUTH] Invalid refresh token type')
      return null
    }
    return {
      userId: decoded.userId,
      email: decoded.email,
      nome: decoded.nome
    }
  } catch (error) {
    const errorType = error instanceof jwt.TokenExpiredError
      ? 'REFRESH_TOKEN_EXPIRED'
      : error instanceof jwt.JsonWebTokenError
        ? 'INVALID_REFRESH_TOKEN'
        : 'REFRESH_VERIFICATION_ERROR'
    console.warn(`[AUTH] Refresh token verification failed: ${errorType}`)
    return null
  }
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    const errorType = error instanceof jwt.TokenExpiredError
      ? 'TOKEN_EXPIRED'
      : error instanceof jwt.JsonWebTokenError
        ? 'INVALID_TOKEN'
        : 'VERIFICATION_ERROR'
    console.warn(`[AUTH] JWT verification failed: ${errorType}`)
    return null
  }
}

function parseExpirationToSeconds(expiration: string): number {
  const match = expiration.match(/^(\d+)(m|h|d)$/)
  if (!match) return 15 * 60

  const value = parseInt(match[1])
  const unit = match[2]

  switch (unit) {
    case 'm': return value * 60
    case 'h': return value * 60 * 60
    case 'd': return value * 24 * 60 * 60
    default: return 15 * 60
  }
}

export async function setAuthCookie(response: NextResponse, token: string) {
  const cookieStore = await cookies()
  const maxAge = parseExpirationToSeconds(ACCESS_TOKEN_EXPIRES_IN)

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: maxAge,
    path: '/'
  })

  return response
}

export async function setRefreshCookie(refreshToken: string) {
  const cookieStore = await cookies()
  const maxAge = parseExpirationToSeconds(REFRESH_TOKEN_EXPIRES_IN)

  cookieStore.set(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: maxAge,
    path: '/'
  })
}

export async function clearAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
  cookieStore.delete(REFRESH_COOKIE_NAME)
}

export async function getRefreshToken(): Promise<string | null> {
  const cookieStore = await cookies()
  const cookie = cookieStore.get(REFRESH_COOKIE_NAME)
  return cookie?.value || null
}

export function getRefreshTokenFromRequest(request: NextRequest): string | null {
  return request.cookies.get(REFRESH_COOKIE_NAME)?.value || null
}

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies()
  const cookie = cookieStore.get(COOKIE_NAME)
  return cookie?.value || null
}

export async function getCurrentUser(): Promise<JWTPayload | null> {
  const token = await getAuthToken()
  if (!token) return null
  return verifyToken(token)
}

export function getAuthTokenFromRequest(request: NextRequest): string | null {
  return request.cookies.get(COOKIE_NAME)?.value || null
}

export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser()
  return user !== null
}
