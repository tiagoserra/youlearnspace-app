export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
}

export function hasValidContent(text: string): boolean {
  const alphanumeric = text.replace(/[^a-zA-Z0-9\u00C0-\u017F]/g, '')
  return alphanumeric.length >= 3
}

export function validateLength(text: string, min: number, max: number): { valid: boolean; error?: string } {
  const trimmed = text.trim()
  if (trimmed.length < min) {
    return { valid: false, error: `Texto deve ter no mínimo ${min} caracteres` }
  }
  if (trimmed.length > max) {
    return { valid: false, error: `Texto deve ter no máximo ${max} caracteres` }
  }
  return { valid: true }
}

export function validateTextField(
  text: string,
  fieldName: string,
  options: { minLength?: number; maxLength?: number; required?: boolean } = {}
): { valid: boolean; sanitized: string; error?: string } {
  const { minLength = 10, maxLength = 1000, required = true } = options

  if (!text || !text.trim()) {
    if (required) {
      return { valid: false, sanitized: '', error: `${fieldName} é obrigatório` }
    }
    return { valid: true, sanitized: '' }
  }

  const sanitized = sanitizeInput(text)

  const lengthValidation = validateLength(sanitized, minLength, maxLength)
  if (!lengthValidation.valid) {
    return { valid: false, sanitized, error: `${fieldName}: ${lengthValidation.error}` }
  }

  if (!hasValidContent(sanitized)) {
    return { valid: false, sanitized, error: `${fieldName} deve conter texto válido (letras e números)` }
  }

  return { valid: true, sanitized }
}

export function validateTitle(
  text: string,
  fieldName: string = 'Título'
): { valid: boolean; sanitized: string; error?: string } {
  return validateTextField(text, fieldName, { minLength: 5, maxLength: 200 })
}

export function validateDescription(
  text: string,
  fieldName: string = 'Descrição',
  maxLength: number = 512
): { valid: boolean; sanitized: string; error?: string } {
  return validateTextField(text, fieldName, { minLength: 10, maxLength })
}

export function validateYouTubeUrl(url: string): { valid: boolean; error?: string } {
  if (!url || !url.trim()) {
    return { valid: false, error: 'URL do YouTube é obrigatória' }
  }

  const sanitizedUrl = sanitizeInput(url)
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/playlist\?list=)[a-zA-Z0-9_-]+(&.*)?$/

  if (!youtubeRegex.test(sanitizedUrl)) {
    return { valid: false, error: 'URL do YouTube inválida. Use o formato: youtube.com/watch?v=... ou youtu.be/...' }
  }

  return { valid: true }
}

export function validateCategory(categoria: string): { valid: boolean; error?: string } {
  const validCategories = [
    'Front-end',
    'Back-end',
    'Mobile',
    'Data Science',
    'DevOps',
    'Design',
    'Soft Skills'
  ]

  if (!categoria || !validCategories.includes(categoria)) {
    return { valid: false, error: `Categoria inválida. Use: ${validCategories.join(', ')}` }
  }

  return { valid: true }
}
