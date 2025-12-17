'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { LikeButtonProps } from '@/lib/types'
import { useAppSelector } from '@/lib/redux/hooks'
import { fetchWithCsrf } from '@/lib/fetch-with-csrf'
import styles from './LikeButton.module.css'

export default function LikeButton({ cursoId, initialLiked }: LikeButtonProps) {
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  const [liked, setLiked] = useState(initialLiked)
  const [isAnimating, setIsAnimating] = useState(false)

  const slug = cursoId.replace(/^\/cursos\//, '').replace(/\/$/, '')

  useEffect(() => {
    setLiked(initialLiked)
  }, [initialLiked])

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) return

    setIsAnimating(true)

    try {
      const response = await fetchWithCsrf(`/api/cursos/${slug}/like`, {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        setLiked(data.liked)
      }
    } catch (error) {
      console.error('Erro ao curtir curso:', error)
    }

    setTimeout(() => setIsAnimating(false), 300)
  }

  return (
    <button
      className={`${styles.button} ${liked ? styles.liked : ''} ${isAnimating ? styles.animating : ''}`}
      onClick={handleClick}
      aria-label={liked ? 'Descurtir curso' : 'Curtir curso'}
      disabled={!isAuthenticated}
      title={!isAuthenticated ? 'Faça login para curtir este curso' : ''}
    >
      {liked ? (
        <Heart size={20} fill="currentColor" />
      ) : (
        <Heart size={20} />
      )}
      <span>{liked ? 'Curtido' : 'Curtir'}</span>
    </button>
  )
}
