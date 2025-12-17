import { NextRequest, NextResponse } from 'next/server'

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}, 60000)

interface RateLimitConfig {
  maxRequests: number
  windowSeconds: number
  prefix: string
}

function getClientIdentifier(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  return request.headers.get('host') || 'unknown'
}

export function rateLimit(
  request: NextRequest,
  config: RateLimitConfig
): NextResponse | null {
  const { maxRequests, windowSeconds, prefix } = config
  const clientId = getClientIdentifier(request)
  const key = `${prefix}:${clientId}`
  const now = Date.now()
  const windowMs = windowSeconds * 1000

  const entry = rateLimitStore.get(key)

  if (!entry || entry.resetTime < now) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs
    })
    return null
  }

  if (entry.count >= maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000)

    return NextResponse.json(
      {
        error: 'Muitas requisições. Tente novamente mais tarde.',
        retryAfter
      },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.ceil(entry.resetTime / 1000).toString()
        }
      }
    )
  }

  entry.count++
  rateLimitStore.set(key, entry)

  return null
}

export const rateLimitConfigs = {
  login: {
    maxRequests: 5,
    windowSeconds: 60,
    prefix: 'login'
  },
  register: {
    maxRequests: 3,
    windowSeconds: 3600,
    prefix: 'register'
  },
  sugestao: {
    maxRequests: 5,
    windowSeconds: 3600,
    prefix: 'sugestao'
  },
  problema: {
    maxRequests: 10,
    windowSeconds: 3600,
    prefix: 'problema'
  },
  refresh: {
    maxRequests: 10,
    windowSeconds: 60,
    prefix: 'refresh'
  }
} as const

export function applyRateLimit(
  request: NextRequest,
  configName: keyof typeof rateLimitConfigs
): NextResponse | null {
  return rateLimit(request, rateLimitConfigs[configName])
}
