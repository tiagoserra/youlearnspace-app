# Configuração do Banco de Dados

Este guia explica como configurar e usar o PostgreSQL com Docker e Prisma ORM no projeto YouLearnSpace.

## Índice

- [Quick Start](#quick-start)
- [Pré-requisitos](#pré-requisitos)
- [Configuração Local](#configuração-local-desenvolvimento)
- [Schema do Banco de Dados](#schema-do-banco-de-dados)
- [API Endpoints](#api-endpoints)
- [Comandos Úteis](#comandos-úteis)
- [Troubleshooting](#troubleshooting)
- [Deploy em Produção](#deploy-em-produção)
- [Segurança](#segurança)

---

## Quick Start

```bash
# 1. Subir o banco de dados
docker compose up -d

# 2. Configurar variáveis de ambiente
cp .env.local.example .env

# 3. Executar migrations
npx prisma generate
npx prisma migrate dev

# 4. Iniciar aplicação
npm run dev
```

---

## Pré-requisitos

- **Docker e Docker Compose** instalados ([Docker Desktop](https://www.docker.com/products/docker-desktop))
- **Node.js 18+** instalado
- **npm** ou **yarn**

---

## Configuração Local (Desenvolvimento)

### 1. Iniciar o Banco de Dados com Docker

O projeto usa Docker para executar o PostgreSQL localmente, garantindo um ambiente consistente.

```bash
# Iniciar o container PostgreSQL em background
docker compose up -d

# Verificar se o container está rodando
docker compose ps

# Ver logs em tempo real (opcional)
docker compose logs -f postgres
```

**Configurações do Container:**

| Configuração | Valor                        |
|--------------|------------------------------|
| Host         | `localhost`                  |
| Porta        | `5432`                       |
| Usuário      | `youlearnspace`              |
| Senha        | `youlearnspace_dev_password` |
| Database     | `youlearnspace_db`           |
| Container    | `youlearnspace_postgres`     |

### 2. Configurar Variáveis de Ambiente

Crie o arquivo `.env` na raiz do projeto:

```bash
cp .env.local.example .env
```

**Variáveis Obrigatórias:**

```env
# Conexão com o banco de dados (mesmas credenciais do docker-compose.yml)
DATABASE_URL="postgresql://youlearnspace:youlearnspace_dev_password@localhost:5432/youlearnspace_db?schema=public"

# Configurações do site
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_NAME="YouLearnSpace"

# Autenticação JWT (gere uma chave forte aleatória)
JWT_SECRET="your-secret-key-here-change-in-production"

# reCAPTCHA (opcional, para formulário de sugestões)
RECAPTCHA_SECRET_KEY="your-recaptcha-secret-key"
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="your-recaptcha-site-key"
```

> **Importante:** Nunca commite o arquivo `.env` no Git! Ele já está no `.gitignore`.

### 3. Executar Migrations do Prisma

O Prisma gerencia o schema do banco de dados através de migrations.

```bash
# 1. Gerar o Prisma Client (cria tipagens TypeScript)
npx prisma generate

# 2. Criar tabelas no banco de dados (aplica migrations)
npx prisma migrate dev

# 3. (Opcional) Visualizar dados com Prisma Studio
npx prisma studio
```

**O que acontece em cada comando:**

- `prisma generate` → Gera o cliente TypeScript baseado no `schema.prisma`
- `prisma migrate dev` → Cria/atualiza tabelas no banco de dados local
- `prisma studio` → Abre interface web em `http://localhost:5555` para visualizar/editar dados

### 4. Testar a Aplicação

```bash
# Iniciar servidor de desenvolvimento Next.js
npm run dev
```

Acesse no navegador:
- **Homepage:** http://localhost:3000
- **Login:** http://localhost:3000/login
- **Cadastro:** http://localhost:3000/cadastro
- **Sugestões:** http://localhost:3000/sugestao

---

## Schema do Banco de Dados

O banco de dados usa **PostgreSQL** com **Prisma ORM**. O schema está definido em `prisma/schema.prisma`.

### Tabela: `Usuario`

Armazena dados dos usuários cadastrados.

| Campo      | Tipo     | Descrição                                    |
|------------|----------|----------------------------------------------|
| id         | String   | ID único (CUID)                              |
| nome       | String   | Nome completo do usuário                     |
| email      | String   | Email (único, usado para login)              |
| senha      | String   | Senha hasheada com bcrypt                    |
| theme      | String?  | Tema preferido: "light", "dark" ou "system"  |
| createdAt  | DateTime | Data de criação (auto)                       |
| updatedAt  | DateTime | Data de atualização (auto)                   |

**Relações:**
- Um usuário pode ter vários `UsuarioCurso` (progresso de cursos)
- Um usuário pode ter várias `Sugestao` (sugestões de cursos)

### Tabela: `UsuarioCurso`

Rastreia progresso e interações do usuário com cursos.

| Campo          | Tipo     | Descrição                                        |
|----------------|----------|--------------------------------------------------|
| id             | String   | ID único (CUID)                                  |
| usuarioId      | String   | ID do usuário (FK → Usuario)                     |
| cursoId        | String   | ID do curso (formato: `/cursos/{slug}/`)         |
| liked          | Boolean  | Curso foi curtido? (padrão: false)               |
| completed      | Boolean  | Curso foi concluído? (padrão: false)             |
| inProgress     | Boolean  | Curso está em andamento? (padrão: false)         |
| videoProgress  | Json?    | Progresso do vídeo (tempo assistido)             |
| lastAccessedAt | DateTime | Última vez que o curso foi acessado              |
| createdAt      | DateTime | Data de criação (auto)                           |
| updatedAt      | DateTime | Data de atualização (auto)                       |

**Índices:**
- Índice único em `(usuarioId, cursoId)` - evita duplicatas
- Índice em `liked` - otimiza busca de cursos curtidos
- Índice em `completed` - otimiza busca de cursos concluídos
- Índice em `lastAccessedAt` - otimiza busca de histórico

### Tabela: `Sugestao`

Armazena sugestões de cursos enviadas por usuários autenticados.

| Campo          | Tipo     | Descrição                                   |
|----------------|----------|---------------------------------------------|
| id             | String   | ID único (CUID)                             |
| usuarioId      | String   | ID do usuário que sugeriu (FK → Usuario)    |
| nome           | String   | Nome do sugerente (cópia do nome do usuário)|
| email          | String   | Email do sugerente (cópia do email)         |
| tituloSugestao | String   | Título do curso sugerido                    |
| urlCurso       | String   | URL do YouTube do curso                     |
| categoria      | String   | Categoria do curso (ex: "Front-end")        |
| descricao      | Text     | Descrição detalhada da sugestão             |
| createdAt      | DateTime | Data de criação (auto)                      |
| updatedAt      | DateTime | Data de atualização (auto)                  |

**Índice:**
- Índice em `usuarioId` - otimiza busca de sugestões por usuário

## API Endpoints

A aplicação expõe várias rotas de API para autenticação, gerenciamento de cursos e sugestões.

### Autenticação

#### `POST /api/auth/register`

Criar nova conta de usuário.

**Request Body:**
```json
{
  "nome": "João Silva",
  "email": "joao@example.com",
  "senha": "SenhaSegura123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Usuário criado com sucesso!",
  "user": {
    "id": "clxxx...",
    "nome": "João Silva",
    "email": "joao@example.com"
  }
}
```

#### `POST /api/auth/login`

Fazer login (retorna JWT em cookie HTTP-only).

**Request Body:**
```json
{
  "email": "joao@example.com",
  "senha": "SenhaSegura123"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "clxxx...",
    "nome": "João Silva",
    "email": "joao@example.com",
    "theme": "dark"
  }
}
```

**Cookie:** `auth-token` (JWT, HTTP-only, 7 dias)

#### `POST /api/auth/logout`

Fazer logout (limpa cookie JWT).

**Response (200):**
```json
{
  "success": true,
  "message": "Logout realizado com sucesso"
}
```

#### `GET /api/auth/me`

Obter dados do usuário autenticado.

**Response (200):**
```json
{
  "user": {
    "id": "clxxx...",
    "nome": "João Silva",
    "email": "joao@example.com",
    "theme": "dark"
  }
}
```

#### `POST /api/auth/theme`

Salvar preferência de tema do usuário.

**Request Body:**
```json
{
  "theme": "dark"
}
```

**Response (200):**
```json
{
  "success": true,
  "theme": "dark"
}
```

---

### Gerenciamento de Cursos

Todos os endpoints de cursos requerem autenticação (JWT no cookie).

#### `POST /api/cursos/[slug]/like`

Curtir/descurtir curso.

**Response (200):**
```json
{
  "success": true,
  "liked": true
}
```

#### `POST /api/cursos/[slug]/start`

Marcar curso como iniciado.

**Response (200):**
```json
{
  "success": true,
  "inProgress": true
}
```

#### `POST /api/cursos/[slug]/complete`

Marcar curso como concluído.

**Response (200):**
```json
{
  "success": true,
  "completed": true
}
```

#### `POST /api/cursos/[slug]/progress`

Salvar progresso do vídeo.

**Request Body:**
```json
{
  "currentTime": 120.5,
  "duration": 3600
}
```

**Response (200):**
```json
{
  "success": true
}
```

#### `GET /api/cursos/[slug]/status`

Obter status do curso para o usuário.

**Response (200):**
```json
{
  "liked": true,
  "completed": false,
  "inProgress": true,
  "videoProgress": {
    "currentTime": 120.5,
    "duration": 3600
  }
}
```

#### `GET /api/cursos/liked`

Listar todos os cursos curtidos pelo usuário.

**Response (200):**
```json
{
  "cursos": [
    {
      "id": "clxxx...",
      "cursoId": "/cursos/react-do-zero/",
      "liked": true,
      "updatedAt": "2024-12-16T10:30:00.000Z"
    }
  ]
}
```

#### `GET /api/cursos/history`

Obter histórico de cursos acessados.

**Response (200):**
```json
{
  "cursos": [
    {
      "id": "clxxx...",
      "cursoId": "/cursos/react-do-zero/",
      "inProgress": true,
      "lastAccessedAt": "2024-12-16T10:30:00.000Z"
    }
  ]
}
```

---

### Sugestões de Cursos

#### `POST /api/sugestao`

Criar nova sugestão de curso (requer autenticação).

**Request Body:**
```json
{
  "nome": "João Silva",
  "email": "joao@example.com",
  "tituloSugestao": "Curso de React",
  "urlCurso": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "categoria": "Front-end",
  "descricao": "Curso completo de React..."
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Sugestão recebida com sucesso!",
  "id": "clxxx..."
}
```

#### `GET /api/sugestao`

Listar todas as sugestões (para admin).

**Response (200):**
```json
{
  "sugestoes": [
    {
      "id": "clxxx...",
      "usuarioId": "clyyy...",
      "nome": "João Silva",
      "email": "joao@example.com",
      "tituloSugestao": "Curso de React",
      "urlCurso": "https://www.youtube.com/watch?v=...",
      "categoria": "Front-end",
      "descricao": "Curso completo de React...",
      "createdAt": "2024-12-16T10:30:00.000Z",
      "updatedAt": "2024-12-16T10:30:00.000Z"
    }
  ]
}
```

---

## Comandos Úteis

### Docker

Gerenciar o container PostgreSQL:

```bash
# Ver status dos containers
docker compose ps

# Ver logs em tempo real
docker compose logs -f postgres

# Parar o container (mantém os dados)
docker compose down

# Reiniciar o container
docker compose restart

# Acessar PostgreSQL via CLI
docker exec -it youlearnspace_postgres psql -U youlearnspace -d youlearnspace_db
```

**Comandos Destrutivos:**

```bash
# ⚠️ ATENÇÃO: Remove container E todos os dados!
docker compose down -v

# Remover apenas o volume de dados
docker volume rm youlearnspace_next_postgres_data
```

### Prisma

Gerenciar schema e migrations:

```bash
# Gerar Prisma Client após mudanças no schema.prisma
npx prisma generate

# Criar nova migration (desenvolvimento)
npx prisma migrate dev --name descricao_da_mudanca

# Aplicar migrations em produção
npx prisma migrate deploy

# Visualizar dados com interface web (http://localhost:5555)
npx prisma studio

# Fazer pull do schema de um banco existente
npx prisma db pull

# Push schema sem criar migration (prototipagem rápida)
npx prisma db push
```

**Comandos Destrutivos:**

```bash
# ⚠️ ATENÇÃO: Apaga TODOS os dados e reaplica migrations!
npx prisma migrate reset

# ⚠️ ATENÇÃO: Remove todas as tabelas
npx prisma db execute --stdin <<< "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
```

### Exemplos Práticos

**Adicionar um novo campo ao schema:**

```bash
# 1. Edite prisma/schema.prisma
# 2. Crie migration
npx prisma migrate dev --name adiciona_campo_x

# 3. Regenere o Prisma Client
npx prisma generate
```

**Consultar dados diretamente no PostgreSQL:**

```bash
# Acessar CLI do PostgreSQL
docker exec -it youlearnspace_postgres psql -U youlearnspace -d youlearnspace_db

# Exemplos de queries SQL:
# SELECT * FROM "Usuario";
# SELECT * FROM "UsuarioCurso" WHERE liked = true;
# SELECT COUNT(*) FROM "Sugestao";
# \dt -- Listar todas as tabelas
# \d "Usuario" -- Ver estrutura da tabela Usuario
# \q -- Sair
```

---

## Troubleshooting

### "Can't reach database server"

**Problema:** Prisma não consegue conectar ao PostgreSQL.

**Soluções:**

1. **Verificar se o Docker está rodando:**
   ```bash
   docker ps
   ```
   Se não retornar nenhum container, inicie o Docker Desktop.

2. **Verificar se o container PostgreSQL está ativo:**
   ```bash
   docker compose ps
   ```
   Deve mostrar `youlearnspace_postgres` com status "Up".

3. **Testar conexão diretamente:**
   ```bash
   docker exec -it youlearnspace_postgres pg_isready -U youlearnspace
   ```
   Deve retornar: `localhost:5432 - accepting connections`

4. **Ver logs do container:**
   ```bash
   docker compose logs postgres
   ```

5. **Reiniciar o container:**
   ```bash
   docker compose restart postgres
   ```

---

### "Prisma Client is not generated"

**Problema:** O Prisma Client não foi gerado após mudanças no schema.

**Solução:**
```bash
npx prisma generate
```

Sempre execute após modificar `prisma/schema.prisma`.

---

### "Port 5432 is already in use"

**Problema:** A porta 5432 já está sendo usada por outro PostgreSQL.

**Solução:**

1. **Opção 1: Parar o outro PostgreSQL**
   ```bash
   # macOS (Homebrew)
   brew services stop postgresql

   # Linux (systemd)
   sudo systemctl stop postgresql
   ```

2. **Opção 2: Mudar a porta do Docker**

   Edite `docker-compose.yml`:
   ```yaml
   ports:
     - '5433:5432'  # Muda porta externa para 5433
   ```

   Atualize `.env`:
   ```env
   DATABASE_URL="postgresql://youlearnspace:youlearnspace_dev_password@localhost:5433/youlearnspace_db?schema=public"
   ```

---

### "Migration failed" ou "P3009: migrate found failed migration"

**Problema:** Migration anterior falhou e deixou o banco em estado inconsistente.

**Solução:**

1. **Ver status das migrations:**
   ```bash
   npx prisma migrate status
   ```

2. **Marcar migration como aplicada (se já foi aplicada manualmente):**
   ```bash
   npx prisma migrate resolve --applied "NOME_DA_MIGRATION"
   ```

3. **Marcar migration como revertida:**
   ```bash
   npx prisma migrate resolve --rolled-back "NOME_DA_MIGRATION"
   ```

4. **Última opção - Resetar banco (⚠️ apaga todos os dados):**
   ```bash
   npx prisma migrate reset
   ```

---

### "Authentication failed" no Prisma

**Problema:** Credenciais incorretas na `DATABASE_URL`.

**Solução:**

Verifique se a `DATABASE_URL` no `.env` está correta:
```env
DATABASE_URL="postgresql://youlearnspace:youlearnspace_dev_password@localhost:5432/youlearnspace_db?schema=public"
```

Deve usar **exatamente** as mesmas credenciais do `docker-compose.yml`:
- Usuário: `youlearnspace`
- Senha: `youlearnspace_dev_password`
- Database: `youlearnspace_db`

---

### Container não inicia ou reinicia constantemente

**Problema:** Container PostgreSQL não consegue iniciar.

**Solução:**

1. **Ver logs detalhados:**
   ```bash
   docker compose logs -f postgres
   ```

2. **Remover container e volume (⚠️ apaga dados):**
   ```bash
   docker compose down -v
   docker compose up -d
   ```

3. **Verificar espaço em disco:**
   ```bash
   df -h
   ```

---

### "FATAL: role 'postgres' does not exist"

**Problema:** Tentando conectar com usuário errado.

**Solução:**

Use o usuário correto definido no `docker-compose.yml`: `youlearnspace`

```bash
# Correto
docker exec -it youlearnspace_postgres psql -U youlearnspace -d youlearnspace_db

# Errado
docker exec -it youlearnspace_postgres psql -U postgres
```

---

## Deploy em Produção

Para ambientes de produção, **não use Docker**. Utilize um serviço de PostgreSQL gerenciado.

### Serviços Recomendados

| Serviço           | Tipo        | Free Tier | Link                              |
|-------------------|-------------|-----------|-----------------------------------|
| **Vercel Postgres** | Serverless  | Sim       | https://vercel.com/storage/postgres |
| **Neon**          | Serverless  | Sim       | https://neon.tech                 |
| **Supabase**      | Managed     | Sim       | https://supabase.com              |
| **Railway**       | Managed     | Limitado  | https://railway.app               |
| **AWS RDS**       | Managed     | Trial     | https://aws.amazon.com/rds        |

### Passos para Deploy

#### 1. Criar Banco de Dados

Escolha um dos serviços acima e crie um banco PostgreSQL.

#### 2. Configurar Variáveis de Ambiente

No painel do serviço de hospedagem (Vercel, Railway, etc.), adicione:

```env
# Obrigatórias
DATABASE_URL="postgresql://usuario:senha@host:5432/database?sslmode=require"
JWT_SECRET="chave-forte-aleatoria-minimo-32-caracteres"
NEXT_PUBLIC_SITE_URL="https://seudominio.com"
NEXT_PUBLIC_SITE_NAME="YouLearnSpace"

# Opcionais (reCAPTCHA)
RECAPTCHA_SECRET_KEY="sua-chave-secreta"
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="sua-chave-site"
```

**Importante:**
- Use `sslmode=require` na `DATABASE_URL` para conexão segura
- Gere um `JWT_SECRET` forte: `openssl rand -base64 32`

#### 3. Aplicar Migrations

Execute migrations no banco de produção:

```bash
npx prisma migrate deploy
```

**Não use** `prisma migrate dev` em produção!

#### 4. Verificar Conexão

Teste a conexão:

```bash
npx prisma db pull
```

### Exemplo: Deploy na Vercel com Vercel Postgres

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Fazer login
vercel login

# 3. Criar projeto Vercel Postgres no dashboard
# https://vercel.com/dashboard/storage

# 4. Linkar projeto
vercel link

# 5. Adicionar variáveis de ambiente no dashboard
# DATABASE_URL será preenchida automaticamente pelo Vercel Postgres

# 6. Deploy
vercel --prod

# 7. Aplicar migrations
vercel env pull .env.local
npx prisma migrate deploy
```

### Exemplo: Deploy no Railway

```bash
# 1. Criar conta no Railway: https://railway.app

# 2. Criar novo projeto PostgreSQL no dashboard

# 3. Copiar DATABASE_URL do dashboard

# 4. Adicionar variáveis de ambiente no Railway:
#    - DATABASE_URL (gerada automaticamente)
#    - JWT_SECRET
#    - NEXT_PUBLIC_SITE_URL
#    - etc.

# 5. Conectar repositório GitHub

# 6. Railway fará deploy automaticamente

# 7. Aplicar migrations (na aba "Deploy Logs" ou localmente):
npx prisma migrate deploy
```

---

## Segurança

### Checklist de Segurança

- [ ] **NUNCA** commite o arquivo `.env` no Git (verificar `.gitignore`)
- [ ] Use senhas fortes e únicas em produção (mínimo 16 caracteres)
- [ ] Configure SSL/TLS para conexões de banco (`sslmode=require`)
- [ ] Gere `JWT_SECRET` forte e único: `openssl rand -base64 32`
- [ ] Limite acesso ao banco apenas para IPs autorizados (firewall)
- [ ] Use variáveis de ambiente para todas as credenciais
- [ ] Habilite conexão SSL no Prisma para produção
- [ ] Configure backups automáticos do banco
- [ ] Use diferentes credenciais para dev/staging/produção
- [ ] Revise logs de acesso regularmente

### Configuração SSL no Prisma (Produção)

Para conexões seguras em produção:

```env
# Adicione parâmetros SSL na DATABASE_URL
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require&sslcert=./cert.pem"
```

Ou configure no `schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")

  // Configurações SSL
  relationMode = "prisma"
}
```

### Rotação de Senhas

Periodicamente, rotacione credenciais:

1. Gere nova senha no serviço de banco
2. Atualize `DATABASE_URL` nas variáveis de ambiente
3. Faça redeploy da aplicação
4. Revogue a senha antiga

### Monitoramento

Configure alertas para:
- Conexões falhadas
- Queries lentas (> 1s)
- Uso de CPU/memória alto
- Espaço em disco baixo

**Ferramentas:**
- Vercel Analytics
- Railway Metrics
- Prisma Pulse (monitoring oficial)
- Sentry (error tracking)

---

## Recursos Adicionais

- **Documentação Prisma:** https://www.prisma.io/docs
- **PostgreSQL Docs:** https://www.postgresql.org/docs
- **Docker Docs:** https://docs.docker.com
- **Next.js + Prisma:** https://www.prisma.io/nextjs
- **Prisma Best Practices:** https://www.prisma.io/docs/guides/performance-and-optimization

---

**Dúvidas?** Abra uma issue no repositório ou consulte a documentação oficial.
