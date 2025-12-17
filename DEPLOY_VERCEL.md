# Deploy YouLearnSpace na Vercel - Guia Completo

Este guia cobre **tudo** que você precisa para fazer deploy do YouLearnSpace na Vercel, do zero até a aplicação rodando em produção.

> **Pré-requisitos:** Node.js 18+, Git, conta no GitHub/GitLab/Bitbucket, e conta na Vercel

---

## 📋 Índice

1. [Preparação do Projeto](#1-preparação-do-projeto)
2. [Configuração do Banco de Dados](#2-configuração-do-banco-de-dados)
3. [Deploy na Vercel](#3-deploy-na-vercel)
4. [Configuração de Variáveis de Ambiente](#4-configuração-de-variáveis-de-ambiente)
5. [Executar Migrations do Prisma](#5-executar-migrations-do-prisma)
6. [Verificação e Testes](#6-verificação-e-testes)
7. [Configuração de Domínio Customizado](#7-configuração-de-domínio-customizado-opcional)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Preparação do Projeto

### 1.1 Configurar Prisma para Deploy (CRÍTICO)

O Prisma precisa gerar o client antes do build. Adicione script `postinstall` no `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "format": "prettier --write \"**/*.{js,jsx,ts,tsx,json,md,mdx,css}\"",
    "postinstall": "prisma generate"  // ← ADICIONE ESTA LINHA
  }
}
```

**Por quê?** Na Vercel, o build roda `npm install` → `npm run build`. Sem o `postinstall`, o Prisma Client não é gerado e o build falha com erro:
```
Error: Cannot find module '@prisma/client'
```

### 1.2 Verificar Build Local

Antes de fazer deploy, certifique-se que o projeto builda sem erros:

```bash
# Instalar dependências (vai rodar postinstall automaticamente)
npm install

# Gerar Prisma Client (já rodou no postinstall, mas confirme)
npx prisma generate

# Testar build de produção
npm run build

# Se tudo ok, você verá:
# ✓ Compiled successfully
```

Se houver erros, corrija-os antes de prosseguir.

### 1.3 Commit e Push

```bash
# Commit todas as alterações
git add .
git commit -m "Preparação para deploy na Vercel"

# Push para repositório remoto (GitHub/GitLab/Bitbucket)
git push origin main
```

---

## 2. Configuração do Banco de Dados

YouLearnSpace usa PostgreSQL com Prisma. Você precisa de um banco de dados em produção.

### Opção A: Vercel Postgres (Recomendado - Mais Fácil)

1. **Criar banco no Vercel Dashboard:**
   - Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
   - Vá em **Storage** → **Create Database**
   - Escolha **Postgres**
   - Nome: `youlearnspace-db`
   - Region: Escolha a mais próxima (ex: US East)
   - Clique em **Create**

2. **Anotar credenciais:**
   - Após criar, clique na aba **`.env.local`**
   - Copie o valor de `POSTGRES_PRISMA_URL`
   - Você vai usar isso nas variáveis de ambiente

### Opção B: Neon (Gratuito e Excelente)

1. **Criar conta:**
   - Acesse [neon.tech](https://neon.tech)
   - Faça login com GitHub

2. **Criar projeto:**
   - Clique em **New Project**
   - Nome: `youlearnspace`
   - Region: Escolha a mais próxima
   - Postgres Version: 16 (latest)
   - Clique em **Create Project**

3. **Copiar connection string:**
   - Na dashboard, copie a **Connection String** (pooled)
   - Formato: `postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/youlearnspace?sslmode=require`

### Opção C: Railway ou Supabase

Ambos oferecem PostgreSQL gratuito. Siga a documentação deles para obter a `DATABASE_URL`.

---

## 3. Deploy na Vercel

### Método 1: Via Dashboard (Recomendado)

1. **Login na Vercel:**
   - Acesse [vercel.com](https://vercel.com)
   - Faça login com GitHub/GitLab/Bitbucket

2. **Novo Projeto:**
   - Clique em **Add New...** → **Project**
   - Selecione o repositório `youlearnspace_next`
   - Clique em **Import**

3. **Configurações do Projeto:**
   - **Framework Preset:** Next.js (detectado automaticamente)
   - **Root Directory:** `./` (deixe padrão)
   - **Build Command:** `npm run build` (padrão)
   - **Output Directory:** `.next` (padrão)
   - **Install Command:** `npm install` (padrão)

4. **NÃO CLIQUE EM DEPLOY AINDA!**
   - Primeiro precisamos configurar as variáveis de ambiente
   - Vá para a próxima seção

### Método 2: Via CLI (Opcional)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (não use --prod ainda!)
vercel

# Aguarde deploy de preview
# Depois configure variáveis de ambiente no dashboard
# Então faça: vercel --prod
```

---

## 4. Configuração de Variáveis de Ambiente

Agora vamos configurar todas as variáveis necessárias para o YouLearnSpace funcionar.

### 4.1 Gerar JWT Secret

Você precisa de uma chave secreta forte para autenticação:

```bash
# No terminal, execute:
openssl rand -hex 32

# Ou use: https://generate-secret.vercel.app/32
# Copie o resultado, você vai usar a seguir
```

### 4.2 Configurar reCAPTCHA (Opcional mas Recomendado)

1. **Criar credenciais:**
   - Acesse [google.com/recaptcha/admin](https://www.google.com/recaptcha/admin)
   - Clique em **+** (Novo Site)
   - **Label:** YouLearnSpace
   - **Tipo:** reCAPTCHA v2 → "Não sou um robô"
   - **Domínios:**
     - `localhost` (para testes)
     - `youlearnspace.vercel.app` (ou seu domínio)
   - Clique em **Enviar**

2. **Copiar chaves:**
   - **Chave do site** = `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
   - **Chave secreta** = `RECAPTCHA_SECRET_KEY`

### 4.3 Adicionar Variáveis na Vercel

Na tela de configuração do projeto (antes de fazer deploy):

1. **Expandir "Environment Variables"**

2. **Adicionar cada variável:**

| Variável | Valor | Ambientes |
|----------|-------|-----------|
| `NEXT_PUBLIC_SITE_URL` | `https://youlearnspace.vercel.app` (ajuste depois se tiver domínio próprio) | Production, Preview, Development |
| `NEXT_PUBLIC_SITE_NAME` | `YouLearnSpace` | Production, Preview, Development |
| `DATABASE_URL` | Sua connection string do Postgres (do passo 2) | Production, Preview |
| `JWT_SECRET` | O hash gerado no passo 4.1 | Production, Preview |
| `JWT_EXPIRES_IN` | `30d` | Production, Preview, Development |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | Chave pública do reCAPTCHA (passo 4.2) | Production, Preview, Development |
| `RECAPTCHA_SECRET_KEY` | Chave secreta do reCAPTCHA (passo 4.2) | Production, Preview |

**Importante:**
- Variáveis com `NEXT_PUBLIC_` devem estar em todos os ambientes
- Variáveis secretas (DATABASE_URL, JWT_SECRET, RECAPTCHA_SECRET_KEY) devem estar apenas em Production e Preview
- **NÃO** exponha secrets em Development environment

3. **Exemplo de DATABASE_URL:**
   ```
   # Vercel Postgres
   postgres://default:***@***-pooler.us-east-1.postgres.vercel-storage.com/verceldb?sslmode=require

   # Neon
   postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/youlearnspace?sslmode=require
   ```

4. **Agora sim, clique em "Deploy"!**
   - O primeiro deploy vai levar 2-4 minutos
   - Aguarde até ver "Building..." → "Deployment Ready"

---

## 5. Executar Migrations do Prisma

Após o primeiro deploy, você precisa criar as tabelas no banco de dados.

### 5.1 Via Vercel CLI (Mais Fácil)

```bash
# Instalar Vercel CLI (se ainda não tem)
npm i -g vercel

# Login
vercel login

# Link ao projeto
vercel link

# Pull das variáveis de ambiente
vercel env pull .env.local

# Gerar Prisma Client
npx prisma generate

# Executar migrations
npx prisma migrate deploy

# Sucesso! Você verá:
# ✓ Applied migration: 20240101000000_init
```

### 5.2 Via Vercel Dashboard (Alternativa)

Se você tiver problemas com CLI, pode usar o Prisma Studio diretamente:

1. **Conectar ao banco localmente:**
   ```bash
   # Copiar DATABASE_URL da Vercel para seu .env.local
   # Então rodar:
   npx prisma migrate deploy
   ```

2. **Verificar tabelas criadas:**
   ```bash
   npx prisma studio
   # Abre interface visual do banco
   # Você deve ver: Usuario, UsuarioCurso, Sugestao
   ```

### 5.3 Verificar Schema

As tabelas criadas devem ser:

- **Usuario:** id, nome, email, senha (hash bcrypt), theme, createdAt, updatedAt
- **UsuarioCurso:** id, usuarioId, cursoId, liked, completed, inProgress, videoProgress (JSON), timestamps
- **Sugestao:** id, usuarioId, nome, email, tituloSugestao, urlCurso, categoria, descricao, timestamps

---

## 6. Verificação e Testes

### 6.1 Acessar Site

1. **Abrir URL:**
   - Clique no botão "Visit" no dashboard da Vercel
   - Ou acesse: `https://youlearnspace.vercel.app` (ou o nome do seu projeto)

2. **Verificar funcionamento:**
   - ✅ Homepage carrega com cursos
   - ✅ Dark mode funciona
   - ✅ Sidebar abre/fecha
   - ✅ Busca funciona
   - ✅ Página de curso individual abre
   - ✅ Player do YouTube embarcado funciona

### 6.2 Testar Autenticação

1. **Criar conta:**
   - Clique em "Login" no header
   - Vá em "Criar conta"
   - Preencha nome, email, senha
   - Clique em "Criar Conta"
   - ✅ Você deve ser redirecionado e ver seu nome no header

2. **Testar funcionalidades autenticadas:**
   - ✅ Curtir um curso (ícone de coração)
   - ✅ Ver curso em "Cursos Curtidos"
   - ✅ Assistir vídeo e ter progresso salvo
   - ✅ Ver histórico em "Histórico"
   - ✅ Badge de contagem na sidebar

3. **Logout e Login:**
   - ✅ Fazer logout
   - ✅ Fazer login novamente
   - ✅ Dados persistem (cursos curtidos, progresso)

### 6.3 Testar Formulário de Sugestão

1. **Acessar /sugestao**
2. **Preencher formulário:**
   - Nome, email, título do curso, URL do YouTube, categoria, descrição
   - ✅ reCAPTCHA aparece (se configurado)
   - ✅ Envio funciona
   - ✅ Mensagem de sucesso

### 6.4 Verificar Logs

Se algo não funcionar:

1. **Ver Function Logs:**
   - Dashboard Vercel → seu projeto
   - Aba **"Logs"**
   - Filtrar por erros (vermelho)

2. **Erros comuns:**
   - `PrismaClientInitializationError` → DATABASE_URL errado ou banco sem migrations
   - `JsonWebTokenError` → JWT_SECRET não configurado
   - `fetch failed` → NEXT_PUBLIC_SITE_URL errado

---

## 7. Configuração de Domínio Customizado (Opcional)

Se você tem um domínio próprio (ex: `youlearnspace.com.br`):

### 7.1 Adicionar Domínio na Vercel

1. **No Dashboard:**
   - Vá em **Settings** → **Domains**
   - Clique em **Add**
   - Digite seu domínio: `youlearnspace.com.br`
   - Clique em **Add**

2. **Configurar DNS:**

**Opção A: Nameservers Vercel (Recomendado)**
   - No seu registrador de domínio (Registro.br, GoDaddy, etc.)
   - Aponte os nameservers para:
     ```
     ns1.vercel-dns.com
     ns2.vercel-dns.com
     ```
   - Aguarde propagação (até 48h, geralmente 1-2h)

**Opção B: Registros CNAME/A**
   - Adicione no seu DNS:
     ```
     Type: CNAME
     Name: www
     Value: cname.vercel-dns.com

     Type: A
     Name: @
     Value: 76.76.21.21
     ```

3. **SSL Automático:**
   - Vercel provisiona certificado SSL automaticamente
   - Aguarde alguns minutos

4. **Atualizar variável de ambiente:**
   - Vá em **Settings** → **Environment Variables**
   - Edite `NEXT_PUBLIC_SITE_URL` para `https://youlearnspace.com.br`
   - Clique em **Save**
   - Faça um novo deploy (Deployments → 3 dots → Redeploy)

---

### Problemas Comuns e Soluções

#### ❌ Erro: "Cannot find module '@prisma/client'" no Build

**Causa:** Prisma Client não foi gerado antes do build.

**Erro completo:**
```
Error: Cannot find module '@prisma/client'
  > 1 | import { PrismaClient } from '@prisma/client'
      |          ^
```

**Solução:**
1. Adicione script `postinstall` no `package.json`:
   ```json
   "scripts": {
     "postinstall": "prisma generate"
   }
   ```

2. Commit e push:
   ```bash
   git add package.json
   git commit -m "Add postinstall script for Prisma"
   git push
   ```

3. Vercel vai fazer redeploy automaticamente e deve funcionar!

**Alternativa (se não quiser usar postinstall):**
- Configure Build Command na Vercel: `prisma generate && next build`
- Settings → General → Build & Development Settings → Build Command

#### ❌ Erro: "PrismaClientInitializationError"

**Causa:** Banco de dados não acessível ou migrations não rodadas.

**Solução:**
```bash
# Verificar DATABASE_URL
echo $DATABASE_URL  # no terminal local

# Rodar migrations
npx prisma migrate deploy

# Se persistir, verificar logs da Vercel
```

#### ❌ Erro: "JsonWebTokenError: invalid signature"

**Causa:** JWT_SECRET não configurado ou diferente entre dev e prod.

**Solução:**
1. Gerar novo secret: `openssl rand -hex 32`
2. Adicionar em Vercel: Settings → Environment Variables → JWT_SECRET
3. Redeploy

#### ❌ Erro: "Failed to fetch" em chamadas de API

**Causa:** CORS ou NEXT_PUBLIC_SITE_URL incorreto.

**Solução:**
```bash
# Verificar variável
# NEXT_PUBLIC_SITE_URL deve ser: https://youlearnspace.vercel.app (sem / no final)
```

#### ❌ Build falha com erro de TypeScript

**Causa:** Tipos incorretos ou missing.

**Solução:**
```bash
# Testar localmente
npm run build

# Ver erro específico
# Corrigir no código
# Commit e push novamente
```

#### ❌ Imagens do YouTube não carregam

**Causa:** Domínio não configurado em `next.config.js`.

**Verificar:** O arquivo já tem configuração correta:
```js
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'img.youtube.com' },
    { protocol: 'https', hostname: 'i.ytimg.com' }
  ]
}
```

#### ❌ Dark mode não persiste / FOUC (Flash of Unstyled Content)

**Causa:** Script anti-FOUC não está rodando.

**Verificar:** `app/layout.tsx` tem script inline no `<head>` que aplica classe `dark-mode` antes do React hidratar.

#### ❌ Autenticação não funciona (sempre deslogado)

**Possíveis causas:**
1. Cookie não sendo setado (SameSite/Secure)
2. JWT_SECRET diferente entre builds
3. Domínio errado

**Solução:**
```typescript
// Verificar em app/api/auth/login/route.ts
response.cookies.set('auth-token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // true em prod
  sameSite: 'strict',
  maxAge: 60 * 60 * 24 * 7
})
```

#### ❌ reCAPTCHA não aparece

**Solução:**
1. Verificar `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` está setado
2. Verificar domínio está adicionado no Google reCAPTCHA Admin
3. Verificar aba Network no navegador (deve carregar script do Google)

#### ❌ Sugestões não salvam no banco

**Causa:** Usuário não autenticado ou erro no Prisma.

**Solução:**
1. Fazer login antes de acessar `/sugestao`
2. Verificar logs: Vercel Dashboard → Logs
3. Verificar tabela existe: `npx prisma studio`

---

## 9. Deploy Automático (CI/CD)

A Vercel configura CI/CD automaticamente:

### Preview Deployments

- **Cada push em qualquer branch** cria um preview deployment
- URL única: `https://youlearnspace-git-[branch].vercel.app`
- Perfeito para testar features antes de mergear PRs
- Variáveis de ambiente do ambiente "Preview" são usadas

### Production Deployments

- **Cada push na branch `main`** (ou `master`) faz deploy em produção
- URL: `https://youlearnspace.vercel.app` (ou seu domínio customizado)
- Automático, zero configuração

### Rollback Rápido

Se um deploy quebrou algo:

1. Vá em **Deployments** no dashboard
2. Encontre o deployment anterior que funcionava
3. Clique nos **3 pontinhos** → **Promote to Production**
4. Pronto! Rollback instantâneo

---

## 10. Recursos Adicionais (Opcional)

### 10.1 Vercel Analytics

Adicione analytics nativos sem afetar performance:

```bash
npm install @vercel/analytics
```

Edite `app/layout.tsx`:
```tsx
import { Analytics } from '@vercel/analytics/react'

// Adicione <Analytics /> antes de fechar </body>
<body>
  {children}
  <Analytics />
</body>
```

### 10.2 Vercel Speed Insights

Monitore Core Web Vitals (LCP, FID, CLS):

```bash
npm install @vercel/speed-insights
```

Edite `app/layout.tsx`:
```tsx
import { SpeedInsights } from '@vercel/speed-insights/next'

<body>
  {children}
  <SpeedInsights />
</body>
```

### 10.3 Monitoramento no Dashboard

Acesse métricas em tempo real:

- **Analytics:** Pageviews, visitantes únicos, top páginas
- **Speed Insights:** Core Web Vitals, performance score
- **Logs:** Logs de função em tempo real (erros, warnings)
- **Usage:** Bandwidth, execuções de função, build minutes

---

## 11. Checklist Final de Deploy

Use este checklist para garantir que tudo está configurado:

### Pré-Deploy
- [ ] Script `postinstall: "prisma generate"` adicionado no `package.json`
- [ ] `npm run build` roda sem erros localmente
- [ ] `.env.local.example` atualizado com todas as variáveis
- [ ] Todos os cursos MDX estão na pasta `data/cursos/`
- [ ] Git commit de todas as mudanças
- [ ] Push para repositório remoto (GitHub/GitLab/Bitbucket)

### Configuração Vercel
- [ ] Projeto criado e linked ao repositório
- [ ] Todas as 7 variáveis de ambiente configuradas (ver seção 4.3)
- [ ] `DATABASE_URL` apontando para banco de produção
- [ ] `JWT_SECRET` gerado com `openssl rand -hex 32`
- [ ] `NEXT_PUBLIC_SITE_URL` com URL correta (https://...)

### Pós-Deploy
- [ ] Migrations do Prisma executadas (`npx prisma migrate deploy`)
- [ ] Tabelas criadas no banco (Usuario, UsuarioCurso, Sugestao)
- [ ] Homepage carrega corretamente
- [ ] Páginas de curso individuais funcionam
- [ ] Dark mode funciona e persiste
- [ ] Criação de conta funciona
- [ ] Login/logout funciona
- [ ] Curtir curso funciona
- [ ] Progresso de vídeo é salvo
- [ ] Formulário de sugestão funciona

### Opcional
- [ ] Domínio customizado configurado
- [ ] SSL ativo (cadeado verde no navegador)
- [ ] Vercel Analytics instalado
- [ ] Speed Insights instalado
- [ ] reCAPTCHA configurado e testado

---

## 12. Próximos Passos

Após deploy bem-sucedido:

1. **Compartilhe:** Envie o link para amigos/colegas testarem
2. **Monitore:** Acompanhe logs e analytics nos primeiros dias
3. **Otimize:** Use Speed Insights para identificar melhorias de performance
4. **Itere:** Adicione novos cursos regularmente (apenas criar `.mdx` e fazer push!)

### Adicionando Novos Cursos

É simples:

1. Crie arquivo `.mdx` em `data/cursos/`:
   ```bash
   # Exemplo: data/cursos/python-basico.mdx
   ```

2. Preencha frontmatter com 11 campos obrigatórios (ver `.env.local.example` ou outros cursos como referência)

3. Commit e push:
   ```bash
   git add data/cursos/python-basico.mdx
   git commit -m "Adiciona curso Python Básico"
   git push
   ```

4. Vercel faz deploy automático em 2-3 minutos

5. Novo curso aparece na homepage automaticamente!

---

## 📚 Recursos Úteis

- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Next.js Docs:** [nextjs.org/docs](https://nextjs.org/docs)
- **Prisma Docs:** [prisma.io/docs](https://www.prisma.io/docs)
- **Neon Docs:** [neon.tech/docs](https://neon.tech/docs)
- **Vercel Community:** [github.com/vercel/next.js/discussions](https://github.com/vercel/next.js/discussions)

---

## 🎉 Conclusão

Seguindo este guia passo a passo, você terá o YouLearnSpace rodando em produção na Vercel com:

✅ Next.js 16 otimizado com build estático
✅ PostgreSQL com Prisma ORM
✅ Autenticação JWT com cookies HTTP-only
✅ Sistema de progresso de cursos
✅ Dark mode persistente
✅ reCAPTCHA para formulários
✅ Deploy automático via Git
✅ SSL/HTTPS automático
✅ CDN global da Vercel

**Tempo estimado:** 30-45 minutos (primeira vez)

Se tiver problemas, consulte a seção de Troubleshooting ou abra uma issue no repositório.

**Bom deploy! 🚀**
