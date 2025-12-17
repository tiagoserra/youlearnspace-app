# Deploy na Vercel - Guia Completo

Este guia explica como fazer deploy do YouLearnSpace na Vercel e aproveitar todos os recursos da plataforma.

## 🚀 Deploy Básico

### Método 1: Via Dashboard (Mais Fácil)

1. **Faça login na Vercel**
   - Acesse [vercel.com](https://vercel.com)
   - Faça login com GitHub, GitLab ou Bitbucket

2. **Novo Projeto**
   - Clique em "New Project"
   - Selecione o repositório do YouLearnSpace
   - A Vercel detecta automaticamente Next.js 16

3. **Configurações (Opcional)**
   - Framework Preset: Next.js (detectado automaticamente)
   - Root Directory: `./` (padrão)
   - Build Command: `npm run build` (padrão)
   - Output Directory: `.next` (padrão)

4. **Variáveis de Ambiente**
   - Adicione as variáveis do `.env.local`:
     - `NEXT_PUBLIC_SITE_URL` = sua URL final (ex: https://youlearnspace.vercel.app)
     - `NEXT_PUBLIC_SITE_NAME` = YouLearnSpace

5. **Deploy**
   - Clique em "Deploy"
   - Aguarde 2-3 minutos
   - Pronto! Seu site está no ar

### Método 2: Via CLI

```bash
# Instalar Vercel CLI globalmente
npm i -g vercel

# Fazer login
vercel login

# Deploy (primeira vez)
vercel

# Seguir prompts:
# - Set up and deploy? Yes
# - Which scope? [selecione sua conta]
# - Link to existing project? No
# - Project name? youlearnspace
# - Directory? ./
# - Override settings? No

# Deploy para produção
vercel --prod
```

## 🌐 Custom Domain

### Adicionar Domínio Personalizado

1. **No Dashboard da Vercel**
   - Vá para Settings > Domains
   - Clique em "Add"
   - Digite seu domínio (ex: youlearnspace.com.br)

2. **Configurar DNS**
   - **Opção A (Nameservers Vercel):** Mais fácil
     - Aponte os nameservers do seu registrador para:
       - `ns1.vercel-dns.com`
       - `ns2.vercel-dns.com`

   - **Opção B (CNAME):**
     - Adicione registro CNAME:
       - Name: `www`
       - Value: `cname.vercel-dns.com`
     - Adicione registro A para apex:
       - Name: `@`
       - Value: `76.76.21.21`

3. **SSL Automático**
   - A Vercel provisiona SSL automaticamente
   - Pode levar até 24h para propagar

## 📊 Recursos Opcionais da Vercel

### 1. Vercel Analytics

Adicione analytics sem afetar performance:

```bash
npm install @vercel/analytics
```

Em `app/layout.tsx`:
```tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### 2. Vercel Speed Insights

Monitore Web Vitals:

```bash
npm install @vercel/speed-insights
```

Em `app/layout.tsx`:
```tsx
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  )
}
```

### 3. Edge Functions (Opcional)

Para funcionalidades que precisam de baixa latência global, use Edge Runtime.

### 4. Vercel Postgres (Para Formulários)

Salvar sugestões de cursos em banco:

```bash
# Criar banco via dashboard Vercel
# Storage > Create Database > Postgres

# Instalar SDK
npm install @vercel/postgres
```

Atualizar `app/api/sugestao/route.ts`:
```typescript
import { sql } from '@vercel/postgres'

export async function POST(request) {
  const data = await request.json()

  await sql`
    INSERT INTO sugestoes (nome, email, titulo, url, categoria, descricao)
    VALUES (${data.nome}, ${data.email}, ${data.tituloSugestao},
            ${data.urlCurso}, ${data.categoria}, ${data.descricao})
  `

  return Response.json({ success: true })
}
```

### 5. Vercel KV (Redis)

Cache rápido para dados:

```bash
npm install @vercel/kv
```

## 🔄 Deploy Automático

### Preview Deployments

- Cada push para branch cria um preview deployment
- URL única para testar: `youlearnspace-git-branch.vercel.app`
- Perfeito para testar PRs antes de mergear

### Production Deployments

- Push para branch principal (main/master) = deploy em produção
- Automático, sem configuração extra

### Rollback

Se algo der errado:
1. Vá em Deployments
2. Encontre deployment anterior estável
3. Clique nos 3 pontinhos > "Promote to Production"

## 📧 Integrações de Email (Para Formulários)

### Opção 1: Resend (Recomendado)

```bash
npm install resend
```

```typescript
// app/api/sugestao/route.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

await resend.emails.send({
  from: 'sugestoes@yourdomain.com',
  to: 'admin@yourdomain.com',
  subject: `Nova Sugestão: ${data.tituloSugestao}`,
  html: `...`
})
```

### Opção 2: SendGrid

```bash
npm install @sendgrid/mail
```

### Opção 3: Formspree (Sem backend)

No formulário:
```tsx
<form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
```

## 🔐 Variáveis de Ambiente

### Adicionar via Dashboard

1. Settings > Environment Variables
2. Adicionar:
   - `NEXT_PUBLIC_SITE_URL`
   - `NEXT_PUBLIC_SITE_NAME`
   - `RESEND_API_KEY` (se usar Resend)
   - `DATABASE_URL` (se usar Postgres)

### Ambientes Diferentes

- **Production:** Produção
- **Preview:** PRs e branches
- **Development:** Local

Você pode ter valores diferentes para cada.

## 📈 Monitoramento

### No Dashboard Vercel

- **Analytics:** Pageviews, visitantes únicos
- **Speed Insights:** Core Web Vitals (LCP, FID, CLS)
- **Logs:** Real-time logs de função
- **Usage:** Bandwidth, build minutes

## 🐛 Troubleshooting

### Build Falha

```bash
# Testar build localmente primeiro
npm run build

# Ver logs detalhados na Vercel
# Dashboard > Deployments > [seu deploy] > View Function Logs
```

### Variáveis de Ambiente Não Funcionam

- Variáveis devem começar com `NEXT_PUBLIC_` para serem expostas ao client
- Rebuild necessário após adicionar variáveis

### 404 em Rotas Dinâmicas

- Vercel detecta automaticamente rotas dinâmicas do Next.js
- Certifique-se que `generateStaticParams()` está implementado

### Imagens Não Carregam

- Adicione domínios em `next.config.js`:
```js
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'img.youtube.com' }
  ]
}
```

## 💡 Dicas de Performance

1. **Use ISR (Incremental Static Regeneration)**
   ```tsx
   export const revalidate = 3600 // revalidar a cada 1h
   ```

2. **Otimize Imagens**
   - Use next/image sempre
   - Defina `sizes` apropriado

3. **Code Splitting Automático**
   - Next.js já faz isso automaticamente

4. **Prefetch Automático**
   - Links com next/link fazem prefetch automático

## 🎯 Checklist Pré-Deploy

- [ ] `npm run build` roda sem erros localmente
- [ ] `.env.local.example` atualizado com todas as variáveis
- [ ] Imagens adicionadas em `/public/images/`
- [ ] Cursos MDX adicionados
- [ ] README atualizado
- [ ] Git commit de todas as mudanças
- [ ] Push para repositório remoto

## 📚 Recursos

- [Docs Vercel](https://vercel.com/docs)
- [Next.js no Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Edge Functions](https://vercel.com/docs/functions/edge-functions)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)

---

**Pronto!** Seu YouLearnSpace estará no ar em minutos com a Vercel! 🚀
