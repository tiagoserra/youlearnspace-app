import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { logError } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    const history = await prisma.usuarioCurso.findMany({
      where: {
        usuarioId: user.userId,
        lastAccessedAt: {
          not: null
        }
      },
      orderBy: {
        lastAccessedAt: 'desc'
      },
      select: {
        cursoSlug: true,
        liked: true,
        completed: true,
        inProgress: true,
        lastAccessedAt: true,
        startedAt: true,
        videoProgress: true
      }
    })

    return NextResponse.json({
      success: true,
      cursos: history
    })
  } catch (error) {
    logError('cursos/history', error)
    return NextResponse.json(
      { error: 'Erro ao buscar histórico' },
      { status: 500 }
    )
  }
}
