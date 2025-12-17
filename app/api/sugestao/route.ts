import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthTokenFromRequest, verifyToken } from '@/lib/auth'

async function verifyRecaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY

  if (!secretKey) {
    console.error('RECAPTCHA_SECRET_KEY não está configurado')
    return false
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${secretKey}&response=${token}`
    })

    const data = await response.json()
    return data.success === true
  } catch (error) {
    console.error('Erro ao verificar reCAPTCHA:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {

    const token = getAuthTokenFromRequest(request)
    if (!token) {
      return NextResponse.json(
        { error: 'Não autenticado. Faça login para sugerir um curso.' },
        { status: 401 }
      )
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 401 }
      )
    }

    const data = await request.json()

    if (!data.tituloSugestao || !data.urlCurso || !data.categoria || !data.descricao) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      )
    }

    if (!data.recaptchaToken) {
      return NextResponse.json(
        { error: 'reCAPTCHA não fornecido' },
        { status: 400 }
      )
    }

    const recaptchaValid = await verifyRecaptcha(data.recaptchaToken)
    if (!recaptchaValid) {
      return NextResponse.json(
        { error: 'Verificação reCAPTCHA falhou. Tente novamente.' },
        { status: 400 }
      )
    }

    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/
    if (!youtubeRegex.test(data.urlCurso)) {
      return NextResponse.json(
        { error: 'URL do YouTube inválida' },
        { status: 400 }
      )
    }

    const sugestao = await prisma.sugestao.create({
      data: {
        usuarioId: user.userId,
        tituloSugestao: data.tituloSugestao.trim(),
        urlCurso: data.urlCurso.trim(),
        categoria: data.categoria,
        descricao: data.descricao.trim()
      }
    })

    console.log('Sugestão salva no banco:', sugestao.id)

    return NextResponse.json(
      {
        success: true,
        message: 'Sugestão recebida com sucesso!',
        id: sugestao.id
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao processar sugestão:', error)
    return NextResponse.json(
      { error: 'Erro ao processar sugestão. Tente novamente mais tarde.' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const sugestoes = await prisma.sugestao.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ sugestoes }, { status: 200 })
  } catch (error) {
    console.error('Erro ao buscar sugestões:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar sugestões' },
      { status: 500 }
    )
  }
}
