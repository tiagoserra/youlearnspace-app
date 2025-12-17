# YouLearnSpace - Next.js 16

> Plataforma de curadoria de cursos gratuitos do YouTube com UI inspirada no YouTube

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/)

## 📚 Índice

- [Quick Start](#-quick-start-5-minutos)
- [Instalação Detalhada](#%EF%B8%8F-instalação-e-desenvolvimento-local)
- [Deploy na Vercel](#-deploy-na-vercel-plataforma-oficial)
- [Troubleshooting](#-troubleshooting)
- [Stack Tecnológica](#-stack-tecnológica)

## 📋 Sobre o Projeto

YouLearnSpace é uma plataforma moderna de curadoria de cursos gratuitos do YouTube, construída com Next.js 16, TypeScript e IndexedDB. O projeto oferece uma experiência completa de aprendizado com tracking de progresso, dark mode e interface inspirada no YouTube.

**Filosofia:** "Seja o Protagonista do Seu Futuro" - democratizar acesso à educação de qualidade.

## ⚡ Quick Start (5 minutos)

```bash
# 1. Clone e instale
git clone <seu-repositorio>
cd youlearnspace_next
npm install

# 2. Configure variáveis de ambiente
cp .env.example .env
# Edite .env se necessário (valores padrão funcionam localmente)

# 3. Inicie o banco de dados
docker compose up -d

# 4. Configure o Prisma
npx prisma generate
npx prisma migrate dev

# 5. Rode o projeto
npm run dev

# ✅ Acesse: http://localhost:3000
```

📖 **Veja [Instalação Detalhada](#%EF%B8%8F-instalação-e-desenvolvimento-local) para mais informações**

> 🚀 **Deploy em Produção:** Este projeto foi otimizado para deploy na **[Vercel](https://vercel.com)**, a plataforma oficial do Next.js 16. Veja a [seção de deploy](#-deploy-na-vercel-plataforma-oficial) para instruções completas.

## ✨ Funcionalidades

- ✅ **Homepage** com grid responsivo de cursos
- ✅ **Busca em tempo real** (título, descrição, canal, tags, categoria)
- ✅ **Filtros por categoria** com chips clicáveis
- ✅ **Dark Mode completo** com persistência localStorage
- ✅ **IndexedDB** para tracking de progresso, curtidas e histórico
- ✅ **Layout YouTube-like** com header fixo e sidebar colapsável
- ✅ **Páginas de curso** com YouTube Player integrado
- ✅ **Sistema de curtidas** com animação
- ✅ **Marcar como concluído**
- ✅ **Histórico de acesso**
- ✅ **Cursos curtidos**
- ✅ **Formulário de sugestão** (pronto para integração)
- ✅ **Página Sobre** com informações do projeto
- ✅ **404 customizado**
- ✅ **SEO/Metadata completo**
- ✅ **Responsivo mobile-first**

## 🚀 Stack Tecnológica

- **Framework:** Next.js 16 com App Router
- **React:** 19+ com Server e Client Components
- **TypeScript:** 5+ (strict mode)
- **Styling:** CSS Modules com CSS Variables system
- **Storage:** IndexedDB (biblioteca idb) + localStorage
- **Database:** PostgreSQL 16 (Docker) + Prisma ORM
- **API:** GraphQL Yoga (curso queries)
- **Icons:** lucide-react
- **MDX:** @next/mdx + gray-matter
- **Image Optimization:** next/image
- **Deploy:** Vercel (otimizado)

## 📁 Estrutura do Projeto

```
youlearnspace_next/
├── app/                          # App Router (Next.js 15+)
│   ├── layout.tsx                # Root layout com metadata
│   ├── page.tsx                  # Homepage (Server Component)
│   ├── HomeClient.tsx            # Homepage (Client Component)
│   ├── globals.css               # CSS Variables system
│   ├── curtidos/page.tsx         # Cursos curtidos
│   ├── historico/page.tsx        # Histórico de acesso
│   ├── sugestao/page.tsx         # Formulário de sugestão
│   ├── sobre/page.tsx            # Página sobre
│   ├── cursos/[slug]/page.tsx    # Página dinâmica de curso
│   └── not-found.tsx             # 404 customizado
├── components/
│   ├── layout/
│   │   ├── YouTubeLayout.tsx     # Layout principal wrapper
│   │   ├── YouTubeHeader.tsx     # Header com logo e search
│   │   ├── YouTubeSidebar.tsx    # Sidebar com badges
│   │   └── UserMenu.tsx          # Menu com dark mode toggle
│   ├── course/
│   │   ├── CourseCard.tsx        # Card de curso
│   │   ├── LikeButton.tsx        # Botão curtir com animação
│   │   └── CompleteButton.tsx    # Botão marcar como concluído
│   └── ui/
│       └── CategoryChips.tsx     # Filtro de categorias
├── context/
│   └── DarkModeContext.tsx       # Context + Provider dark mode
├── lib/
│   ├── cursoStorage.ts           # IndexedDB operations (10 funções)
│   ├── types.ts                  # TypeScript interfaces
│   └── utils.ts                  # MDX utils e helpers
├── data/
│   └── cursos/                   # Arquivos MDX dos cursos
│       ├── curso-javascript-iniciantes-fundamentos.mdx
│       ├── curso-react-completo-hooks-context.mdx
│       └── ... (8 cursos de exemplo)
└── public/
    └── images/                   # Imagens do projeto
```

## 🎨 Cursos MDX de Exemplo

O projeto inclui **8 cursos MDX de exemplo** cobrindo diferentes categorias:

1. **JavaScript para Iniciantes** (Front-end)
2. **React Completo** (Front-end)
3. **Node.js API REST** (Back-end)
4. **Python para Data Science** (Data Science)
5. **Flutter Mobile** (Mobile)
6. **Figma UI Design** (Design)
7. **Docker e Kubernetes** (DevOps)
8. **Git e GitHub** (DevOps)

### Como Adicionar Mais Cursos

Para adicionar os restantes **36 cursos** (totalizando 44):

1. Crie um arquivo `.mdx` em `data/cursos/` seguindo o template:

```mdx
---
id: "YouTubeVideoID"              # 11 caracteres do YouTube
title: "Título Completo do Curso"
thumb: "https://img.youtube.com/vi/{id}/maxresdefault.jpg"
canal: "Nome do Canal"
data: "2023-MM-DD"
dataCriacao: "2023-MM-DD"         # Para sorting
duracao: "X horas e Y minutos"
nivel: "Iniciante"                # ou Intermediário, Avançado
categoria: "Front-end"            # Front-end, Back-end, Mobile, Data Science, DevOps, Design, Soft Skills
tags: ["Tag1", "Tag2", "Tag3"]
descricao: "Descrição do curso..."
url: "https://www.youtube.com/watch?v={id}"
---

## O que você vai aprender

Conteúdo do curso em Markdown/MDX...
```

2. O arquivo será automaticamente detectado e exibido na homepage

## 🖼️ Imagens Necessárias

Coloque as seguintes imagens em `public/images/`:

1. **youlearnspace-icon.png** - Ícone PWA (192x192px)
2. **youlearnspace.png** - Logo/OG:image (1200x630px)
3. **student-class-looking-course.jpg** - Página Sobre
4. **favicon.ico** - Favicon na raiz de `/public`

## 🛠️ Instalação e Desenvolvimento Local

### Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js 20+** ([Download](https://nodejs.org/))
- **npm** (vem com Node.js) ou **yarn**
- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop/))
- **Git** ([Download](https://git-scm.com/))

### Setup Passo a Passo

#### 1. Clone o repositório

```bash
git clone <seu-repositorio>
cd youlearnspace_next
```

#### 2. Instale as dependências

```bash
npm install
```

#### 3. Configure as variáveis de ambiente

Crie o arquivo `.env` na raiz do projeto:

```bash
# Copie o exemplo (se existir)
cp .env.example .env

# Ou crie manualmente com o conteúdo abaixo
```

**Arquivo `.env` para desenvolvimento local:**

```env
# Database (PostgreSQL via Docker)
DATABASE_URL="postgresql://youlearnspace:youlearnspace_dev_password@localhost:5432/youlearnspace_db?schema=public"

# Site Config
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_NAME="YouLearnSpace"

# Auth (gere uma chave secreta aleatória)
JWT_SECRET="sua-chave-secreta-aqui-mude-em-producao"

# reCAPTCHA (opcional - deixe em branco se não usar)
RECAPTCHA_SECRET_KEY=""
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=""
```

> **Dica:** Para gerar uma chave JWT secreta segura, use:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

#### 4. Inicie o banco de dados PostgreSQL com Docker

```bash
# Inicia o container PostgreSQL em background
docker compose up -d

# Verifique se está rodando
docker ps
```

Você deve ver o container `youlearnspace_postgres` rodando.

#### 5. Configure o banco de dados com Prisma

```bash
# Gera o Prisma Client (necessário para usar o banco)
npx prisma generate

# Executa as migrations (cria as tabelas no banco)
npx prisma migrate dev

# (Opcional) Abre o Prisma Studio para visualizar o banco
npx prisma studio
```

#### 6. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

#### 7. Acesse a aplicação

Abra seu navegador em: **http://localhost:3000**

### 🎯 Verificação Rápida

Se tudo estiver funcionando, você verá:
- ✅ Homepage com cursos de exemplo
- ✅ Sidebar colapsável funcionando
- ✅ Dark mode toggle no menu do usuário
- ✅ Busca e filtros funcionando
- ✅ Curtir/descurtir cursos (salva em IndexedDB)

### 📖 Documentação Adicional

- **Banco de dados:** Consulte [DATABASE.md](./DATABASE.md) para detalhes sobre o schema e migrations
- **Deploy:** Veja a seção de [Deploy na Vercel](#-deploy-na-vercel-plataforma-oficial) abaixo

### 🔒 Segurança

> **IMPORTANTE:** O arquivo `.env` contém informações sensíveis e **NÃO deve ser commitado** no Git. O `.gitignore` já está configurado para ignorá-lo. Use o `.env.example` como referência para criar seu `.env` local.

## 📦 Deploy na Vercel (Plataforma Oficial)

> **Este projeto foi otimizado para deploy na Vercel**, a plataforma oficial do Next.js 16. A Vercel oferece deploy automático, SSL, CDN global e integração perfeita com Next.js.

### Por que Vercel?

- ✅ **Zero configuração** - Detecta Next.js automaticamente
- ✅ **Deploy automático** - A cada push no Git
- ✅ **Preview deployments** - Para cada Pull Request
- ✅ **SSL/HTTPS** - Configurado automaticamente
- ✅ **CDN Global** - Edge caching otimizado
- ✅ **Serverless** - Escala automaticamente
- ✅ **Grátis** - Plano generoso para projetos pessoais

### 🚀 Opção 1: Deploy via Dashboard (Recomendado)

#### Passo 1: Prepare o Banco de Dados de Produção

Você precisa de um **PostgreSQL em produção**. Escolha uma destas opções:

- **[Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)** (integrado)
- **[Neon](https://neon.tech/)** (serverless, grátis)
- **[Supabase](https://supabase.com/)** (grátis com limite)
- **[Railway](https://railway.app/)** (simples)

Exemplo com **Neon** (grátis):
1. Acesse [neon.tech](https://neon.tech) e crie uma conta
2. Crie um novo projeto PostgreSQL
3. Copie a `DATABASE_URL` (Connection String)

#### Passo 2: Deploy na Vercel

1. **Acesse [vercel.com](https://vercel.com)** e faça login (pode usar GitHub)

2. **Clique em "New Project"**

3. **Importe seu repositório Git:**
   - GitHub, GitLab ou Bitbucket
   - Autorize o acesso ao repositório

4. **Configure as variáveis de ambiente:**

   Clique em "Environment Variables" e adicione:

   ```env
   # Database (use a URL do Neon, Supabase, etc)
   DATABASE_URL=postgresql://user:password@host/database

   # Site Config
   NEXT_PUBLIC_SITE_URL=https://seu-dominio.vercel.app
   NEXT_PUBLIC_SITE_NAME=YouLearnSpace

   # Auth (IMPORTANTE: gere uma nova chave para produção!)
   JWT_SECRET=sua-chave-secreta-de-producao-aqui

   # reCAPTCHA (opcional)
   RECAPTCHA_SECRET_KEY=sua-chave-recaptcha
   NEXT_PUBLIC_RECAPTCHA_SITE_KEY=sua-chave-publica-recaptcha
   ```

   > **IMPORTANTE:** Use o comando abaixo para gerar uma nova `JWT_SECRET` segura:
   > ```bash
   > node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   > ```

5. **Clique em "Deploy"**

6. **Aguarde o build** (leva ~2 minutos)

7. **Configure o banco de dados:**

   Depois do primeiro deploy, você precisa executar as migrations. Use o Vercel CLI:

   ```bash
   # Instale o Vercel CLI
   npm i -g vercel

   # Faça login
   vercel login

   # Link seu projeto
   vercel link

   # Execute as migrations em produção
   vercel env pull .env.production
   npx prisma migrate deploy
   ```

8. **Pronto!** 🎉

   Sua aplicação está no ar em: `https://seu-projeto.vercel.app`

### 🖥️ Opção 2: Deploy via CLI

```bash
# Instale o Vercel CLI
npm i -g vercel

# Faça login
vercel login

# Deploy (primeiro deploy)
vercel

# Responda as perguntas:
# - Set up and deploy? Yes
# - Which scope? (sua conta)
# - Link to existing project? No
# - Project name? youlearnspace
# - Directory? ./
# - Override settings? No

# Configure as variáveis de ambiente
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add NEXT_PUBLIC_SITE_URL

# Deploy para produção
vercel --prod

# Execute migrations
vercel env pull .env.production
npx prisma migrate deploy
```

### 🔄 Atualizações Automáticas

Após o primeiro deploy:
- **Cada push** na branch principal faz deploy automático em produção
- **Cada Pull Request** cria um preview deployment exclusivo
- **Rollback** pode ser feito com 1 clique no dashboard

### 🌐 Domínio Personalizado

1. No dashboard da Vercel, acesse seu projeto
2. Vá em **Settings** → **Domains**
3. Clique em **Add Domain**
4. Digite seu domínio (ex: `youlearnspace.com`)
5. Configure o DNS conforme instruções da Vercel
6. Aguarde propagação DNS (~24h no máximo)
7. **SSL automático** será configurado!

### 🧪 Build Local (Teste antes de Deploy)

Para testar o build de produção localmente:

```bash
# Build de produção
npm run build

# Inicia servidor de produção local
npm start

# Acesse: http://localhost:3000
```

### ⚙️ Variáveis de Ambiente

**Diferenças entre desenvolvimento e produção:**

| Variável | Desenvolvimento | Produção |
|----------|----------------|----------|
| `DATABASE_URL` | PostgreSQL Docker local | Neon/Supabase/Railway |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | `https://seu-dominio.com` |
| `JWT_SECRET` | Qualquer string | **Chave criptograficamente segura** |

### 📚 Recursos Adicionais

- 📖 [Documentação Vercel](https://vercel.com/docs)
- 📖 [Next.js Deployment](https://nextjs.org/docs/deployment)
- 📖 [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- 📖 [Prisma Deploy](https://www.prisma.io/docs/guides/deployment)

## 🎨 Customização

### CSS Variables

Todas as cores usam variáveis CSS definidas em `app/globals.css`:

```css
:root {
  --bg-primary: #f9f9f9;
  --text-primary: #0f0f0f;
  --accent-color: #FF0000;
  /* ... */
}

body.dark-mode {
  --bg-primary: #0f0f0f;
  --text-primary: #f1f1f1;
  /* ... */
}
```

Para alterar cores, edite as variáveis. NUNCA use cores hardcoded!

### Adicionar Categorias

As categorias são dinâmicas e extraídas automaticamente dos cursos MDX. Basta usar uma nova categoria no frontmatter.

## 📝 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev                    # Iniciar servidor de desenvolvimento
npm run build                  # Build de produção
npm run start                  # Servidor de produção
npm run lint                   # ESLint
npm run format                 # Prettier

# Banco de Dados
docker compose up -d           # Iniciar PostgreSQL
docker compose down            # Parar PostgreSQL
npx prisma generate            # Gerar Prisma Client
npx prisma migrate dev         # Criar e aplicar migrations
npx prisma studio              # Abrir Prisma Studio (GUI)
```

## 🐛 Troubleshooting

### ❌ Erro: "Module not found" ou dependências faltando

```bash
# Limpe cache e reinstale
rm -rf node_modules package-lock.json
npm install
```

### ❌ Erro: "Can't reach database server"

**Causa:** PostgreSQL não está rodando ou não está acessível.

**Solução:**
```bash
# Verifique se o Docker está rodando
docker ps

# Se não aparecer youlearnspace_postgres, inicie:
docker compose up -d

# Verifique logs do container
docker compose logs -f postgres

# Teste a conexão
docker exec -it youlearnspace_postgres pg_isready -U youlearnspace
```

### ❌ Erro: "Prisma Client is not generated"

**Causa:** Prisma Client não foi gerado após instalação ou mudança no schema.

**Solução:**
```bash
npx prisma generate
```

### ❌ Porta 5432 já está em uso

**Causa:** Outro PostgreSQL rodando na mesma porta.

**Solução:**
```bash
# Opção 1: Pare o outro PostgreSQL
sudo service postgresql stop  # Linux
brew services stop postgresql # macOS

# Opção 2: Mude a porta no docker-compose.yml
# Edite docker-compose.yml: "5433:5432"
# E atualize DATABASE_URL no .env para usar porta 5433
```

### ❌ Erro: "JWT_SECRET is not defined"

**Causa:** Variável de ambiente não configurada.

**Solução:**
```bash
# Verifique se .env existe
ls -la .env

# Se não existir, crie a partir do exemplo
cp .env.example .env

# Gere uma chave JWT segura
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Cole a chave no .env
```

### ❌ Build falha na Vercel

**Causa comum:** Variáveis de ambiente faltando ou DATABASE_URL incorreta.

**Solução:**
1. Verifique se todas as variáveis estão configuradas no Vercel
2. Teste o build localmente: `npm run build`
3. Verifique os logs de build no dashboard da Vercel

### ❌ Migrations falham em produção

**Causa:** Banco de dados em produção não tem as tabelas.

**Solução:**
```bash
# Execute migrations em produção
vercel env pull .env.production
npx prisma migrate deploy
```

### ⚠️ IndexedDB não funciona

**Causa:** Navegador em modo privado ou bloqueando storage.

**Solução:**
- Use navegador em modo normal (não privado/anônimo)
- Limpe o cache do navegador
- Verifique console do navegador para erros
- IndexedDB só funciona em HTTPS ou localhost

### ⚠️ Dark Mode Flash (FOUC)

O projeto já inclui script anti-FOUC no `app/layout.tsx` que previne o flash. Se ainda ocorrer:
- Limpe o cache do navegador
- Verifique se o script está antes do `<body>` no layout

### ⚠️ Imagens não carregam

**Causa:** Configuração do Next.js ou imagens faltando.

**Solução:**
- Verifique se as imagens estão em `public/images/`
- Confirme que `next.config.js` tem `remotePatterns` para YouTube
- Reinicie o servidor: `npm run dev`

## 🚀 Próximos Passos

Depois de rodar o projeto localmente, experimente:

### 1. **Adicionar Novos Cursos**
   - Crie arquivos `.mdx` em `data/cursos/`
   - Siga o template do frontmatter (11 campos obrigatórios)
   - Use vídeos reais do YouTube
   - Exemplo: veja `data/cursos/curso-javascript-iniciantes-fundamentos.mdx`

### 2. **Testar Funcionalidades**
   - ✅ Criar uma conta (página de cadastro)
   - ✅ Fazer login
   - ✅ Curtir cursos (IndexedDB para usuários anônimos, PostgreSQL para autenticados)
   - ✅ Marcar cursos como concluídos
   - ✅ Ver histórico de acesso
   - ✅ Sugerir novos cursos (requer autenticação + reCAPTCHA)
   - ✅ Alternar dark mode (persiste no localStorage para anônimos, banco de dados para autenticados)

### 3. **Explorar o Código**
   - 📖 Leia `CLAUDE.md` para entender a arquitetura
   - 📖 Leia `DATABASE.md` para entender o schema do banco
   - 🔍 Explore o código em `app/`, `components/`, `lib/`
   - 🧪 Rode o Prisma Studio: `npx prisma studio`

### 4. **Fazer Deploy**
   - 🚀 Siga as [instruções de deploy na Vercel](#-deploy-na-vercel-plataforma-oficial)
   - Configure um banco PostgreSQL gerenciado (Neon, Supabase, Railway)
   - Adicione as variáveis de ambiente no Vercel
   - Execute as migrations em produção

### 5. **Customizar**
   - 🎨 Edite cores no `app/globals.css` (CSS variables)
   - 🖼️ Adicione suas próprias imagens em `public/images/`
   - ⚙️ Configure reCAPTCHA para o formulário de sugestões
   - 🌐 Adicione um domínio customizado na Vercel

## 🤝 Contribuindo

Contribuições são bem-vindas! Você pode:

1. **Adicionar mais cursos** em `data/cursos/`
2. **Melhorar a documentação** (README, DATABASE.md)
3. **Reportar bugs** via issues no repositório
4. **Submeter pull requests** com melhorias
5. **Sugerir novas funcionalidades**

### Como Contribuir

```bash
# 1. Fork o projeto
# 2. Crie uma branch para sua feature
git checkout -b feature/nova-funcionalidade

# 3. Faça suas alterações e commit
git add .
git commit -m "feat: adiciona nova funcionalidade X"

# 4. Push para seu fork
git push origin feature/nova-funcionalidade

# 5. Abra um Pull Request
```

## 📄 Licença

Este projeto é open source e está disponível sob a licença MIT.

---

**YouLearnSpace** - Seja o Protagonista do Seu Futuro 🚀
