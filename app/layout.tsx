import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { DarkModeProvider } from '@/context/DarkModeContext'
import { ReduxProvider } from '@/lib/redux/ReduxProvider'
import { ToastProvider } from '@/context/ToastContext'
import ToastContainer from '@/components/ui/Toast'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'YouLearnSpace - Você Aprende com YouTube',
    template: '%s | YouLearnSpace'
  },
  icons: {
    icon: '/images/youlearnspace-icon.png'
  },
  description: 'Plataforma de curadoria de cursos gratuitos do YouTube. Aprenda programação, design, soft skills e muito mais com conteúdo de qualidade selecionado.',
  keywords: ['cursos gratuitos', 'YouTube', 'educação', 'programação', 'front-end', 'back-end', 'desenvolvimento web', 'aprendizado online', 'tecnologia', 'design', 'soft skills'],
  authors: [{ name: 'YouLearnSpace' }],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://www.youlearnspace.com.br',
    siteName: 'YouLearnSpace',
    images: [
      {
        url: '/images/youlearnspace.png',
        width: 1200,
        height: 630,
        alt: 'YouLearnSpace'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YouLearnSpace',
    description: 'Plataforma de curadoria de cursos gratuitos do YouTube',
    images: ['/images/youlearnspace.png']
  },
  robots: {
    index: true,
    follow: true
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const messages = await getMessages()

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const saved = localStorage.getItem('youlearnspace-dark-mode')
                  const isDark = saved === 'true' ||
                    (saved === null && window.matchMedia('(prefers-color-scheme: dark)').matches)
                  if (isDark) {
                    document.documentElement.classList.add('dark-mode')
                  }
                } catch (e) {}
              })()
            `
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <ReduxProvider>
            <DarkModeProvider>
              <ToastProvider>
                {children}
                <ToastContainer />
              </ToastProvider>
            </DarkModeProvider>
          </ReduxProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
