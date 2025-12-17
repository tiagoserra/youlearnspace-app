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
          liked: !existingRecord.liked,
          likedAt: !existingRecord.liked ? new Date() : null
        }
      })

      return NextResponse.json({
        success: true,
        liked: updated.liked
      })
    } else {

      const created = await prisma.usuarioCurso.create({
        data: {
          usuarioId: user.userId,
          cursoSlug: slug,
          liked: true,
          likedAt: new Date()
        }
      })

      return NextResponse.json({
        success: true,
        liked: created.liked
      })
    }
  } catch (error) {
    logError('cursos/like', error)
    return NextResponse.json(
      { error: 'Erro ao alternar like' },
      { status: 500 }
    )
  }
}
