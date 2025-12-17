'use client'

import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'
import { CompleteButtonProps } from '@/lib/types'
import { useAppSelector } from '@/lib/redux/hooks'
import styles from './CompleteButton.module.css'

export default function CompleteButton({ cursoId, initialStatus }: CompleteButtonProps) {
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  const [status, setStatus] = useState(initialStatus)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (initialStatus) {
      setStatus(initialStatus)
    }
  }, [initialStatus])

  const slug = cursoId.replace(/^\/cursos\//, '').replace(/\/$/, '')

  const handleComplete = async () => {
    if (status === 'concluido' || !isAuthenticated) return

    setIsLoading(true)

    try {
      const response = await fetch(`/api/cursos/${slug}/complete`, {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setStatus(data.completed ? 'concluido' : 'nao-iniciado')
      }
    } catch (error) {
      console.error('Erro ao marcar conclusão:', error)
    }

    setIsLoading(false)
  }

  const isCompleted = status === 'concluido'

  return (
    <button
      className={`${styles.button} ${isCompleted ? styles.completed : ''}`}
      onClick={handleComplete}
      disabled={!isAuthenticated || isCompleted || isLoading}
      aria-label={isCompleted ? 'Curso concluído' : 'Marcar como concluído'}
      title={!isAuthenticated ? 'Faça login para marcar como concluído' : ''}
    >
      <Check size={20} />
      <span>
        {isLoading ? 'Salvando...' : isCompleted ? 'Concluído ✓' : 'Marcar como Concluído'}
      </span>
    </button>
  )
}
