import jwt, { SignOptions } from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET!
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d'

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET não está configurado nas variáveis de ambiente')
}
const COOKIE_NAME = 'auth_token'

export interface JWTPayload {
  userId: string
  email: string
  nome: string
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '30d'
  })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}

export async function setAuthCookie(response: NextResponse, token: string) {
  const cookieStore = await cookies()
  const isProduction = process.env.NODE_ENV === 'production'

  const daysMatch = JWT_EXPIRES_IN.match(/(\d+)d/)
  const maxAge = daysMatch ? parseInt(daysMatch[1]) * 24 * 60 * 60 : 30 * 24 * 60 * 60

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: maxAge,
    path: '/'
  })

  return response
}

export async function clearAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
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
