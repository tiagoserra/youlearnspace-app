'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Sun, Moon, LogOut, LogIn, UserPlus, Settings } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useDarkMode } from '@/context/DarkModeContext'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { fetchCurrentUser, logout } from '@/lib/redux/slices/authSlice'
import styles from './UserMenu.module.css'

export default function UserMenu() {
  const t = useTranslations()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user, isLoading } = useAppSelector((state) => state.auth)
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  useEffect(() => {
    dispatch(fetchCurrentUser())
  }, [dispatch])

  const handleLogout = async () => {
    await dispatch(logout())
    setIsOpen(false)
    router.push('/')
    router.refresh()
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const primeiroNome = user?.nome.split(' ')[0] || ''

  return (
    <div className={styles.container} ref={menuRef}>
      {!isLoading && user && (
        <span className={styles.userName}>{t('nav.hello', { name: primeiroNome })}</span>
      )}
      <button
        className={styles.avatarButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('nav.userMenu')}
      >
        <User size={24} />
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <button
            className={styles.menuItem}
            onClick={() => {
              toggleDarkMode()
              setIsOpen(false)
            }}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            <span>{isDarkMode ? t('theme.light') : t('theme.dark')}</span>
          </button>
          {user && (
            <>
              <div className={styles.divider} />
              <Link
                href="/perfil"
                className={styles.menuItem}
                onClick={() => setIsOpen(false)}
              >
                <Settings size={20} />
                <span>{t('nav.profile')}</span>
              </Link>
            </>
          )}
          <div className={styles.divider} />
          {user ? (
            <button
              className={styles.menuItem}
              onClick={handleLogout}
            >
              <LogOut size={20} />
              <span>{t('auth.logout')}</span>
            </button>
          ) : (
            <>
              <Link
                href="/login"
                className={styles.menuItem}
                onClick={() => setIsOpen(false)}
              >
                <LogIn size={20} />
                <span>{t('auth.login')}</span>
              </Link>
              <Link
                href="/cadastro"
                className={styles.menuItem}
                onClick={() => setIsOpen(false)}
              >
                <UserPlus size={20} />
                <span>{t('auth.register')}</span>
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  )
}
