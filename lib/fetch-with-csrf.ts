let csrfToken: string | null = null

async function getCsrfToken(): Promise<string> {
  if (csrfToken) {
    return csrfToken
  }

  const response = await fetch('/api/csrf', {
    method: 'GET',
    credentials: 'include'
  })

  if (!response.ok) {
    throw new Error('Falha ao obter token CSRF')
  }

  const data = await response.json()
  csrfToken = data.csrfToken

  if (!csrfToken) {
    throw new Error('Token CSRF não recebido do servidor')
  }

  return csrfToken
}

export function clearCsrfToken(): void {
  csrfToken = null
}

export async function fetchWithCsrf(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getCsrfToken()

  const headers = new Headers(options.headers)
  headers.set('x-csrf-token', token)

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include'
  })

  if (response.status === 403) {
    const data = await response.clone().json()
    if (data.error?.includes('CSRF')) {
      clearCsrfToken()
      const newToken = await getCsrfToken()
      headers.set('x-csrf-token', newToken)
      return fetch(url, {
        ...options,
        headers,
        credentials: 'include'
      })
    }
  }

  return response
}
