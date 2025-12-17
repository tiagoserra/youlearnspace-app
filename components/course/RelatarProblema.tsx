'use client'

import { useState, useRef, useEffect } from 'react'
import { AlertCircle, X, Loader2 } from 'lucide-react'
import ReCAPTCHA from 'react-google-recaptcha'
import { useAppSelector } from '@/lib/redux/hooks'
import { useToast } from '@/context/ToastContext'
import styles from './RelatarProblema.module.css'

interface RelatarProblemaProps {
  cursoId: string 
  cursoSlug: string
  cursoTitulo: string
}

const MAX_CHARS = 512

export default function RelatarProblema({ cursoId, cursoSlug, cursoTitulo }: RelatarProblemaProps) {
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  const { showToast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [descricao, setDescricao] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const recaptchaRef = useRef<ReCAPTCHA>(null)

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY

  useEffect(() => {
    if (!isOpen) {
      setDescricao('')
      setError('')
      recaptchaRef.current?.reset()
    }
  }, [isOpen])

  const handleOpen = () => {
    if (!isAuthenticated) {
      setError('Você precisa estar logado para relatar um problema.')
      return
    }
    setIsOpen(true)
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setIsOpen(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!descricao.trim()) {
      setError('Por favor, descreva o problema.')
      return
    }

    if (descricao.length > MAX_CHARS) {
      setError(`A descrição não pode ter mais de ${MAX_CHARS} caracteres.`)
      return
    }

    if (!siteKey) {
      setError('Erro de configuração: reCAPTCHA não configurado.')
      return
    }

    const recaptchaToken = recaptchaRef.current?.getValue()
    if (!recaptchaToken) {
      setError('Por favor, complete a verificação reCAPTCHA.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/cursos/${cursoSlug}/problema`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          cursoId,
          descricao: descricao.trim(),
          recaptchaToken
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar problema')
      }

      showToast('Problema reportado com sucesso! Obrigado pelo feedback.', 'success')
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar problema')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  const charCount = descricao.length
  const isNearLimit = charCount > MAX_CHARS * 0.9

  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      <button
        type="button"
        className={styles.button}
        onClick={handleOpen}
        aria-label="Relatar problema com o curso"
      >
        <AlertCircle size={18} />
        Curso com problema
      </button>

      {isOpen && (
        <div className={styles.overlay} onClick={handleOverlayClick}>
          <div className={styles.modal} role="dialog" aria-modal="true">
            <div className={styles.header}>
              <h2 className={styles.title}>
                <AlertCircle size={20} />
                Relatar Problema
              </h2>
              <button
                type="button"
                className={styles.closeButton}
                onClick={handleClose}
                disabled={isSubmitting}
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.content}>
              <form className={styles.form} onSubmit={handleSubmit}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Curso: <strong>{cursoTitulo}</strong>
                </p>

                <div className={styles.formGroup}>
                  <label htmlFor="descricao" className={styles.label}>
                    Descrição do problema *
                  </label>
                  <textarea
                    id="descricao"
                    className={styles.textarea}
                    placeholder="Descreva detalhadamente o problema encontrado neste curso..."
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    maxLength={MAX_CHARS}
                    disabled={isSubmitting}
                    required
                  />
                  <div className={`${styles.charCount} ${isNearLimit ? styles.warning : ''}`}>
                    {charCount}/{MAX_CHARS}
                  </div>
                </div>

                {siteKey && (
                  <div className={styles.recaptchaWrapper}>
                    <ReCAPTCHA
                      ref={recaptchaRef}
                      sitekey={siteKey}
                      theme="light"
                    />
                  </div>
                )}

                {error && (
                  <div className={styles.error} role="alert">
                    {error}
                  </div>
                )}

                <div className={styles.footer}>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={handleClose}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={isSubmitting || !descricao.trim()}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="spin" />
                        Enviando...
                      </>
                    ) : (
                      'Enviar'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
