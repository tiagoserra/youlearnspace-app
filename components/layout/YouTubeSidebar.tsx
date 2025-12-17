'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Home, History, Heart, Info, Lightbulb } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useAppSelector } from '@/lib/redux/hooks'
import styles from './YouTubeSidebar.module.css'

interface YouTubeSidebarProps {
  expanded: boolean
  currentPath: string
  isMobile: boolean
  showOverlay: boolean
  onClose: () => void
}

interface MenuItem {
  icon: React.ComponentType<{ size: number }>
  labelKey: string
  path: string
  badge: 'historico' | 'curtidos' | null
  requiresAuth: boolean
}

export default function YouTubeSidebar({
  expanded,
  currentPath,
  isMobile,
  showOverlay,
  onClose
}: YouTubeSidebarProps) {
  const t = useTranslations('nav')
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  const [badgeCounts, setBadgeCounts] = useState({ historico: 0, curtidos: 0 })

  const menuItems: MenuItem[] = [
    { icon: Home, labelKey: 'home', path: '/', badge: null, requiresAuth: false },
    { icon: History, labelKey: 'history', path: '/historico', badge: 'historico', requiresAuth: true },
    { icon: Heart, labelKey: 'liked', path: '/curtidos', badge: 'curtidos', requiresAuth: true },
    { icon: Info, labelKey: 'about', path: '/sobre', badge: null, requiresAuth: false },
    { icon: Lightbulb, labelKey: 'suggest', path: '/sugestao', badge: null, requiresAuth: false }
  ]

  const [year, setYear] = useState(2024)

  const loadBadges = async () => {
    if (!isAuthenticated) {
      setBadgeCounts({ historico: 0, curtidos: 0 })
      return
    }

    try {

      const likedResponse = await fetch('/api/cursos/liked', {
        credentials: 'include'
      })
      if (likedResponse.ok) {
        const likedData = await likedResponse.json()
        const curtidosCount = likedData.cursos?.length || 0

        const historyResponse = await fetch('/api/cursos/history', {
          credentials: 'include'
        })
        if (historyResponse.ok) {
          const historyData = await historyResponse.json()
          const historicoCount = historyData.cursos?.length || 0

          setBadgeCounts({
            curtidos: curtidosCount,
            historico: historicoCount
          })
        }
      }
    } catch (error) {
      console.error('Erro ao carregar badges:', error)
    }
  }

  useEffect(() => {
    loadBadges()

    const interval = setInterval(loadBadges, 5000)

    const handleVisibility = () => {
      if (!document.hidden) {
        loadBadges()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [isAuthenticated])

  useEffect(()=>{
    const xmas = new Date()
    setYear(xmas.getFullYear())
  }
  ,[])

  const sidebarClasses = [
    styles.sidebar,
    expanded ? styles.expanded : styles.collapsed,
    isMobile && showOverlay ? styles.mobileOpen : ''
  ].filter(Boolean).join(' ')

  const visibleMenuItems = menuItems.filter(
    (item) => !item.requiresAuth || isAuthenticated
  )

  return (
    <aside className={sidebarClasses}>
      <nav className={styles.nav}>
        {visibleMenuItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPath === item.path
          const badgeCount = item.badge ? badgeCounts[item.badge] : 0

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`${styles.menuItem} ${isActive ? styles.active : ''}`}
              onClick={onClose}
            >
              <div className={styles.iconWrapper}>
                <Icon size={24} />
                {item.badge && badgeCount > 0 && (
                  <span className={styles.badge}>{badgeCount}</span>
                )}
              </div>
              {expanded && <span className={styles.label}>{t(item.labelKey)}</span>}
            </Link>
          )
        })}
      </nav>

      <div className={styles.footer}>
        {expanded ? (
          <p className={styles.copyright}>© {year} YouLearnSpace</p>
        ) : (
          <p className={styles.copyright}>©</p>
        )}
      </div>
    </aside>
  )
}
