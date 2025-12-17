'use client'

import { useState, useMemo, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Curso } from '@/lib/types'
import { useAppSelector } from '@/lib/redux/hooks'
import YouTubeLayout from '@/components/layout/YouTubeLayout'
import CategoryChips from '@/components/ui/CategoryChips'
import CourseCard from '@/components/course/CourseCard'
import styles from './page.module.css'

interface HomeClientProps {
  cursos: Curso[]
  categories: string[]
}

export default function HomeClient({ cursos, categories }: HomeClientProps) {
  const pathname = usePathname()
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [cursosWithStatus, setCursosWithStatus] = useState<Record<string, any>>({})
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(true)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('youlearnspace-sidebar-state')
    if (saved !== null) {
      setSidebarExpanded(saved === 'true')
    }

    const handleStorage = () => {
      const newState = localStorage.getItem('youlearnspace-sidebar-state')
      if (newState !== null) {
        setSidebarExpanded(newState === 'true')
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  useEffect(() => {
    const loadStatuses = async () => {
      if (!isAuthenticated) {
        setCursosWithStatus({})
        return
      }

      const statuses: Record<string, any> = {}

      await Promise.all(
        cursos.map(async (curso) => {
          try {
            const response = await fetch(`/api/cursos/${curso.slug}/status`, {
              credentials: 'include'
            })
            if (response.ok) {
              const data = await response.json()
              statuses[curso.slug] = {
                liked: data.liked,
                status: data.completed ? 'concluido' : data.inProgress ? 'em-andamento' : 'nao-iniciado'
              }
            }
          } catch (error) {
            console.error(`Erro ao carregar status do curso ${curso.slug}:`, error)
          }
        })
      )

      setCursosWithStatus(statuses)
    }

    loadStatuses()

    if (isAuthenticated) {
      const interval = setInterval(loadStatuses, 5000)

      const handleVisibility = () => {
        if (!document.hidden) {
          loadStatuses()
        }
      }
      document.addEventListener('visibilitychange', handleVisibility)

      return () => {
        clearInterval(interval)
        document.removeEventListener('visibilitychange', handleVisibility)
      }
    }
  }, [cursos, isAuthenticated])

  const filteredCursos = useMemo(() => {
    let filtered = cursos

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(curso =>
        curso.frontmatter.title.toLowerCase().includes(query) ||
        curso.frontmatter.descricao.toLowerCase().includes(query) ||
        curso.frontmatter.canal.toLowerCase().includes(query) ||
        curso.frontmatter.categoria.toLowerCase().includes(query) ||
        curso.frontmatter.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    if (selectedCategory !== 'Todos') {
      filtered = filtered.filter(curso =>
        curso.frontmatter.categoria === selectedCategory
      )
    }

    return filtered
  }, [cursos, searchQuery, selectedCategory])

  return (
    <YouTubeLayout
      currentPath={pathname}
      onSearchChange={setSearchQuery}
      searchQuery={searchQuery}
      showCategoryChips
      categoryChipsComponent={
        <CategoryChips
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          sidebarExpanded={sidebarExpanded}
          isMobile={isMobile}
        />
      }
    >
      {filteredCursos.length === 0 ? (
        <div className={styles.emptyState}>
          <h2>Nenhum curso encontrado</h2>
          <p>
            {searchQuery
              ? `Não encontramos cursos com o termo "${searchQuery}"`
              : `Não há cursos na categoria "${selectedCategory}"`}
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredCursos.map((curso) => (
            <CourseCard
              key={curso.slug}
              curso={curso}
              status={cursosWithStatus[curso.slug]}
            />
          ))}
        </div>
      )}
    </YouTubeLayout>
  )
}
