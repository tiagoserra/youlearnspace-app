import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthTokenFromRequest, verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
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

    // Validar locale
    const allowedLocales = ['pt-BR', 'en-US', 'es-ES']
    if (!allowedLocales.includes(locale)) {
      return NextResponse.json(
        { success: false, message: 'Locale inválido' },
        { status: 400 }
      )
    }

    // Atualizar no banco
    await prisma.usuario.update({
      where: { id: user.userId },
      data: { locale }
    })

    const response = NextResponse.json({ success: true })

    // Atualizar cookie
    response.cookies.set('NEXT_LOCALE', locale, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 365
    })

    return response
  } catch (error: any) {
    if (error.message === 'Token inválido ou expirado') {
      return NextResponse.json(
        { success: false, message: 'Não autenticado' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Erro ao atualizar idioma' },
      { status: 500 }
    )
  }
}
