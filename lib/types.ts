
export interface CursoFrontmatter {
  id: string
  title: string
  thumb: string
  canal: string
  data: string
  dataCriacao: string
  duracao: string
  nivel: 'Iniciante' | 'Intermediário' | 'Avançado'
  categoria: 'Front-end' | 'Back-end' | 'Mobile' | 'Data Science' | 'DevOps' | 'Design' | 'Soft Skills'
  tags: string[]
  descricao: string
  url: string
}

export interface Curso {
  slug: string
  frontmatter: CursoFrontmatter
  content: string
}

export interface VideoProgress {
  currentTime: number
  duration: number
  lastUpdated: number | null
}

export interface CursoRecord {
  cursoId: string
  liked: boolean
  status: 'nao-iniciado' | 'em-andamento' | 'concluido'
  likedAt: number | null
  startedAt: number | null
  completedAt: number | null
  lastAccessedAt: number | null
  videoProgress: VideoProgress
}

export interface DarkModeContextType {
  isDarkMode: boolean
  toggleDarkMode: () => void
  isLoading: boolean
}

export interface CourseCardProps {
  curso: Curso
  status?: Partial<CursoRecord>
}

export interface YouTubePlayerProps {
  videoId: string
  cursoId: string
  title: string
  onComplete?: () => void
}

export interface LikeButtonProps {
  cursoId: string
  initialLiked: boolean
}

export interface CompleteButtonProps {
  cursoId: string
  initialStatus: 'nao-iniciado' | 'em-andamento' | 'concluido'
}

export interface RelatarProblemaProps {
  cursoTitulo: string
}

export interface YouTubeLayoutProps {
  children: React.ReactNode
  showCategoryChips?: boolean
  categoryChipsComponent?: React.ReactNode
  currentPath: string
  onSearchChange?: (query: string) => void
  searchQuery?: string
}

export interface YouTubeHeaderProps {
  onMenuClick: () => void
  onSearchChange?: (query: string) => void
  searchQuery?: string
}

export interface YouTubeSidebarProps {
  expanded: boolean
  currentPath: string
}

export interface UserMenuProps {}

export interface CategoryChipsProps {
  categories: string[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
  sidebarExpanded: boolean
  isMobile: boolean
}

export interface SugestaoFormData {
  nome: string
  email: string
  tituloSugestao: string
  urlCurso: string
  categoria: string
  descricao: string
}
