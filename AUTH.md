# Sistema de Autenticação

Documentação completa do sistema de autenticação implementado com JWT, cookies HTTPOnly e Google reCAPTCHA.

## Índice

- [Funcionalidades](#-funcionalidades-implementadas)
- [Segurança](#-segurança-implementada)
- [Pré-requisitos](#-pré-requisitos)
- [Como Testar](#-como-testar)
- [Estrutura de Arquivos](#-estrutura-de-arquivos-criados)
- [Schema do Banco](#-schema-do-banco-de-dados)
- [Fluxo de Autenticação](#-fluxo-de-autenticação)
- [Comandos Úteis](#-comandos-úteis)
- [Troubleshooting](#-troubleshooting)
- [Próximos Passos](#-próximos-passos-opcional)

---

## 🎯 Funcionalidades Implementadas

✅ **Cadastro de Usuário** (`/cadastro`)
- Nome, Email, Senha, Confirmação de Senha
- Validação de senha (mínimo 8 caracteres)
- Verificação de email único
- Google reCAPTCHA v2
- Hash de senha com bcrypt (salt 10)

✅ **Login** (`/login`)
- Email e Senha
- Google reCAPTCHA v2
- Autenticação via JWT em cookie HTTPOnly
- Redirect automático após login

✅ **Logout**
- Botão no menu do usuário
- Limpa cookie de autenticação

✅ **Menu do Usuário**
- Exibe "Olá, [Nome]" quando autenticado
- Links de Login/Cadastrar quando não autenticado
- Botão de Logout quando autenticado
- Toggle Dark Mode

✅ **Middleware de Proteção**
- Valida autenticação em rotas protegidas
- Redireciona usuários autenticados de /login e /cadastro
- Adiciona headers com dados do usuário

✅ **API de Autenticação**
- `POST /api/auth/register` - Cadastro de novo usuário
- `POST /api/auth/login` - Login com email/senha
- `POST /api/auth/logout` - Logout (limpa cookie)
- `GET /api/auth/me` - Obter dados do usuário atual
- `POST /api/auth/theme` - Salvar preferência de tema

---

## 🔒 Segurança Implementada

### Cookies Seguros

O sistema usa cookies HTTPOnly com as seguintes configurações:

```typescript
{
  httpOnly: true,                              // Não acessível via JavaScript (proteção XSS)
  secure: process.env.NODE_ENV === 'production', // HTTPS em produção, HTTP em dev
  sameSite: 'strict',                          // Proteção contra CSRF
  maxAge: 60 * 60 * 24 * 7,                    // 7 dias (pode ser configurado via JWT_EXPIRES_IN)
  path: '/'                                    // Disponível em todas as rotas
}
```

**Nome do Cookie:** `auth-token` (contém JWT)

### Proteções Implementadas

| Proteção                  | Implementação                                    |
|---------------------------|--------------------------------------------------|
| Hash de senhas            | bcrypt com salt rounds 10                        |
| Tokens seguros            | JWT com secret de 256 bits (64 bytes)            |
| Anti-bot                  | Google reCAPTCHA v2 validado no servidor         |
| Email único               | Constraint UNIQUE no banco + validação server    |
| Sanitização               | trim(), toLowerCase() em emails                  |
| SQL Injection             | Prisma ORM com prepared statements               |
| Validação de senha        | Mínimo 8 caracteres                              |
| XSS (Cross-Site Script)   | HTTPOnly cookies (não acessível via JS)          |
| CSRF (Cross-Site Request) | SameSite Strict + validações de origem           |
| Brute force               | reCAPTCHA em login/cadastro (rate limit básico)  |

---

## 📋 Pré-requisitos

### 1. Configurar Google reCAPTCHA

O sistema usa reCAPTCHA v2 para proteção contra bots.

**Passos:**

1. Acesse https://www.google.com/recaptcha/admin
2. Clique em "Create" (ou botão "+")
3. Preencha o formulário:

   | Campo            | Valor                                              |
   |------------------|----------------------------------------------------|
   | **Label**        | `YouLearnSpace` (ou nome do seu projeto)           |
   | **reCAPTCHA Type** | `reCAPTCHA v2` → "I'm not a robot" Checkbox      |
   | **Domains**      | `localhost` (dev) + seu domínio de produção        |

4. Clique em "Submit"
5. **Copie as chaves geradas:**
   - **Site Key** (pública) → vai para `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
   - **Secret Key** (privada) → vai para `RECAPTCHA_SECRET_KEY`

> **Importante:** A Site Key é pública (vai para o frontend). A Secret Key é privada (só no servidor).

### 2. Configurar Variáveis de Ambiente

Edite o arquivo `.env` na raiz do projeto e adicione:

```env
# Variáveis já configuradas (não altere)
DATABASE_URL="postgresql://youlearnspace:youlearnspace_dev_password@localhost:5432/youlearnspace_db?schema=public"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_NAME="YouLearnSpace"

# JWT (já possui um secret gerado, mas pode regenerar se desejar)
JWT_SECRET="sua-chave-secreta-de-64-bytes-aqui"
JWT_EXPIRES_IN="7d"  # ou 30d para 30 dias

# reCAPTCHA - ADICIONE SUAS CHAVES AQUI
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="cole_sua_site_key_aqui"
RECAPTCHA_SECRET_KEY="cole_sua_secret_key_aqui"
```

**Gerar novo JWT_SECRET (opcional):**

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 🚀 Como Testar

### 1. Iniciar PostgreSQL

```bash
docker compose up -d
```

### 2. Executar Migrations

```bash
# Gerar Prisma Client
npx prisma generate

# Criar tabela de usuários
npx prisma migrate dev --name add_usuario_table
```

### 3. Iniciar Servidor

```bash
npm run dev
```

### 4. Testar Fluxo Completo

#### 4.1 Cadastrar Novo Usuário

1. Acesse: http://localhost:3000/cadastro
2. Preencha:
   - Nome: João Silva
   - Email: joao@example.com
   - Senha: senha123456
   - Confirmar Senha: senha123456
3. Resolva o reCAPTCHA
4. Clique em "Cadastrar"
5. ✅ Deve ver mensagem de sucesso
6. ✅ Deve redirecionar para `/login` após 2s

#### 4.2 Fazer Login

1. Acesse: http://localhost:3000/login (ou clique no menu "Login")
2. Preencha:
   - Email: joao@example.com
   - Senha: senha123456
3. Resolva o reCAPTCHA
4. Clique em "Entrar"
5. ✅ Deve redirecionar para homepage
6. ✅ Deve ver "Olá, João" ao lado do ícone de usuário

#### 4.3 Verificar Estado Autenticado

1. Verifique no menu superior: "Olá, João" 👤
2. Clique no ícone do usuário
3. ✅ Deve ver botão "Sair" no dropdown
4. ✅ Não deve ver "Login" ou "Cadastrar"

#### 4.4 Fazer Logout

1. Clique no ícone do usuário
2. Clique em "Sair"
3. ✅ Deve redirecionar para homepage
4. ✅ Menu volta a mostrar "Login" e "Cadastrar"

#### 4.5 Verificar Proteções

**Teste 1: Email Duplicado**
1. Tente cadastrar com email já usado
2. ✅ Deve mostrar erro: "Email já cadastrado"

**Teste 2: Senhas Não Coincidem**
1. Preencha senhas diferentes
2. ✅ Deve mostrar erro: "As senhas não coincidem"

**Teste 3: reCAPTCHA Obrigatório**
1. Tente enviar sem resolver reCAPTCHA
2. ✅ Botão deve estar desabilitado

**Teste 4: Login Incorreto**
1. Tente fazer login com senha errada
2. ✅ Deve mostrar erro: "Email ou senha incorretos"

**Teste 5: Redirect de Usuário Autenticado**
1. Faça login
2. Tente acessar `/login` ou `/cadastro`
3. ✅ Deve redirecionar automaticamente para `/`

## 🗂️ Estrutura de Arquivos Criados

```
├── middleware.ts                          # Proxy de validação (raiz)
├── .env                                   # Variáveis atualizadas
├── prisma/
│   └── schema.prisma                      # Modelo Usuario adicionado
├── lib/
│   ├── auth.ts                            # Helpers JWT e cookies
│   └── recaptcha.ts                       # Validação reCAPTCHA
├── app/
│   ├── cadastro/
│   │   ├── page.tsx                       # Página de cadastro
│   │   └── page.module.css                # Estilos
│   ├── login/
│   │   ├── page.tsx                       # Página de login
│   │   └── page.module.css                # Estilos
│   └── api/
│       └── auth/
│           ├── register/route.ts          # API de cadastro
│           ├── login/route.ts             # API de login
│           ├── logout/route.ts            # API de logout
│           └── me/route.ts                # API de usuário atual
└── components/
    └── layout/
        ├── UserMenu.tsx                   # Atualizado com auth
        └── UserMenu.module.css            # Estilos atualizados
```

## 📊 Schema do Banco de Dados

O sistema de autenticação usa a tabela `Usuario` no Prisma (banco: `usuarios`).

### Tabela: `Usuario`

| Campo     | Tipo     | Constraints    | Descrição                            |
|-----------|----------|----------------|--------------------------------------|
| id        | String   | PRIMARY KEY    | ID único (CUID)                      |
| nome      | String   | NOT NULL       | Nome completo do usuário             |
| email     | String   | UNIQUE, INDEX  | Email (único, usado para login)      |
| senha     | String   | NOT NULL       | Hash bcrypt (salt rounds 10)         |
| theme     | String?  | NULLABLE       | Preferência: "light", "dark", "system" |
| createdAt | DateTime | DEFAULT NOW()  | Data de criação (auto)               |
| updatedAt | DateTime | AUTO UPDATE    | Data de atualização (auto)           |

**Relações:**
- Um usuário pode ter vários `UsuarioCurso` (progresso de cursos)
- Um usuário pode ter várias `Sugestao` (sugestões enviadas)

**Índices:**
- `email` (UNIQUE) - otimiza login e previne duplicatas

> Para o schema completo do banco, consulte `DATABASE.md`

---

## 🔄 Fluxo de Autenticação

### Cadastro de Novo Usuário

**Frontend (`/cadastro`):**
1. Usuário preenche: nome, email, senha, confirmar senha
2. Valida client-side: senhas coincidem? mínimo 8 caracteres?
3. Usuário resolve reCAPTCHA v2 ("I'm not a robot")
4. Submit → `POST /api/auth/register` com `recaptchaToken`

**Backend (`/api/auth/register`):**
5. Valida reCAPTCHA com Google API
6. Valida campos obrigatórios (nome, email, senha)
7. Verifica se email já existe no banco
8. Hash da senha com bcrypt (salt rounds 10)
9. Salva usuário no banco (Prisma)
10. Retorna `{ success: true, message, user }`

**Frontend:**
11. Mostra mensagem de sucesso
12. Redireciona para `/login` após 2 segundos

---

### Login de Usuário

**Frontend (`/login`):**
1. Usuário preenche: email, senha
2. Usuário resolve reCAPTCHA v2
3. Submit → `POST /api/auth/login` com `recaptchaToken`

**Backend (`/api/auth/login`):**
4. Valida reCAPTCHA com Google API
5. Busca usuário por email (case-insensitive)
6. Compara hash da senha com bcrypt
7. Gera JWT token com dados do usuário (id, nome, email)
8. Define cookie `auth-token` (HTTPOnly, SameSite Strict, 7 dias)
9. Retorna `{ success: true, user }`

**Frontend:**
10. Redux atualiza estado global com dados do usuário
11. Redireciona para homepage `/`
12. Menu superior mostra "Olá, [Nome]"

---

### Logout de Usuário

**Frontend:**
1. Usuário clica em "Sair" no menu dropdown
2. Request → `POST /api/auth/logout`

**Backend (`/api/auth/logout`):**
3. Define cookie `auth-token` com `maxAge: 0` (expira imediatamente)
4. Retorna `{ success: true }`

**Frontend:**
5. Redux limpa estado do usuário
6. Redireciona para homepage `/`
7. Menu volta a mostrar "Login" e "Cadastrar"

---

### Verificação de Autenticação (Middleware)

**Para toda requisição:**

1. Middleware (`middleware.ts`) extrai cookie `auth-token`
2. Se cookie existe → valida e decodifica JWT
3. Se JWT válido → adiciona headers `x-user-id`, `x-user-email`, `x-user-nome`
4. Verifica regras de acesso:
   - **Rota protegida + não autenticado** → redirect `/login`
   - **Autenticado + tenta `/login` ou `/cadastro`** → redirect `/`
   - **Rota pública** → continua normalmente
5. Request prossegue para a rota

**Rotas Protegidas (requerem autenticação):**
- `/curtidos` - Cursos curtidos
- `/historico` - Histórico de cursos
- `/sugestao` - Formulário de sugestões

**API Routes Protegidas:**
- `/api/cursos/[slug]/*` - Like, start, complete, progress, status
- `/api/cursos/liked` - Listar curtidos
- `/api/cursos/history` - Histórico
- `/api/sugestao` - Criar sugestão

---

## 🛠️ Comandos Úteis

### Visualizar Banco de Dados

```bash
# Abrir Prisma Studio (interface web em http://localhost:5555)
npx prisma studio

# Ver todas as tabelas criadas
docker exec -it youlearnspace_postgres psql -U youlearnspace -d youlearnspace_db -c "\dt"

# Listar usuários cadastrados (tabela Usuario no Prisma = usuarios no banco)
docker exec -it youlearnspace_postgres psql -U youlearnspace -d youlearnspace_db -c "SELECT id, nome, email, \"createdAt\" FROM \"Usuario\";"

# Contar total de usuários
docker exec -it youlearnspace_postgres psql -U youlearnspace -d youlearnspace_db -c "SELECT COUNT(*) FROM \"Usuario\";"
```

### Gerenciar Migrations

```bash
# Ver status das migrations
npx prisma migrate status

# Criar nova migration
npx prisma migrate dev --name descricao_da_mudanca

# Resetar banco (⚠️ CUIDADO: apaga todos os dados!)
npx prisma migrate reset
```

### Debug e Inspeção

**Verificar cookies no navegador:**

1. **Chrome DevTools:** Application → Cookies → `http://localhost:3000` → `auth-token`
2. **Firefox DevTools:** Storage → Cookies → `http://localhost:3000`
3. **Safari DevTools:** Storage → Cookies

**Inspecionar JWT token:**

```bash
# Copie o valor do cookie auth-token do navegador
# Cole em: https://jwt.io/
# Isso decodifica o token e mostra o payload (não requer secret)
```

**Ver logs do servidor Next.js:**

Os logs aparecem no terminal onde você executou `npm run dev`:
- Requisições HTTP (POST /api/auth/login, etc.)
- Erros de validação
- Queries do Prisma

---

## 🐛 Troubleshooting

### "Por favor, complete o reCAPTCHA"

**Problema:** reCAPTCHA não está carregando ou sendo validado.

**Soluções:**

1. Verifique se `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` está no `.env`
2. Certifique-se de usar a **Site Key** (pública), não a Secret Key
3. Verifique se `localhost` está registrado nos domínios do reCAPTCHA Admin
4. Abra o Console do navegador e veja se há erros de CORS ou carregamento

---

### "Falha na validação do reCAPTCHA"

**Problema:** reCAPTCHA foi resolvido no frontend, mas falhou no backend.

**Soluções:**

1. Verifique se `RECAPTCHA_SECRET_KEY` está no `.env` (sem `NEXT_PUBLIC_`)
2. Certifique-se de usar a **Secret Key** (privada), não a Site Key
3. Veja logs do servidor Next.js para detalhes do erro da Google API
4. Teste se a Secret Key está correta no reCAPTCHA Admin

---

### Menu não mostra nome do usuário após login

**Problema:** Usuário fez login mas o menu continua mostrando "Login/Cadastrar".

**Diagnóstico:**

1. Abra DevTools → Network → Filtre por `/api/auth/me`
2. Verifique se retorna status `200` com `{ user: { id, nome, email } }`
3. Abra DevTools → Application → Cookies → Verifique se `auth-token` existe
4. Verifique se o cookie tem valor (não está vazio)

**Soluções:**

- Se API retorna 401: cookie inválido/expirado → faça login novamente
- Se API retorna 200 mas Redux não atualiza: recarregue a página (F5)
- Se cookie não existe: verifique se login foi bem-sucedido (status 200)
- Limpe cookies do navegador e faça login novamente

---

### Cookie não está sendo enviado para API

**Problema:** Requisições para `/api/auth/me` ou outras APIs retornam 401.

**Soluções:**

1. Verifique se `credentials: 'include'` está em todos os `fetch()`
2. Use `http://localhost:3000` (não `127.0.0.1` ou `0.0.0.0`)
3. Limpe todos os cookies do navegador: DevTools → Application → Clear site data
4. Verifique se o domínio do cookie está correto (deve ser `localhost`)

---

### "Email já cadastrado" mas usuário não existe

**Problema:** Tenta cadastrar email mas diz que já existe.

**Diagnóstico:**

```bash
# Buscar email no banco
docker exec -it youlearnspace_postgres psql -U youlearnspace -d youlearnspace_db -c "SELECT email FROM \"Usuario\" WHERE email ILIKE 'seu@email.com';"
```

**Soluções:**

- O sistema converte email para lowercase antes de salvar
- Verifique se não há espaços em branco no email
- Abra Prisma Studio e busque manualmente: `npx prisma studio`
- Se encontrar registro duplicado, delete pelo Prisma Studio

---

### "Invalid token" ou 401 em requisições autenticadas

**Problema:** Token JWT inválido ou expirado.

**Soluções:**

1. Faça logout e login novamente para gerar novo token
2. Verifique se `JWT_SECRET` no `.env` não foi alterado
3. Limpe cookies e faça login novamente
4. Verifique se o token não expirou (padrão: 7 dias)

**Debug:**

Copie o token do cookie e decodifique em https://jwt.io/ para ver:
- `exp` (timestamp de expiração)
- `iat` (timestamp de criação)
- `userId`, `email`, `nome`

---

### Banco de dados não conecta

**Problema:** Prisma não consegue conectar ao PostgreSQL.

**Soluções:**

Consulte a seção de Troubleshooting completa em `DATABASE.md`.

Quick fix:

```bash
# Verificar se Docker está rodando
docker ps

# Reiniciar container PostgreSQL
docker compose restart postgres

# Ver logs
docker compose logs postgres
```

---

## 📝 Notas Importantes

### Para Produção

#### reCAPTCHA

- Adicione seu domínio de produção no [reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
- Configure `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` e `RECAPTCHA_SECRET_KEY` nas variáveis de ambiente do serviço de hospedagem (Vercel, Railway, etc.)
- As mesmas chaves funcionam para dev e produção se você adicionar ambos os domínios

#### Cookies Seguros

- Em produção, `secure: true` é automaticamente habilitado (requer HTTPS)
- Vercel, Netlify, Railway já fornecem HTTPS automaticamente
- O cookie `auth-token` só será enviado via HTTPS em produção

#### JWT Secret

**Gerar novo secret para produção:**

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**IMPORTANTE:**
- Use um secret diferente para dev e produção
- NUNCA commite o arquivo `.env` no Git (já está no `.gitignore`)
- Adicione `JWT_SECRET` nas variáveis de ambiente do serviço de hospedagem

#### Duração da Sessão

- **Padrão:** 7 dias (configurado em `JWT_EXPIRES_IN="7d"`)
- **Outras opções:** `"30d"` (30 dias), `"24h"` (24 horas), `"1h"` (1 hora)
- Cookie HTTPOnly expira automaticamente junto com o JWT

### Adicionar Rotas Protegidas

Para proteger novas rotas, edite `middleware.ts`:

```typescript
const protectedRoutes = [
  '/curtidos',
  '/historico',
  '/sugestao',
  '/perfil',        // Adicione aqui
  '/dashboard',     // Adicione aqui
]
```

Usuários não autenticados serão redirecionados para `/login`.

---

## 🚀 Próximos Passos (Opcional)

Funcionalidades que podem ser implementadas no futuro:

### Segurança Avançada

- [ ] **Recuperação de Senha** - "Esqueci minha senha" com email de reset
- [ ] **Verificação de Email** - Enviar email de confirmação após cadastro
- [ ] **Two-Factor Authentication (2FA)** - Camada extra de segurança
- [ ] **Rate Limiting** - Limitar tentativas de login (prevenir brute force)
- [ ] **Logs de Atividade** - Registrar logins, IPs, dispositivos

### Perfil de Usuário

- [ ] **Página de Perfil** - `/perfil` com dados do usuário
- [ ] **Editar Perfil** - Alterar nome, email, senha
- [ ] **Upload de Foto** - Avatar do usuário (Cloudinary, S3)
- [ ] **Deletar Conta** - Opção de excluir perfil e dados

### Social Login

- [ ] **Login com Google** - OAuth 2.0 via NextAuth.js
- [ ] **Login com GitHub** - OAuth 2.0 via NextAuth.js
- [ ] **Login com Facebook** - OAuth 2.0

### Outras Melhorias

- [ ] **Lembrar-me** - Checkbox para sessão mais longa (30 dias)
- [ ] **Sessões Múltiplas** - Listar dispositivos conectados
- [ ] **Notificações** - Avisos de login de novo dispositivo
- [ ] **Auditoria** - Dashboard admin para gerenciar usuários

---

## 📚 Referências e Documentação

### Frameworks e Bibliotecas

- [Next.js 16 App Router](https://nextjs.org/docs/app) - Framework principal
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware) - Proteção de rotas
- [Prisma ORM](https://www.prisma.io/docs) - Gerenciamento de banco de dados
- [Redux Toolkit](https://redux-toolkit.js.org/) - Gerenciamento de estado
- [bcrypt](https://www.npmjs.com/package/bcrypt) - Hash de senhas
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) - JWT tokens

### Segurança

- [Google reCAPTCHA v2](https://www.google.com/recaptcha/about/) - Proteção anti-bot
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/) - Uso seguro de JWT
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html) - Boas práticas de autenticação
- [OWASP Top 10](https://owasp.org/www-project-top-ten/) - Vulnerabilidades web

### Ferramentas

- [JWT.io](https://jwt.io/) - Decodificar e validar tokens JWT
- [Prisma Studio](https://www.prisma.io/studio) - Interface visual do banco de dados
- [PostgreSQL Docs](https://www.postgresql.org/docs/) - Documentação do PostgreSQL

---

**Documento atualizado:** 2024-12-16
**Para dúvidas sobre banco de dados:** Consulte `DATABASE.md`
**Para visão geral do projeto:** Consulte `CLAUDE.md`
