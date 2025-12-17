import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    const likedCursos = await prisma.usuarioCurso.findMany({
      where: {
        usuarioId: user.userId,
        liked: true
      },
      orderBy: {
        likedAt: 'desc'
      },
      select: {
        cursoSlug: true,
        liked: true,
        likedAt: true,
        completed: true,
        inProgress: true
      }
    })

    return NextResponse.json({
      success: true,
      cursos: likedCursos
    })
  } catch (error) {
    console.error('Erro ao buscar cursos curtidos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar cursos curtidos' },
      { status: 500 }
    )
  }
}
