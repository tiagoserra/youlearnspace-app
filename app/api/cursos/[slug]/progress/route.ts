import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

interface ProgressData {
  currentTime: number
  duration: number
  lastUpdated: string
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    const { slug } = await context.params
    const body = await request.json()
    const { currentTime, duration } = body

    if (typeof currentTime !== 'number' || typeof duration !== 'number') {
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      )
    }

    const progressData: ProgressData = {
      currentTime,
      duration,
      lastUpdated: new Date().toISOString()
    }

    const existingRecord = await prisma.usuarioCurso.findUnique({
      where: {
        usuarioId_cursoSlug: {
          usuarioId: user.userId,
          cursoSlug: slug
        }
      }
    })

    if (existingRecord) {

      await prisma.usuarioCurso.update({
        where: {
          usuarioId_cursoSlug: {
            usuarioId: user.userId,
            cursoSlug: slug
          }
        },
        data: {
          videoProgress: progressData as any,
          lastAccessedAt: new Date(),
          inProgress: true,
          startedAt: existingRecord.startedAt || new Date()
        }
      })
    } else {

      await prisma.usuarioCurso.create({
        data: {
          usuarioId: user.userId,
          cursoSlug: slug,
          videoProgress: progressData as any,
          lastAccessedAt: new Date(),
          inProgress: true,
          startedAt: new Date()
        }
      })
    }

    return NextResponse.json({
      success: true,
      progress: progressData
    })
  } catch (error) {
    console.error('Erro ao salvar progresso:', error)
    return NextResponse.json(
      { error: 'Erro ao salvar progresso' },
      { status: 500 }
    )
  }
}
