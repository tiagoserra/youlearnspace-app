'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ReCAPTCHA from 'react-google-recaptcha'
import { useTranslations } from 'next-intl'
import styles from './page.module.css'

export default function CadastroPage() {
  const t = useTranslations()
  const router = useRouter()
  const recaptchaRef = useRef<ReCAPTCHA>(null)

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: ''
  })

  const [locale, setLocale] = useState<string>('pt-BR')
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Detectar idioma do navegador
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.language) {
      const browserLang = navigator.language

      if (browserLang.startsWith('en')) setLocale('en-US')
      else if (browserLang.startsWith('es')) setLocale('es-ES')
      else setLocale('pt-BR')
    }
  }, [])

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setShowError(false)
    setErrorMessage('')

    if (formData.senha !== formData.confirmarSenha) {
      setShowError(true)
      setErrorMessage(t('auth.passwordMismatch'))
      setIsSubmitting(false)
      return
    }

    if (!recaptchaToken) {
      setShowError(true)
      setErrorMessage(t('auth.recaptchaRequired'))
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          recaptchaToken,
          locale
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || t('auth.registerError'))
      }

      setShowSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (error) {
      setShowError(true)
      setErrorMessage(error instanceof Error ? error.message : t('auth.registerError'))

      recaptchaRef.current?.reset()
      setRecaptchaToken(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1>{t('auth.registerTitle')}</h1>
          <p>{t('auth.registerDescription')}</p>
        </div>

        {showSuccess && (
          <div className={styles.success}>
            ✅ {t('auth.registerSuccess')}
          </div>
        )}

        {showError && (
          <div className={styles.error}>
            ❌ {errorMessage}
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label>{t('auth.name')} *</label>
            <input
              type="text"
              required
              minLength={3}
              maxLength={100}
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              disabled={isSubmitting}
              placeholder={t('auth.namePlaceholder')}
            />
          </div>

          <div className={styles.field}>
            <label>{t('auth.email')} *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={isSubmitting}
              placeholder={t('auth.emailPlaceholder')}
            />
          </div>

          <div className={styles.field}>
            <label>{t('auth.password')} *</label>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                maxLength={50}
                value={formData.senha}
                onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                disabled={isSubmitting}
                placeholder={t('auth.passwordPlaceholder')}
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <small>{t('auth.passwordMin')}</small>
          </div>

          <div className={styles.field}>
            <label>{t('auth.confirmPassword')} *</label>
            <div className={styles.passwordWrapper}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                minLength={8}
                maxLength={50}
                value={formData.confirmarSenha}
                onChange={(e) => setFormData({ ...formData, confirmarSenha: e.target.value })}
                disabled={isSubmitting}
                placeholder={t('auth.confirmPasswordPlaceholder')}
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <div className={styles.field}>
            <label>{t('auth.language')} *</label>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              disabled={isSubmitting}
              required
            >
              <option value="pt-BR">🇧🇷 Português (Brasil)</option>
              <option value="en-US">🇺🇸 English (US)</option>
              <option value="es-ES">🇪🇸 Español (España)</option>
            </select>
          </div>

          <div className={styles.recaptcha}>
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
              onChange={handleRecaptchaChange}
              theme="light"
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting || !recaptchaToken}
          >
            {isSubmitting ? t('common.submitting') : t('auth.register')}
          </button>

          <div className={styles.footer}>
            {t('auth.hasAccount')} <Link href="/login">{t('auth.loginLink')}</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
