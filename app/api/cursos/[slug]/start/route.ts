import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { logError } from '@/lib/logger'

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

    const existingRecord = await prisma.usuarioCurso.findUnique({
      where: {
        usuarioId_cursoSlug: {
          usuarioId: user.userId,
          cursoSlug: slug
        }
      }
    })

    if (existingRecord) {

      const updated = await prisma.usuarioCurso.update({
        where: {
          usuarioId_cursoSlug: {
            usuarioId: user.userId,
            cursoSlug: slug
          }
        },
        data: {
          inProgress: true,
          startedAt: existingRecord.startedAt || new Date(),
          lastAccessedAt: new Date()
        }
      })

      return NextResponse.json({
        success: true,
        inProgress: updated.inProgress
      })
    } else {

      const created = await prisma.usuarioCurso.create({
        data: {
          usuarioId: user.userId,
          cursoSlug: slug,
          inProgress: true,
          startedAt: new Date(),
          lastAccessedAt: new Date()
        }
      })

      return NextResponse.json({
        success: true,
        inProgress: created.inProgress
      })
    }
  } catch (error) {
    logError('cursos/start', error)
    return NextResponse.json(
      { error: 'Erro ao marcar início' },
      { status: 500 }
    )
  }
}
