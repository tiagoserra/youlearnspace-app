'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Play } from 'lucide-react'
import { CourseCardProps } from '@/lib/types'
import { useAppSelector } from '@/lib/redux/hooks'
import { getCursoIdFromSlug } from '@/lib/utils'
import LikeButton from './LikeButton'
import styles from './CourseCard.module.css'

export default function CourseCard({ curso, status: initialStatus }: CourseCardProps) {
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  const [status, setStatus] = useState(initialStatus)
  const cursoId = getCursoIdFromSlug(curso.slug)

  useEffect(() => {
    if (!initialStatus && isAuthenticated) {
      const loadStatus = async () => {
        try {
          const response = await fetch(`/api/cursos/${curso.slug}/status`, {
            credentials: 'include'
          })
          if (response.ok) {
            const data = await response.json()
            setStatus({
              liked: data.liked,
              status: data.completed ? 'concluido' : data.inProgress ? 'em-andamento' : 'nao-iniciado'
            })
          }
        } catch (error) {
          console.error('Erro ao carregar status:', error)
        }
      }
      loadStatus()
    }
  }, [curso.slug, initialStatus, isAuthenticated])

  const getStatusBadge = () => {
    if (!status) return null

    if (status.status === 'em-andamento') {
      return <span className={`${styles.statusBadge} ${styles.inProgress}`}>Em Andamento</span>
    }
    if (status.status === 'concluido') {
      return <span className={`${styles.statusBadge} ${styles.completed}`}>Concluído</span>
    }
    return null
  }

  const getAvatarLetter = () => {
    return curso.frontmatter.canal.charAt(0).toUpperCase()
  }

  const visibleTags = curso.frontmatter.tags.slice(0, 3)
  const remainingTags = curso.frontmatter.tags.length - 3

  return (
    <div className={styles.card}>
      <Link
        href={`/cursos/${curso.slug}`}
        className={styles.thumbnailLink}
      >
        <div className={styles.thumbnailContainer}>
          <Image
            src={curso.frontmatter.thumb}
            alt={curso.frontmatter.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={styles.thumbnail}
          />

          <span className={styles.categoryBadge}>{curso.frontmatter.categoria}</span>

          {getStatusBadge()}

          <div className={styles.playOverlay}>
            <div className={styles.playIcon}>
              <Play size={50} fill="white" />
            </div>
          </div>
        </div>
      </Link>

      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.avatar}>
            {getAvatarLetter()}
          </div>
          <div className={styles.info}>
            <Link href={`/cursos/${curso.slug}`} className={styles.titleLink}>
              <h3 className={styles.title}>{curso.frontmatter.title}</h3>
            </Link>
            <p className={styles.canal}>{curso.frontmatter.canal}</p>
          </div>
        </div>

        <div className={styles.meta}>
          <span>{curso.frontmatter.duracao}</span>
          <span>•</span>
          <span>{curso.frontmatter.nivel}</span>
        </div>

        {isAuthenticated && (
          <div className={styles.actions}>
            <LikeButton cursoId={cursoId} initialLiked={status?.liked || false} />
          </div>
        )}

        <div className={styles.tags}>
          {visibleTags.map((tag, index) => (
            <span key={index} className={styles.tag}>{tag}</span>
          ))}
          {remainingTags > 0 && (
            <span className={styles.tag}>+{remainingTags}</span>
          )}
        </div>
      </div>
    </div>
  )
}
