'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAppSelector } from '@/lib/redux/hooks'
import YouTubeLayout from '@/components/layout/YouTubeLayout'
import LocaleSelector from '@/components/user/LocaleSelector'
import styles from './perfil.module.css'

export default function PerfilPage() {
  const t = useTranslations('profile')
  const pathname = usePathname()
  const { isAuthenticated, isLoading, user } = useAppSelector((state) => state.auth)
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <YouTubeLayout currentPath={pathname}>
        <div className={styles.container}>
          <div className={styles.loading}>{t('loading')}</div>
        </div>
      </YouTubeLayout>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <YouTubeLayout currentPath={pathname}>
      <div className={styles.container}>
        <h1>{t('title')}</h1>

        <section className={styles.section}>
          <h2>{t('accountInfo')}</h2>
          <div className={styles.infoRow}>
            <span className={styles.label}>{t('name')}:</span>
            <span>{user.nome}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>{t('email')}:</span>
            <span>{user.email}</span>
          </div>
        </section>

        <section className={styles.section}>
          <h2>{t('preferences')}</h2>
          <LocaleSelector />
        </section>
      </div>
    </YouTubeLayout>
  )
}
