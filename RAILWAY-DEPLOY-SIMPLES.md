# 🚂 Railway Deploy - TUDO EM UM SERVIÇO

## ✅ CONFIGURAÇÃO FEITA!

O projeto está configurado para rodar **Frontend + Backend em 1 único serviço** no Railway!

---

## 🎯 COMO FUNCIONA

1. **Build:** Railway builda o frontend (Vite) → gera pasta `/dist`
2. **Backend:** Serve os arquivos do `/dist` + API
3. **Resultado:** Tudo em uma URL só! 🎉

---

## 🚀 PASSO A PASSO RAILWAY

### 1️⃣ Criar Novo Projeto

1. Acesse: https://railway.app
2. Clique em **"New Project"**
3. Selecione **"Deploy from GitHub repo"**
4. Escolha o repositório **Gamingflix-2.0**

### 2️⃣ Configurar Variáveis de Ambiente

No Railway, vá em **Variables** e adicione:

#### ⚙️ Frontend (VITE)
```env
VITE_API_URL=/api
VITE_STEAM_GUARD_API_URL=
VITE_SUPABASE_URL=https://rtyrmkniabujabcwbcnh.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0eXJta25pYWJ1amFiY3diY25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMzcwMzgsImV4cCI6MjA3NTYxMzAzOH0.aoZb-FjO4UJIxtiDQ9VqgJvtTLb3bZm4GmE68f9WiG4
```

#### ⚙️ Backend (API)
```env
PORT=3000
NODE_ENV=production
CORS_ORIGIN=*

# MongoDB - USE MONGODB ATLAS (veja seção abaixo)
MONGODB_URL=mongodb+srv://usuario:senha@cluster.mongodb.net/gameflix?retryWrites=true
MONGODB_DB_NAME=gameflix

# JWT
JWT_SECRET=cole_uma_chave_secreta_forte_aqui
JWT_EXPIRES_IN=7d

# Email IMAP (Steam Guard)
EMAIL_USER=contato@gamingflix.space
EMAIL_PASSWORD=sua_senha
EMAIL_HOST=mail.spacemail.com
EMAIL_PORT=993
EMAIL_TLS=true
EMAIL_MAILBOX=INBOX

# Steam Guard
STEAM_EMAIL_SUBJECT=Steam Guard Code
STEAM_CODE_REGEX=([A-Z0-9]{5})
STEAM_CODE_MAX_AGE_MIN=30

# SMTP (Recuperação de senha)
SMTP_HOST=mail.spacemail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=contato@gamingflix.space
SMTP_PASS=sua_senha
SMTP_FROM="GamingFlix" <contato@gamingflix.space>

# Frontend URL (mesmo domínio)
FRONTEND_URL=${{RAILWAY_PUBLIC_DOMAIN}}
```

> 💡 **Dica:** Use `${{RAILWAY_PUBLIC_DOMAIN}}` para pegar automaticamente a URL do Railway!

### 3️⃣ Configurar MongoDB Atlas

**É OBRIGATÓRIO usar MongoDB externo!** Railway não tem MongoDB nativo.

1. Acesse: https://www.mongodb.com/cloud/atlas/register
2. Crie conta gratuita
3. Crie cluster **M0** (grátis)
4. Crie usuário: `Database Access` → `Add New Database User`
5. Libere acesso: `Network Access` → `Add IP Address` → `0.0.0.0/0` (todos)
6. Copie connection string: `Connect` → `Drivers` → `Node.js`
7. Cole em `MONGODB_URL` no Railway

**Exemplo:**
```
mongodb+srv://gameflix:SuaSenha123@cluster0.xxxxx.mongodb.net/gameflix?retryWrites=true&w=majority
```

### 4️⃣ Deploy Automático

✅ Railway vai detectar o `nixpacks.toml` e fazer deploy automático!

**O que vai acontecer:**
1. ⬇️ Install: `npm ci` (instala deps do frontend)
2. 🔨 Build: `npm run build` (builda frontend)
3. 🔨 Build: `cd backend && npm ci` (instala deps do backend)
4. 🚀 Start: `cd backend && npm start` (inicia servidor)

### 5️⃣ Acessar Aplicação

Após deploy, clique em **"View Logs"** para ver o progresso.

Quando terminar, clique em **"Open App"** ou acesse a URL gerada:
```
https://seu-projeto.railway.app
```

---

## 📋 CHECKLIST RÁPIDO

- [ ] Projeto criado no Railway
- [ ] Repositório GitHub conectado
- [ ] MongoDB Atlas configurado
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy iniciado
- [ ] Logs verificados (sem erros)
- [ ] Aplicação acessível

---

## 🗂️ ESTRUTURA DO DEPLOY

```
Gamingflix-2.0/
├── dist/                    # Frontend buildado (gerado no build)
│   ├── index.html
│   ├── assets/
│   └── ...
│
└── backend/
    └── src/
        └── index.js         # Serve /dist e /api
```

**Como o backend serve:**
- `GET /` → `dist/index.html` (React App)
- `GET /assets/*` → `dist/assets/*` (CSS, JS, imagens)
- `GET /api/*` → API do backend
- `GET /health` → Status do servidor

---

## 🐛 TROUBLESHOOTING

### ❌ Build falha com erro do Bun
✅ **RESOLVIDO!** Removemos `bun.lockb` e configuramos `nixpacks.toml`

### ❌ "Cannot connect to MongoDB"
- Verifique a connection string no `MONGODB_URL`
- Certifique-se que o IP `0.0.0.0/0` está liberado no Atlas
- Teste a conexão: https://www.mongodb.com/docs/atlas/troubleshoot-connection/

### ❌ Frontend carrega mas API retorna 404
- Verifique se `VITE_API_URL=/api` está configurado
- Confirme que o backend está rodando (veja logs)

### ❌ Variáveis de ambiente não funcionam
- Variáveis `VITE_*` são lidas **apenas no build**
- Se mudar uma `VITE_*`, precisa fazer **redeploy**
- Para forçar rebuild: `Settings` → `Redeploy`

---

## 💡 GERAR JWT_SECRET FORTE

Use um destes métodos:

```bash
# PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Online
https://randomkeygen.com/
```

---

## 🎉 PRONTO!

Seu projeto está rodando em **1 ÚNICO SERVIÇO** no Railway!

- ✅ Frontend: `https://seu-projeto.railway.app`
- ✅ API: `https://seu-projeto.railway.app/api`
- ✅ Health: `https://seu-projeto.railway.app/health`

**Custos:** Grátis até $5/mês de uso (Railway Free Tier)

---

## 📚 Links Úteis

- Railway Dashboard: https://railway.app/dashboard
- MongoDB Atlas: https://cloud.mongodb.com
- Railway Docs: https://docs.railway.app
- Logs em tempo real: No Railway, clique em **"View Logs"**

