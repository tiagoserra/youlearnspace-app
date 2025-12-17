'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Curso } from '@/lib/types'
import { useAppSelector } from '@/lib/redux/hooks'
import YouTubeLayout from '@/components/layout/YouTubeLayout'
import CourseCard from '@/components/course/CourseCard'
import styles from '../curtidos/page.module.css'

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:3000/api/graphql'

export default function HistoricoPage() {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAppSelector((state) => state.auth)
  const [cursos, setCursos] = useState<Curso[]>([])
  const [cursosWithStatus, setCursosWithStatus] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/historico')
    }
  }, [isAuthenticated, authLoading, router])

  const loadHistory = async () => {
    if (!isAuthenticated) return

    try {

      const historyResponse = await fetch('/api/cursos/history', {
        credentials: 'include'
      })

      if (!historyResponse.ok) {
        setLoading(false)
        return
      }

      const historyData = await historyResponse.json()
      const historySlugs = historyData.cursos.map((c: any) => c.cursoSlug)

      if (historySlugs.length === 0) {
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

      const historyCursos = allCursos.filter(c => historySlugs.includes(c.slug))

      const statuses: Record<string, any> = {}
      await Promise.all(
        historyCursos.map(async (curso) => {
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

      setCursos(historyCursos)
      setCursosWithStatus(statuses)
    } catch (error) {
      console.error('Erro ao carregar histórico:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isAuthenticated) return

    loadHistory()
    const interval = setInterval(loadHistory, 5000)
    return () => clearInterval(interval)
  }, [isAuthenticated])

  return (
    <YouTubeLayout currentPath={pathname}>
      <div className={styles.container}>
        <h1 className={styles.title}>Histórico de Cursos</h1>

        {loading ? (
          <p>Carregando...</p>
        ) : cursos.length === 0 ? (
          <div className={styles.emptyState}>
            <h2>Você ainda não acessou nenhum curso</h2>
            <p>Comece sua jornada de aprendizado agora!</p>
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
