import { createYoga } from 'graphql-yoga'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { typeDefs } from '@/lib/graphql/schema'
import { resolvers } from '@/lib/graphql/resolvers'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthTokenFromRequest, verifyToken, JWTPayload } from '@/lib/auth'

export interface GraphQLContext {
  user: JWTPayload | null
}

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
})

const isProduction = process.env.NODE_ENV === 'production'

const yoga = createYoga<{ request: NextRequest }>({
  schema,
  graphqlEndpoint: '/api/graphql',
  fetchAPI: { Response },
  graphiql: !isProduction,
  maskedErrors: isProduction,
  context: async ({ request }): Promise<GraphQLContext> => {
    const token = getAuthTokenFromRequest(request)
    const user = token ? verifyToken(token) : null
    return { user }
  }
})

export async function GET(request: NextRequest) {
  if (isProduction) {
    return NextResponse.json(
      { error: 'GraphQL playground não disponível em produção' },
      { status: 403 }
    )
  }
  return yoga.handleRequest(request, { request })
}

export async function POST(request: NextRequest) {
  return yoga.handleRequest(request, { request })
}
