'use client'

import { useState, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import ReCAPTCHA from 'react-google-recaptcha'
import YouTubeLayout from '@/components/layout/YouTubeLayout'
import { RootState } from '@/lib/redux/store'
import styles from './page.module.css'

export default function SugestaoPage() {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth)
  const recaptchaRef = useRef<ReCAPTCHA>(null)

  const [formData, setFormData] = useState({
    tituloSugestao: '',
    urlCurso: '',
    categoria: '',
    descricao: ''
  })
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setShowError(false)
    setErrorMessage('')

    try {

      const recaptchaToken = recaptchaRef.current?.getValue()
      if (!recaptchaToken) {
        throw new Error('Por favor, complete o reCAPTCHA')
      }

      const response = await fetch('/api/sugestao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          recaptchaToken
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao enviar sugestão')
      }

      setShowSuccess(true)
      recaptchaRef.current?.reset()
      setTimeout(() => {
        setShowSuccess(false)
        setFormData({
          tituloSugestao: '',
          urlCurso: '',
          categoria: '',
          descricao: ''
        })
      }, 3000)
    } catch (error) {
      setShowError(true)
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao enviar sugestão')
      recaptchaRef.current?.reset()
      setTimeout(() => {
        setShowError(false)
        setErrorMessage('')
      }, 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <YouTubeLayout currentPath={pathname}>
        <div className={styles.container}>
          <p>Carregando...</p>
        </div>
      </YouTubeLayout>
    )
  }

  if (!isAuthenticated) {
    return (
      <YouTubeLayout currentPath={pathname}>
        <div className={styles.container}>
          <h1>Sugerir um Curso</h1>
          <div className={styles.error}>
            ❌ Você precisa estar logado para sugerir um curso.
          </div>
          <button
            className={styles.submitButton}
            onClick={() => router.push('/login')}
            style={{ marginTop: '20px' }}
          >
            Fazer Login
          </button>
        </div>
      </YouTubeLayout>
    )
  }

  return (
    <YouTubeLayout currentPath={pathname}>
      <div className={styles.container}>
        <h1>Sugerir um Curso</h1>
        <p className={styles.subtitle}>
          Conhece um curso gratuito incrível? Compartilhe conosco!
        </p>

        {showSuccess && (
          <div className={styles.success}>
            ✅ Sugestão enviada com sucesso! Obrigado pela contribuição.
          </div>
        )}

        {showError && (
          <div className={styles.error}>
            ❌ {errorMessage}
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit}>

          <div className={styles.field}>
            <label>Título do Curso *</label>
            <input
              type="text"
              required
              minLength={5}
              maxLength={200}
              value={formData.tituloSugestao}
              onChange={(e) => setFormData({ ...formData, tituloSugestao: e.target.value })}
            />
          </div>

          <div className={styles.field}>
            <label>URL do YouTube *</label>
            <input
              type="url"
              required
              placeholder="https://www.youtube.com/watch?v=..."
              value={formData.urlCurso}
              onChange={(e) => setFormData({ ...formData, urlCurso: e.target.value })}
            />
          </div>

          <div className={styles.field}>
            <label>Categoria *</label>
            <select
              required
              value={formData.categoria}
              onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
            >
              <option value="">Selecione...</option>
              <option value="Front-end">Front-end</option>
              <option value="Back-end">Back-end</option>
              <option value="Mobile">Mobile</option>
              <option value="Data Science">Data Science</option>
              <option value="DevOps">DevOps</option>
              <option value="Design">Design</option>
              <option value="Soft Skills">Soft Skills</option>
            </select>
          </div>

          <div className={styles.field}>
            <label>Descrição (20-1000 caracteres) *</label>
            <textarea
              required
              minLength={20}
              maxLength={1000}
              rows={5}
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            />
            <span className={styles.counter}>{formData.descricao.length} / 1000</span>
          </div>

          <div className={styles.field}>
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
            />
          </div>

          <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Enviar Sugestão'}
          </button>
        </form>
      </div>
    </YouTubeLayout>
  )
}
