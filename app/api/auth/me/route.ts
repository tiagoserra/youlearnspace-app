import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const fullUser = await prisma.usuario.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        nome: true,
        email: true,
        theme: true,
        locale: true
      }
    })

    if (!fullUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        usuario: {
          id: fullUser.id,
          nome: fullUser.nome,
          email: fullUser.email,
          theme: fullUser.theme,
          locale: fullUser.locale
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao obter usuário:', error)
    return NextResponse.json(
      { error: 'Erro ao obter informações do usuário' },
      { status: 500 }
    )
  }
}
