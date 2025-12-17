import { getAllCursos, getCursoBySlug, getAllCategories } from '@/lib/cursos'

export const resolvers = {
  Query: {
    cursos: async () => {
      const cursos = await getAllCursos()

      return cursos
    },

    curso: async (_: unknown, { slug }: { slug: string }) => {
      return await getCursoBySlug(slug)
    },

    categories: async () => {
      return await getAllCategories()
    }
  }
}
