import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthTokenFromRequest, verifyToken } from '@/lib/auth'
import { csrfProtection } from '@/lib/csrf'
import { validateDescription } from '@/lib/validation'
import { logError, logWarn, logInfo } from '@/lib/logger'
import { applyRateLimit } from '@/lib/rate-limit'

async function verifyRecaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY

  if (!secretKey) {
    logWarn('problema/recaptcha', 'RECAPTCHA_SECRET_KEY não está configurado')
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
    logError('problema/recaptcha', error)
    return false
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const rateLimitError = applyRateLimit(request, 'problema')
    if (rateLimitError) return rateLimitError

    const csrfError = csrfProtection(request)
    if (csrfError) return csrfError

    const token = getAuthTokenFromRequest(request)
    if (!token) {
      return NextResponse.json(
        { error: 'Não autenticado. Faça login para relatar um problema.' },
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

    const params = await context.params
    const slug = params.slug

    const body = await request.json()
    const { cursoId, descricao, recaptchaToken } = body

    if (!cursoId || typeof cursoId !== 'string') {
      return NextResponse.json(
        { error: 'ID do curso é obrigatório' },
        { status: 400 }
      )
    }

    const descricaoValidation = validateDescription(descricao, 'Descrição do problema', 512)
    if (!descricaoValidation.valid) {
      return NextResponse.json(
        { error: descricaoValidation.error },
        { status: 400 }
      )
    }
    const sanitizedDescricao = descricaoValidation.sanitized

    if (!recaptchaToken) {
      return NextResponse.json(
        { error: 'reCAPTCHA não fornecido' },
        { status: 400 }
      )
    }

    const recaptchaValid = await verifyRecaptcha(recaptchaToken)
    if (!recaptchaValid) {
      return NextResponse.json(
        { error: 'Verificação reCAPTCHA falhou. Tente novamente.' },
        { status: 400 }
      )
    }

    const problema = await prisma.cursoProblema.create({
      data: {
        usuarioId: user.userId,
        cursoId,
        descricao: sanitizedDescricao
      }
    })

    logInfo('problema/POST', `Problema reportado: ${problema.id}, Curso: ${cursoId}, Slug: ${slug}`)

    return NextResponse.json(
      {
        success: true,
        message: 'Problema reportado com sucesso. Obrigado pelo feedback!',
        id: problema.id
      },
      { status: 201 }
    )
  } catch (error) {
    logError('problema/POST', error)
    return NextResponse.json(
      { error: 'Erro ao processar solicitação. Tente novamente mais tarde.' },
      { status: 500 }
    )
  }
}
