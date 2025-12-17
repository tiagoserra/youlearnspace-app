import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { verifyRecaptcha } from '@/lib/recaptcha'

export async function POST(request: NextRequest) {
  try {
    const { nome, email, senha, confirmarSenha, recaptchaToken, locale } = await request.json()

    if (!nome || !email || !senha || !confirmarSenha) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar e definir locale
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    if (senha.length < 8 || senha.length > 50) {
      return NextResponse.json(
        { error: 'Senha deve ter entre 8 e 50 caracteres' },
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

    // Setar cookie de locale
    response.cookies.set('NEXT_LOCALE', userLocale, {
      httpOnly: false, // Precisa ser acessível no cliente
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 365 // 1 ano
    })

    return response
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error)
    return NextResponse.json(
      { error: 'Erro ao processar cadastro. Tente novamente mais tarde.' },
      { status: 500 }
    )
  }
}
