'use client'

import { useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import ReCAPTCHA from 'react-google-recaptcha'
import styles from './page.module.css'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect') || '/'
  const recaptchaRef = useRef<ReCAPTCHA>(null)

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setShowError(false)
    setErrorMessage('')

    if (!recaptchaToken) {
      setShowError(true)
      setErrorMessage('Por favor, complete o reCAPTCHA')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          senha,
          recaptchaToken
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao fazer login')
      }

      router.push(redirectUrl)
      router.refresh()
    } catch (error) {
      setShowError(true)
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao fazer login')

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
          <h1>Entrar</h1>
          <p>Faça login para acessar sua conta</p>
        </div>

        {showError && (
          <div className={styles.error}>
            ❌ {errorMessage}
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label>Email *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              placeholder="seu@email.com"
            />
          </div>

          <div className={styles.field}>
            <label>Senha *</label>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                disabled={isSubmitting}
                placeholder="Sua senha"
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
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>

          <div className={styles.footer}>
            Não tem uma conta? <Link href="/cadastro">Cadastre-se</Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className={styles.container}>Carregando...</div>}>
      <LoginForm />
    </Suspense>
  )
}
