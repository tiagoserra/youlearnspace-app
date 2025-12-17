import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { generateToken, setAuthCookie } from '@/lib/auth'
import { verifyRecaptcha } from '@/lib/recaptcha'

export async function POST(request: NextRequest) {
  try {
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

    const token = generateToken({
      userId: usuario.id,
      email: usuario.email,
      nome: usuario.nome
    })

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

    // Setar cookie de locale
    response.cookies.set('NEXT_LOCALE', usuario.locale, {
      httpOnly: false, // Precisa ser acessível no cliente
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 365 // 1 ano
    })

    return response
  } catch (error) {
    console.error('Erro ao fazer login:', error)
    return NextResponse.json(
      { error: 'Erro ao processar login. Tente novamente mais tarde.' },
      { status: 500 }
    )
  }
}
