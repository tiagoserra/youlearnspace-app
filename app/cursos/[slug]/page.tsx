import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllCursos, getCursoBySlug } from '@/lib/cursos'
import CursoClient from './CursoClient'

export async function generateStaticParams() {
  const cursos = await getAllCursos()
  return cursos.map((curso) => ({
    slug: curso.slug
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params
  const curso = await getCursoBySlug(resolvedParams.slug)

  if (!curso) {
    return {
      title: 'Curso não encontrado'
    }
  }

  return {
    title: curso.frontmatter.title,
    description: curso.frontmatter.descricao,
    openGraph: {
      title: curso.frontmatter.title,
      description: curso.frontmatter.descricao,
      images: [
        {
          url: curso.frontmatter.thumb,
          width: 1280,
          height: 720,
          alt: curso.frontmatter.title
        }
      ],
      type: 'article'
    },
    twitter: {
      card: 'summary_large_image',
      title: curso.frontmatter.title,
      description: curso.frontmatter.descricao,
      images: [curso.frontmatter.thumb]
    }
  }
}

export default async function CursoPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params
  const curso = await getCursoBySlug(resolvedParams.slug)

  if (!curso) {
    notFound()
  }

  return <CursoClient curso={curso} />
}
