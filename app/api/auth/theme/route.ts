import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { csrfProtection } from '@/lib/csrf'
import { logError } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {

    const csrfError = csrfProtection(request)
    if (csrfError) return csrfError

    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { theme } = body

    if (!theme || !['light', 'dark', 'system'].includes(theme)) {
      return NextResponse.json(
        { error: 'Tema inválido. Use: light, dark ou system' },
        { status: 400 }
      )
    }

    await prisma.usuario.update({
      where: { id: user.userId },
      data: { theme }
    })

    return NextResponse.json(
      { message: 'Tema atualizado com sucesso', theme },
      { status: 200 }
    )
  } catch (error) {
    logError('auth/theme', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar tema' },
      { status: 500 }
    )
  }
}
