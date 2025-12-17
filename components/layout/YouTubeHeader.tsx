'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, Search, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { YouTubeHeaderProps } from '@/lib/types'
import UserMenu from './UserMenu'
import styles from './YouTubeHeader.module.css'

export default function YouTubeHeader({
  onMenuClick,
  onSearchChange,
  searchQuery = ''
}: YouTubeHeaderProps) {
  const t = useTranslations('nav')
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [localSearch, setLocalSearch] = useState(searchQuery)

  const handleSearchChange = (value: string) => {
    setLocalSearch(value)
    onSearchChange?.(value)
  }

  const clearSearch = () => {
    setLocalSearch('')
    onSearchChange?.('')
  }

  return (
    <>
      <header className={styles.header}>
        <div className={styles.left}>
          <button
            className={styles.menuButton}
            onClick={onMenuClick}
            aria-label="Menu"
          >
            <Menu size={24} />
          </button>

          <Link href="/" className={styles.logo}>
            <span className={styles.logoYou}>You</span>
            <span className={styles.logoLearn}>Learn</span>
            <span className={styles.logoSpace}>Space</span>
          </Link>
        </div>

        <div className={`${styles.searchContainer} ${styles.hideMobile}`}>
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder={t('search')}
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              className={styles.searchInput}
            />
            {localSearch && (
              <button
                className={styles.clearButton}
                onClick={clearSearch}
                aria-label={t('search')}
              >
                <X size={20} />
              </button>
            )}
            <button className={styles.searchButton} aria-label={t('search')}>
              <Search size={20} />
            </button>
          </div>
        </div>

        <div className={styles.right}>
          <button
            className={`${styles.iconButton} ${styles.hideDesktop}`}
            onClick={() => setShowMobileSearch(true)}
            aria-label={t('search')}
          >
            <Search size={24} />
          </button>

          <UserMenu />
        </div>
      </header>

      {showMobileSearch && (
        <div className={styles.mobileSearchModal}>
          <div className={styles.mobileSearchHeader}>
            <button
              className={styles.iconButton}
              onClick={() => setShowMobileSearch(false)}
              aria-label="Fechar busca"
            >
              <X size={24} />
            </button>
            <input
              type="text"
              placeholder="Buscar cursos..."
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              className={styles.mobileSearchInput}
              autoFocus
            />
          </div>
        </div>
      )}
    </>
  )
}
