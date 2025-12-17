import HomeClient from './HomeClient'
import { Curso } from '@/lib/types'

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_SITE_URL
  ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/graphql`
  : 'http://localhost:3000/api/graphql'

async function fetchCursos(): Promise<Curso[]> {
  const query = `
    query {
      cursos {
        slug
        frontmatter {
          id
          title
          thumb
          canal
          data
          dataCriacao
          duracao
          nivel
          categoria
          tags
          descricao
          url
        }
        content
      }
    }
  `

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query }),
    cache: 'no-store'
  })

  const { data } = await response.json()
  return data.cursos
}

async function fetchCategories(): Promise<string[]> {
  const query = `
    query {
      categories
    }
  `

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query }),
    cache: 'no-store'
  })

  const { data } = await response.json()
  return data.categories
}

export default async function HomePage() {
  const cursos = await fetchCursos()
  const categories = await fetchCategories()

  return <HomeClient cursos={cursos} categories={categories} />
}
