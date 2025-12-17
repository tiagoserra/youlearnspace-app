import { NextRequest, NextResponse } from 'next/server'
import {
  getRefreshTokenFromRequest,
  verifyRefreshToken,
  generateToken,
  generateRefreshToken,
  setRefreshCookie
} from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logError } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const refreshToken = getRefreshTokenFromRequest(request)

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token não fornecido' },
        { status: 401 }
      )
    }

    const payload = verifyRefreshToken(refreshToken)
    if (!payload) {
      return NextResponse.json(
        { error: 'Refresh token inválido ou expirado' },
        { status: 401 }
      )
    }

    const user = await prisma.usuario.findUnique({
      where: { id: payload.userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 401 }
      )
    }

    const newPayload = {
      userId: user.id,
      email: user.email,
      nome: user.nome
    }

    const newAccessToken = generateToken(newPayload)
    const newRefreshToken = generateRefreshToken(newPayload)

    const response = NextResponse.json({
      success: true,
      message: 'Tokens renovados com sucesso',
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email
      }
    })

    response.cookies.set('auth_token', newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 15 * 60,
      path: '/'
    })

    response.cookies.set('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/'
    })

    return response
  } catch (error) {
    logError('auth/refresh', error)
    return NextResponse.json(
      { error: 'Erro ao processar renovação de token' },
      { status: 500 }
    )
  }
}
