import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { logError } from '@/lib/logger'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {

    const user = await getCurrentUser()
    if (!user) {

      return NextResponse.json({
        liked: false,
        completed: false,
        inProgress: false,
        videoProgress: null
      })
    }

    const { slug } = await context.params

    const record = await prisma.usuarioCurso.findUnique({
      where: {
        usuarioId_cursoSlug: {
          usuarioId: user.userId,
          cursoSlug: slug
        }
      }
    })

    if (!record) {

      return NextResponse.json({
        liked: false,
        completed: false,
        inProgress: false,
        videoProgress: null
      })
    }

    return NextResponse.json({
      liked: record.liked,
      completed: record.completed,
      inProgress: record.inProgress,
      videoProgress: record.videoProgress,
      likedAt: record.likedAt,
      completedAt: record.completedAt,
      startedAt: record.startedAt,
      lastAccessedAt: record.lastAccessedAt
    })
  } catch (error) {
    logError('cursos/status', error)
    return NextResponse.json(
      { error: 'Erro ao buscar status' },
      { status: 500 }
    )
  }
}
