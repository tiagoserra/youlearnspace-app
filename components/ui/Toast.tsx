'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import { useToast, Toast as ToastType } from '@/context/ToastContext'
import styles from './Toast.module.css'

const iconMap = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle
}

function ToastItem({ toast }: { toast: ToastType }) {
  const { removeToast } = useToast()
  const [isExiting, setIsExiting] = useState(false)

  const Icon = iconMap[toast.type]

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      removeToast(toast.id)
    }, 300)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose()
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={`${styles.toast} ${styles[toast.type]} ${isExiting ? styles.exiting : ''}`}>
      <div className={`${styles.icon} ${styles[toast.type]}`}>
        <Icon size={20} />
      </div>
      <div className={styles.content}>
        <p className={styles.message}>{toast.message}</p>
      </div>
      <button
        type="button"
        className={styles.closeButton}
        onClick={handleClose}
        aria-label="Fechar notificação"
      >
        <X size={16} />
      </button>
    </div>
  )
}

export default function ToastContainer() {
  const { toasts } = useToast()

  if (toasts.length === 0) {
    return null
  }

  return (
    <div className={styles.container} role="region" aria-label="Notificações">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}
