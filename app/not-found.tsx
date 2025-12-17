import Link from 'next/link'
import styles from './not-found.module.css'

export default function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1>404</h1>
        <h2>Página Não Encontrada</h2>
        <p>A página que você procura não existe ou foi removida.</p>
        <Link href="/" className={styles.button}>
          Voltar para Home
        </Link>
      </div>
    </div>
  )
}
