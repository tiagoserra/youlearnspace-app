'use client'

import { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { Curso } from '@/lib/types'
import { getCursoIdFromSlug } from '@/lib/utils'
import { useAppSelector } from '@/lib/redux/hooks'
import { fetchWithCsrf } from '@/lib/fetch-with-csrf'
import YouTubeLayout from '@/components/layout/YouTubeLayout'
import LikeButton from '@/components/course/LikeButton'
import CompleteButton from '@/components/course/CompleteButton'
import RelatarProblema from '@/components/course/RelatarProblema'
import styles from './page.module.css'

interface CursoClientProps {
  curso: Curso
}

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

export default function CursoClient({ curso }: CursoClientProps) {
  const pathname = usePathname()
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  const [status, setStatus] = useState<any>(null)
  const [videoProgress, setVideoProgress] = useState<any>(null)
  const cursoId = getCursoIdFromSlug(curso.slug)
  const playerRef = useRef<any>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const hasRestoredProgress = useRef(false)
  const [isPlayerReady, setIsPlayerReady] = useState(false)

  useEffect(() => {
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

          if (data.videoProgress) {
            setVideoProgress(data.videoProgress)
          }
        }

        if (isAuthenticated) {
          await fetch(`/api/cursos/${curso.slug}/start`, {
            method: 'POST',
            credentials: 'include'
          })
        }
      } catch (error) {
        console.error('Erro ao carregar status:', error)
      }
    }

    loadStatus()
  }, [curso.slug, isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) return

    setIsPlayerReady(false)
    hasRestoredProgress.current = false

    let isApiLoaded = false

    if (window.YT && window.YT.Player) {
      initPlayer()
      isApiLoaded = true
    } else {

      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement('script')
        tag.src = 'https://www.youtube.com/iframe_api'
        const firstScriptTag = document.getElementsByTagName('script')[0]
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
      }

      window.onYouTubeIframeAPIReady = () => {
        initPlayer()
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy()
        playerRef.current = null
      }
      setIsPlayerReady(false)
    }
  }, [isAuthenticated, curso.slug])

  const initPlayer = () => {
    if (!window.YT || !window.YT.Player) return

    if (playerRef.current && playerRef.current.destroy) {
      playerRef.current.destroy()
    }

    const iframe = document.getElementById('youtube-player') as HTMLIFrameElement
    if (!iframe) return

    playerRef.current = new window.YT.Player('youtube-player', {
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange
      }
    })
  }

  const onPlayerReady = (event: any) => {
    setIsPlayerReady(true)
  }

  useEffect(() => {
    if (!isPlayerReady || !playerRef.current || !videoProgress || hasRestoredProgress.current) {
      return
    }

    const restoreProgress = () => {
      try {
        const currentTime = parseFloat(videoProgress.currentTime)
        if (!isNaN(currentTime) && currentTime > 0) {
          console.log('Restaurando progresso:', currentTime, 'segundos')
          playerRef.current.seekTo(currentTime, true)
          hasRestoredProgress.current = true
        }
      } catch (error) {
        console.error('Erro ao restaurar progresso:', error)
      }
    }

    const timer = setTimeout(restoreProgress, 500)
    return () => clearTimeout(timer)
  }, [isPlayerReady, videoProgress])

  const onPlayerStateChange = (event: any) => {
    const YT = window.YT

    if (event.data === YT.PlayerState.PLAYING) {
      startProgressTracking()
    } else if (event.data === YT.PlayerState.PAUSED) {
      stopProgressTracking()
      saveProgress()
    } else if (event.data === YT.PlayerState.ENDED) {
      stopProgressTracking()
      saveProgress()
      markAsCompleted()
    }
  }

  const startProgressTracking = () => {
    if (progressIntervalRef.current) return

    saveProgress()

    progressIntervalRef.current = setInterval(() => {
      saveProgress()
    }, 10000)
  }

  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
  }

  const saveProgress = async () => {
    if (!playerRef.current || !isAuthenticated) return

    try {
      const currentTime = playerRef.current.getCurrentTime()
      const duration = playerRef.current.getDuration()

      if (isNaN(currentTime) || !duration || isNaN(duration) || duration <= 0) return

      await fetchWithCsrf(`/api/cursos/${curso.slug}/progress`, {
        method: 'POST',
        body: JSON.stringify({ currentTime, duration })
      })
    } catch (error) {
      console.error('Erro ao salvar progresso:', error)
    }
  }

  const markAsCompleted = async () => {
    if (!isAuthenticated) return

    try {
      const response = await fetchWithCsrf(`/api/cursos/${curso.slug}/complete`, {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        setStatus((prevStatus: any) => ({
          ...prevStatus,
          status: data.completed ? 'concluido' : 'nao-iniciado'
        }))
      }
    } catch (error) {
      console.error('Erro ao marcar conclusão:', error)
    }
  }

  return (
    <YouTubeLayout currentPath={pathname}>
      <div className={styles.container}>

        <nav className={styles.breadcrumb}>
          <Link href="/">Início</Link>
          <span> › </span>
          <Link href="/">Cursos</Link>
          <span> › </span>
          <span>{curso.frontmatter.title}</span>
        </nav>


        <div className={styles.playerWrapper}>
          <iframe
            id="youtube-player"
            className={styles.player}
            src={`https://www.youtube.com/embed/${curso.frontmatter.id}?rel=0&modestbranding=1&enablejsapi=1`}
            title={curso.frontmatter.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

  
        <div className={styles.content}>
          <h1 className={styles.title}>{curso.frontmatter.title}</h1>

          <div className={styles.meta}>
            <span>{curso.frontmatter.canal}</span>
            <span>•</span>
            <span>{curso.frontmatter.data}</span>
            <span>•</span>
            <span>{curso.frontmatter.duracao}</span>
            <span>•</span>
            <span>{curso.frontmatter.nivel}</span>
          </div>

          <div className={styles.actions}>
            {status && (
              <>
                <LikeButton cursoId={cursoId} initialLiked={status.liked} />
                <CompleteButton cursoId={cursoId} initialStatus={status.status} />
              </>
            )}
            <RelatarProblema
              cursoId={curso.frontmatter.id}
              cursoSlug={curso.slug}
              cursoTitulo={curso.frontmatter.title}
            />
          </div>

          <div className={styles.tags}>
            {curso.frontmatter.tags.map((tag, index) => (
              <span key={index} className={styles.tag}>{tag}</span>
            ))}
          </div>

          <div className={styles.description}>
            <h2>Sobre este curso</h2>
            <ReactMarkdown>{curso.frontmatter.descricao}</ReactMarkdown>
          </div>

          <div className={styles.mdxContent}>
            <ReactMarkdown>{curso.content}</ReactMarkdown>
          </div>
        </div>
      </div>
    </YouTubeLayout>
  )
}
