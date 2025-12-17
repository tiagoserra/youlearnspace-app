import { getRequestConfig } from 'next-intl/server'
import { headers } from 'next/headers'

export const locales = ['pt-BR', 'en-US', 'es-ES'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'pt-BR'

export default getRequestConfig(async () => {
  // Ler locale do header setado pelo proxy
  const headersList = await headers()
  const locale = headersList.get('x-next-intl-locale') || defaultLocale

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  }
})
