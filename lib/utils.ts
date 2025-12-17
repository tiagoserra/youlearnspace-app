export function formatDuration(duration: string): string {
  return duration
}

export function formatDate(date: string): string {
  const d = new Date(date)
  return d.toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function getCursoIdFromSlug(slug: string): string {
  return `/cursos/${slug}/`
}

export function formatVideoTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
