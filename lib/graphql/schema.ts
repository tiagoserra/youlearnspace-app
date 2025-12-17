export const typeDefs = /* GraphQL */ `
  type CursoFrontmatter {
    id: String!
    title: String!
    thumb: String!
    canal: String!
    data: String!
    dataCriacao: String!
    duracao: String!
    nivel: String!
    categoria: String!
    tags: [String!]!
    descricao: String!
    url: String!
  }

  type Curso {
    slug: String!
    frontmatter: CursoFrontmatter!
    content: String!
  }

  type Query {
    cursos: [Curso!]!
    curso(slug: String!): Curso
    categories: [String!]!
  }
`
