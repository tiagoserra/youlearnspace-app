import { NextRequest, NextResponse } from 'next/server'
import { clearAuthCookie } from '@/lib/auth'
import { csrfProtection } from '@/lib/csrf'
import { logError } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {

    const csrfError = csrfProtection(request)
    if (csrfError) return csrfError

    await clearAuthCookie()

    return NextResponse.json(
      {
        success: true,
        message: 'Logout realizado com sucesso!'
      },
      { status: 200 }
    )
  } catch (error) {
    logError('auth/logout', error)
    return NextResponse.json(
      { error: 'Erro ao processar logout' },
      { status: 500 }
    )
  }
}
