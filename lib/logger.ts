const isProduction = process.env.NODE_ENV === 'production'

function getSafeErrorInfo(error: unknown): string {
  if (error instanceof Error) {
    if (isProduction) {
      return `${error.name}: ${error.message}`
    }
    return error.stack || `${error.name}: ${error.message}`
  }

  if (typeof error === 'string') {
    return error
  }

  return 'Unknown error'
}

export function logError(context: string, error: unknown): void {
  const safeError = getSafeErrorInfo(error)
  const timestamp = new Date().toISOString()

  if (isProduction) {
    console.error(JSON.stringify({
      timestamp,
      context,
      error: safeError
    }))
  } else {
    console.error(`[${timestamp}] ${context}:`, error)
  }
}

export function logWarn(context: string, message: string): void {
  const timestamp = new Date().toISOString()

  if (isProduction) {
    console.warn(JSON.stringify({
      timestamp,
      context,
      message
    }))
  } else {
    console.warn(`[${timestamp}] ${context}: ${message}`)
  }
}

export function logInfo(context: string, message: string): void {
  if (!isProduction) {
    const timestamp = new Date().toISOString()
    console.info(`[${timestamp}] ${context}: ${message}`)
  }
}
