import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { generateToken, generateRefreshToken, setAuthCookie, setRefreshCookie } from '@/lib/auth'
import { verifyRecaptcha } from '@/lib/recaptcha'
import { logError } from '@/lib/logger'
import { applyRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const rateLimitError = applyRateLimit(request, 'login')
    if (rateLimitError) return rateLimitError

    const { email, senha, recaptchaToken } = await request.json()

    if (!email || !senha) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    if (!recaptchaToken) {
      return NextResponse.json(
        { error: 'Por favor, complete o reCAPTCHA' },
        { status: 400 }
      )
    }

    const isRecaptchaValid = await verifyRecaptcha(recaptchaToken)
    if (!isRecaptchaValid) {
      return NextResponse.json(
        { error: 'Falha na validação do reCAPTCHA' },
        { status: 400 }
      )
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email: email.toLowerCase().trim() }
    })

    if (!usuario) {
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      )
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha)
    if (!senhaValida) {
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      )
    }

    const payload = {
      userId: usuario.id,
      email: usuario.email,
      nome: usuario.nome
    }

    const token = generateToken(payload)
    const refreshToken = generateRefreshToken(payload)

    const response = NextResponse.json(
      {
        success: true,
        message: 'Login realizado com sucesso!',
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          theme: usuario.theme,
          locale: usuario.locale
        }
      },
      { status: 200 }
    )

    await setAuthCookie(response, token)
    await setRefreshCookie(refreshToken)

    response.cookies.set('NEXT_LOCALE', usuario.locale, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 365
    })

    return response
  } catch (error) {
    logError('auth/login', error)
    return NextResponse.json(
      { error: 'Erro ao processar login. Tente novamente mais tarde.' },
      { status: 500 }
    )
  }
}
