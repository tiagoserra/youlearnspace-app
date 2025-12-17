import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { Curso, CursoFrontmatter } from './types'

const cursosDirectory = path.join(process.cwd(), 'data/cursos')

export async function getAllCursos(): Promise<Curso[]> {
  try {
    if (!fs.existsSync(cursosDirectory)) {
      console.warn('Cursos directory does not exist:', cursosDirectory)
      return []
    }

    const filenames = fs.readdirSync(cursosDirectory)

    const cursos = filenames
      .filter(filename => filename.endsWith('.mdx'))
      .map(filename => {
        const slug = filename.replace(/\.mdx$/, '')
        const fullPath = path.join(cursosDirectory, filename)
        const fileContents = fs.readFileSync(fullPath, 'utf8')
        const { data, content } = matter(fileContents)

        return {
          slug,
          frontmatter: data as CursoFrontmatter,
          content
        }
      })

    return cursos.sort((a, b) => {
      const dateA = new Date(a.frontmatter.dataCriacao).getTime()
      const dateB = new Date(b.frontmatter.dataCriacao).getTime()
      return dateB - dateA
    })
  } catch (error) {
    console.error('Error reading cursos:', error)
    return []
  }
}

export async function getCursoBySlug(slug: string): Promise<Curso | null> {
  try {
    const fullPath = path.join(cursosDirectory, `${slug}.mdx`)

    if (!fs.existsSync(fullPath)) {
      console.warn('Curso file not found:', fullPath)
      return null
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)

    return {
      slug,
      frontmatter: data as CursoFrontmatter,
      content
    }
  } catch (error) {
    console.error('Error reading curso:', error)
    return null
  }
}

export async function getAllCategories(): Promise<string[]> {
  const cursos = await getAllCursos()
  const categories = Array.from(new Set(cursos.map(c => c.frontmatter.categoria)))
  return ['Todos', ...categories.sort()]
}
