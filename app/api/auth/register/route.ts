import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { verifyRecaptcha } from '@/lib/recaptcha'
import { generateToken, generateRefreshToken, setAuthCookie, setRefreshCookie } from '@/lib/auth'
import { logError } from '@/lib/logger'
import { applyRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const rateLimitError = applyRateLimit(request, 'register')
    if (rateLimitError) return rateLimitError

    const { nome, email, senha, confirmarSenha, recaptchaToken, locale } = await request.json()

    if (!nome || !email || !senha || !confirmarSenha) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    const allowedLocales = ['pt-BR', 'en-US', 'es-ES']
    const userLocale = locale && allowedLocales.includes(locale) ? locale : 'pt-BR'

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

    if (nome.trim().length < 3 || nome.trim().length > 100) {
      return NextResponse.json(
        { error: 'Nome deve ter entre 3 e 100 caracteres' },
        { status: 400 }
      )
    }

    const emailRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+$/
    const trimmedEmail = email.trim().toLowerCase()

    if (!emailRegex.test(trimmedEmail) || trimmedEmail.length > 254) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    if (senha.length < 12 || senha.length > 50) {
      return NextResponse.json(
        { error: 'Senha deve ter entre 12 e 50 caracteres' },
        { status: 400 }
      )
    }

    const hasUppercase = /[A-Z]/.test(senha)
    const hasLowercase = /[a-z]/.test(senha)
    const hasNumber = /[0-9]/.test(senha)
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(senha)

    if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecialChar) {
      return NextResponse.json(
        { error: 'Senha deve conter letras maiúsculas, minúsculas, números e caracteres especiais' },
        { status: 400 }
      )
    }

    if (senha !== confirmarSenha) {
      return NextResponse.json(
        { error: 'As senhas não coincidem' },
        { status: 400 }
      )
    }

    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email: email.toLowerCase().trim() }
    })

    if (usuarioExistente) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 409 }
      )
    }

    const senhaHash = await bcrypt.hash(senha, 10)

    const novoUsuario = await prisma.usuario.create({
      data: {
        nome: nome.trim(),
        email: email.toLowerCase().trim(),
        senha: senhaHash,
        locale: userLocale
      },
      select: {
        id: true,
        nome: true,
        email: true,
        locale: true,
        createdAt: true
      }
    })

    const payload = {
      userId: novoUsuario.id,
      email: novoUsuario.email,
      nome: novoUsuario.nome
    }

    const token = generateToken(payload)
    const refreshToken = generateRefreshToken(payload)

    const response = NextResponse.json(
      {
        success: true,
        message: 'Cadastro realizado com sucesso!',
        usuario: {
          id: novoUsuario.id,
          nome: novoUsuario.nome,
          email: novoUsuario.email
        }
      },
      { status: 201 }
    )

    await setAuthCookie(response, token)
    await setRefreshCookie(refreshToken)

    response.cookies.set('NEXT_LOCALE', userLocale, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 365
    })

    return response
  } catch (error) {
    logError('auth/register', error)
    return NextResponse.json(
      { error: 'Erro ao processar cadastro. Tente novamente mais tarde.' },
      { status: 500 }
    )
  }
}
