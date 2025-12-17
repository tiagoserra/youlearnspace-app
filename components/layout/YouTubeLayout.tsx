'use client'

import { useState, useEffect } from 'react'
import { YouTubeLayoutProps } from '@/lib/types'
import YouTubeHeader from './YouTubeHeader'
import YouTubeSidebar from './YouTubeSidebar'
import styles from './YouTubeLayout.module.css'

export default function YouTubeLayout({
  children,
  showCategoryChips = false,
  categoryChipsComponent,
  currentPath,
  onSearchChange,
  searchQuery = ''
}: YouTubeLayoutProps) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileOverlay, setShowMobileOverlay] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) {
        setSidebarExpanded(false)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (!isMobile) {
      const saved = localStorage.getItem('youlearnspace-sidebar-state')
      if (saved !== null) {
        setSidebarExpanded(saved === 'true')
      }
    }
  }, [isMobile])

  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem('youlearnspace-sidebar-state', String(sidebarExpanded))
    }
  }, [sidebarExpanded, isMobile])

  const handleMenuClick = () => {
    if (isMobile) {
      setShowMobileOverlay(!showMobileOverlay)
    }
    setSidebarExpanded(!sidebarExpanded)
  }

  const closeMobileMenu = () => {
    if (isMobile) {
      setShowMobileOverlay(false)
      setSidebarExpanded(false)
    }
  }

  return (
    <div className={styles.container}>
      <YouTubeHeader
        onMenuClick={handleMenuClick}
        onSearchChange={onSearchChange}
        searchQuery={searchQuery}
      />

      <div className={styles.layout}>
        <YouTubeSidebar
          expanded={sidebarExpanded}
          currentPath={currentPath}
          isMobile={isMobile}
          showOverlay={showMobileOverlay}
          onClose={closeMobileMenu}
        />

        <main
          className={styles.main}
          style={{
            marginLeft: isMobile
              ? '0'
              : sidebarExpanded
              ? 'var(--sidebar-width-expanded)'
              : 'var(--sidebar-width-collapsed)'
          }}
        >
          {showCategoryChips && categoryChipsComponent}
          {children}
        </main>
      </div>

      {isMobile && showMobileOverlay && (
        <div className={styles.overlay} onClick={closeMobileMenu} />
      )}
    </div>
  )
}
