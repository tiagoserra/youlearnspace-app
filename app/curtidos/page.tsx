'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Curso } from '@/lib/types'
import { useAppSelector } from '@/lib/redux/hooks'
import YouTubeLayout from '@/components/layout/YouTubeLayout'
import CourseCard from '@/components/course/CourseCard'
import styles from './page.module.css'

const GRAPHQL_ENDPOINT = '/api/graphql'

export default function CurtidosPage() {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAppSelector((state) => state.auth)
  const [cursos, setCursos] = useState<Curso[]>([])
  const [cursosWithStatus, setCursosWithStatus] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/curtidos')
    }
  }, [isAuthenticated, authLoading, router])

  const loadCursos = async () => {
    if (!isAuthenticated) return

    try {

      const likedResponse = await fetch('/api/cursos/liked', {
        credentials: 'include'
      })

      if (!likedResponse.ok) {
        setLoading(false)
        return
      }

      const likedData = await likedResponse.json()
      const likedSlugs = likedData.cursos.map((c: any) => c.cursoSlug)

      if (likedSlugs.length === 0) {
        setCursos([])
        setLoading(false)
        return
      }

      const query = `
        query {
          cursos {
            slug
            frontmatter {
              id
              title
              thumb
              canal
              data
              dataCriacao
              duracao
              nivel
              categoria
              tags
              descricao
              url
            }
            content
          }
        }
      `

      const graphqlResponse = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
        cache: 'no-store'
      })

      const { data } = await graphqlResponse.json()
      const allCursos: Curso[] = data.cursos

      const likedCursos = allCursos.filter(c => likedSlugs.includes(c.slug))

      const statuses: Record<string, any> = {}
      await Promise.all(
        likedCursos.map(async (curso) => {
          const statusResponse = await fetch(`/api/cursos/${curso.slug}/status`, {
            credentials: 'include'
          })
          if (statusResponse.ok) {
            const statusData = await statusResponse.json()
            statuses[curso.slug] = {
              liked: statusData.liked,
              status: statusData.completed ? 'concluido' : statusData.inProgress ? 'em-andamento' : 'nao-iniciado'
            }
          }
        })
      )

      setCursos(likedCursos)
      setCursosWithStatus(statuses)
    } catch (error) {
      console.error('Erro ao carregar cursos curtidos:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isAuthenticated) return

    loadCursos()

    const interval = setInterval(loadCursos, 5000)
    const handleVisibility = () => {
      if (!document.hidden) loadCursos()
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [isAuthenticated])

  return (
    <YouTubeLayout currentPath={pathname}>
      <div className={styles.container}>
        <h1 className={styles.title}>Cursos Curtidos</h1>

        {loading ? (
          <p>Carregando...</p>
        ) : cursos.length === 0 ? (
          <div className={styles.emptyState}>
            <h2>Você ainda não curtiu nenhum curso</h2>
            <p>Explore nossa biblioteca e marque seus cursos favoritos!</p>
            <Link href="/" className={styles.cta}>
              Explorar Cursos
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {cursos.map((curso) => (
              <CourseCard
                key={curso.slug}
                curso={curso}
                status={cursosWithStatus[curso.slug]}
              />
            ))}
          </div>
        )}
      </div>
    </YouTubeLayout>
  )
}
