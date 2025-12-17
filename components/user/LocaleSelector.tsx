'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks'
import { setUser } from '@/lib/redux/slices/authSlice'
import { useToast } from '@/context/ToastContext'
import styles from './LocaleSelector.module.css'

const LOCALES = [
  { code: 'pt-BR', name: 'Português (Brasil)', flag: '🇧🇷' },
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  { code: 'es-ES', name: 'Español (España)', flag: '🇪🇸' }
]

export default function LocaleSelector() {
  const t = useTranslations('profile')
  const router = useRouter()
  const { user } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()
  const { showToast } = useToast()

  const [selectedLocale, setSelectedLocale] = useState(user?.locale || 'pt-BR')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!user) return

    setIsSaving(true)

    try {
      const response = await fetch('/api/auth/locale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ locale: selectedLocale })
      })

      if (response.ok) {
        // Atualizar Redux
        dispatch(setUser({ ...user, locale: selectedLocale }))

        showToast(t('localeSaved'), 'success')

        // Atualizar a página para aplicar novo idioma sem resetar o estado do Redux
        setTimeout(() => {
          router.refresh()
        }, 1000)
      } else {
        throw new Error('Erro ao salvar')
      }
    } catch (error) {
      showToast(t('localeError'), 'error')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className={styles.localeSelector}>
      <label htmlFor="locale">{t('language')}</label>
      <div className={styles.selectWrapper}>
        <select
          id="locale"
          value={selectedLocale}
          onChange={(e) => setSelectedLocale(e.target.value)}
          disabled={isSaving}
        >
          {LOCALES.map((locale) => (
            <option key={locale.code} value={locale.code}>
              {locale.flag} {locale.name}
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={handleSave}
        disabled={isSaving || selectedLocale === user?.locale}
        className={styles.saveButton}
      >
        {isSaving ? t('saving') : t('save')}
      </button>
    </div>
  )
}
