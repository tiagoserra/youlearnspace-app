import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthTokenFromRequest, verifyToken } from '@/lib/auth'
import { csrfProtection } from '@/lib/csrf'
import { validateTitle, validateDescription, validateYouTubeUrl, validateCategory } from '@/lib/validation'
import { logError, logWarn } from '@/lib/logger'
import { applyRateLimit } from '@/lib/rate-limit'

async function verifyRecaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY

  if (!secretKey) {
    logWarn('sugestao/recaptcha', 'RECAPTCHA_SECRET_KEY não está configurado')
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
    logError('sugestao/recaptcha', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const rateLimitError = applyRateLimit(request, 'sugestao')
    if (rateLimitError) return rateLimitError

    const csrfError = csrfProtection(request)
    if (csrfError) return csrfError

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

    const tituloValidation = validateTitle(data.tituloSugestao, 'Título da sugestão')
    if (!tituloValidation.valid) {
      return NextResponse.json(
        { error: tituloValidation.error },
        { status: 400 }
      )
    }

    const urlValidation = validateYouTubeUrl(data.urlCurso)
    if (!urlValidation.valid) {
      return NextResponse.json(
        { error: urlValidation.error },
        { status: 400 }
      )
    }

    const categoriaValidation = validateCategory(data.categoria)
    if (!categoriaValidation.valid) {
      return NextResponse.json(
        { error: categoriaValidation.error },
        { status: 400 }
      )
    }

    const descricaoValidation = validateDescription(data.descricao, 'Descrição', 1000)
    if (!descricaoValidation.valid) {
      return NextResponse.json(
        { error: descricaoValidation.error },
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

    const sugestao = await prisma.sugestao.create({
      data: {
        usuarioId: user.userId,
        tituloSugestao: tituloValidation.sanitized,
        urlCurso: data.urlCurso.trim(),
        categoria: data.categoria,
        descricao: descricaoValidation.sanitized
      }
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Sugestão recebida com sucesso!',
        id: sugestao.id
      },
      { status: 201 }
    )
  } catch (error) {
    logError('sugestao/POST', error)
    return NextResponse.json(
      { error: 'Erro ao processar sugestão. Tente novamente mais tarde.' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = getAuthTokenFromRequest(request)
    if (!token) {
      return NextResponse.json(
        { error: 'Não autenticado' },
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

    const sugestoes = await prisma.sugestao.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ sugestoes }, { status: 200 })
  } catch (error) {
    logError('sugestao/GET', error)
    return NextResponse.json(
      { error: 'Erro ao buscar sugestões' },
      { status: 500 }
    )
  }
}
