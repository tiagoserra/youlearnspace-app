import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthTokenFromRequest, verifyToken } from '@/lib/auth'
import { csrfProtection } from '@/lib/csrf'
import { logError } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {

    const csrfError = csrfProtection(request)
    if (csrfError) return csrfError

    const token = getAuthTokenFromRequest(request)
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Não autenticado' },
        { status: 401 }
      )
    }
    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Token inválido' },
        { status: 401 }
      )
    }

    const { locale } = await request.json()

    const allowedLocales = ['pt-BR', 'en-US', 'es-ES']
    if (!allowedLocales.includes(locale)) {
      return NextResponse.json(
        { success: false, message: 'Locale inválido' },
        { status: 400 }
      )
    }

    await prisma.usuario.update({
      where: { id: user.userId },
      data: { locale }
    })

    const response = NextResponse.json({ success: true })

    response.cookies.set('NEXT_LOCALE', locale, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 365
    })

    return response
  } catch (error) {
    logError('auth/locale', error)
    return NextResponse.json(
      { success: false, message: 'Erro ao atualizar idioma' },
      { status: 500 }
    )
  }
}
