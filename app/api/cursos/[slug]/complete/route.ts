import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { csrfProtection } from '@/lib/csrf'
import { logError } from '@/lib/logger'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {

    const csrfError = csrfProtection(request)
    if (csrfError) return csrfError

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
          completed: !existingRecord.completed,
          completedAt: !existingRecord.completed ? new Date() : null,
          inProgress: false 
        }
      })

      return NextResponse.json({
        success: true,
        completed: updated.completed
      })
    } else {

      const created = await prisma.usuarioCurso.create({
        data: {
          usuarioId: user.userId,
          cursoSlug: slug,
          completed: true,
          completedAt: new Date(),
          inProgress: false
        }
      })

      return NextResponse.json({
        success: true,
        completed: created.completed
      })
    }
  } catch (error) {
    logError('cursos/complete', error)
    return NextResponse.json(
      { error: 'Erro ao marcar conclusão' },
      { status: 500 }
    )
  }
}
