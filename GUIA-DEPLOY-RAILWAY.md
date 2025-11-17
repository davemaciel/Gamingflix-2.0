# 🚂 Guia de Deploy no Railway - Gamingflix 2.0

## ⚠️ PROBLEMA RESOLVIDO

O erro ocorria porque o Railway estava tentando usar Bun (detectou o `bun.lockb`), mas falhava por:
- Pacote `isolated-vm` com erro
- CPU sem suporte AVX2

**Solução:** Removemos o `bun.lockb` e criamos `nixpacks.toml` para forçar o uso de npm.

---

## 📋 Estrutura do Projeto

Você tem 2 aplicações que precisam de **2 serviços separados** no Railway:

1. **Frontend** (Vite + React) - Raiz do projeto
2. **Backend** (Node.js + Express) - Pasta `/backend`

---

## 🚀 Passo a Passo para Deploy

### 1️⃣ FRONTEND (Aplicação Principal)

#### No Railway:

1. **Criar novo serviço** no Railway
2. **Conectar ao repositório** GitHub
3. **Root Directory:** `/` (raiz)
4. **Configurações automáticas** (já configuramos com `nixpacks.toml`)

#### Variáveis de Ambiente Necessárias:

```env
VITE_API_URL=https://seu-backend.railway.app
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_supabase
```

> ⚠️ **IMPORTANTE:** O `VITE_API_URL` deve apontar para a URL do backend que você vai criar no próximo passo!

---

### 2️⃣ BACKEND (API)

#### No Railway:

1. **Criar OUTRO serviço** no Railway (no mesmo projeto)
2. **Conectar ao MESMO repositório** GitHub
3. **Root Directory:** `/backend` ⚠️ **IMPORTANTE!**
4. **Build Command:** `npm install`
5. **Start Command:** `npm start`

#### Variáveis de Ambiente do Backend:

```env
# Servidor
PORT=3000
NODE_ENV=production

# CORS - Permitir acesso do frontend
CORS_ORIGIN=https://seu-frontend.railway.app

# MongoDB - IMPORTANTE: Use MongoDB Atlas ou Railway MongoDB
MONGODB_URL=mongodb+srv://usuario:senha@cluster.mongodb.net/gameflix?retryWrites=true&w=majority
MONGODB_DB_NAME=gameflix

# JWT Authentication
JWT_SECRET=gere_uma_chave_secreta_forte_aqui
JWT_EXPIRES_IN=7d

# Configurações de Email (IMAP) - Steam Guard
EMAIL_USER=contato@gamingflix.space
EMAIL_PASSWORD=sua_senha_email
EMAIL_HOST=mail.spacemail.com
EMAIL_PORT=993
EMAIL_TLS=true
EMAIL_MAILBOX=INBOX

# Steam Guard - Parâmetros
STEAM_EMAIL_SUBJECT=Steam Guard Code
STEAM_CODE_REGEX=([A-Z0-9]{5})
STEAM_CODE_MAX_AGE_MIN=30

# SMTP Configuration (Recuperação de senha)
SMTP_HOST=mail.spacemail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=contato@gamingflix.space
SMTP_PASS=sua_senha_email
SMTP_FROM="GamingFlix" <contato@gamingflix.space>

# Frontend URL (Para links de recuperação)
FRONTEND_URL=https://seu-frontend.railway.app
```

---

## 🗄️ CONFIGURAR MONGODB

### Opção 1: MongoDB Atlas (RECOMENDADO - GRÁTIS)

1. Acesse: https://www.mongodb.com/cloud/atlas/register
2. Crie um cluster gratuito (M0)
3. Crie um usuário de banco de dados
4. Adicione seu IP à whitelist (ou use `0.0.0.0/0` para todos)
5. Copie a **Connection String**:
   ```
   mongodb+srv://usuario:senha@cluster.mongodb.net/gameflix?retryWrites=true&w=majority
   ```
6. Cole no Railway como `MONGODB_URL`

### Opção 2: Railway MongoDB Plugin

1. No projeto Railway, clique em **"+ New"**
2. Selecione **"Database" > "MongoDB"**
3. O Railway vai criar automaticamente a variável `MONGO_URL`
4. Adicione também: `MONGODB_DB_NAME=gameflix`

---

## 🔧 PASSOS FINAIS

### 1. Fazer Commit e Push

```bash
git add .
git commit -m "Configure Railway deployment with npm"
git push origin main
```

### 2. No Railway - Deploy do BACKEND primeiro

1. Vá para o serviço do **Backend**
2. Configure as variáveis de ambiente (copie do template acima)
3. Configure o **Root Directory** = `/backend`
4. Aguarde o deploy
5. **Copie a URL gerada** (ex: `https://gamingflix-backend.railway.app`)

### 3. No Railway - Deploy do FRONTEND

1. Vá para o serviço do **Frontend**
2. Configure as variáveis de ambiente:
   ```env
   VITE_API_URL=https://gamingflix-backend.railway.app
   VITE_SUPABASE_URL=https://rtyrmkniabujabcwbcnh.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGci...
   ```
3. **Root Directory** = `/` (raiz)
4. Aguarde o deploy

---

## ✅ CHECKLIST DE DEPLOY

- [ ] Removido `bun.lockb` da raiz
- [ ] Criado `nixpacks.toml` na raiz
- [ ] Criado `nixpacks.toml` no `/backend`
- [ ] MongoDB configurado (Atlas ou Railway)
- [ ] Variáveis de ambiente do **Backend** configuradas
- [ ] Variáveis de ambiente do **Frontend** configuradas
- [ ] Root Directory do backend = `/backend`
- [ ] Root Directory do frontend = `/`
- [ ] URL do backend atualizada no frontend (`VITE_API_URL`)
- [ ] URL do frontend atualizada no backend (`FRONTEND_URL`)
- [ ] CORS configurado com URL do frontend
- [ ] Commit e push realizados

---

## 🐛 TROUBLESHOOTING

### ❌ "Failed to build image"
- Certifique-se que o `nixpacks.toml` existe
- Verifique se o `bun.lockb` foi removido

### ❌ "CORS Error" no frontend
- Verifique se `CORS_ORIGIN` no backend tem a URL correta do frontend
- Ou use `CORS_ORIGIN=*` (menos seguro, mas funciona)

### ❌ "Cannot connect to MongoDB"
- Verifique a connection string do MongoDB
- Certifique-se que o IP do Railway está na whitelist do Atlas
- Ou use `0.0.0.0/0` para permitir todos

### ❌ Backend não inicia
- Verifique os logs no Railway
- Confirme que todas as variáveis de ambiente obrigatórias estão configuradas

---

## 📝 COMANDOS ÚTEIS

```bash
# Commit e push das alterações
git add .
git commit -m "Configure Railway deployment"
git push origin main

# Ver logs localmente
cd backend
npm start

# Testar build do frontend
npm run build
npm run preview
```

---

## 🎯 ESTRUTURA FINAL NO RAILWAY

```
Projeto: Gamingflix-2.0
├── 🚂 Serviço 1: Frontend (Vite)
│   ├── Root: /
│   ├── Build: npm run build
│   └── URL: https://gamingflix-frontend.railway.app
│
├── 🚂 Serviço 2: Backend (Node/Express)
│   ├── Root: /backend
│   ├── Start: npm start
│   └── URL: https://gamingflix-backend.railway.app
│
└── 🗄️ MongoDB (Atlas ou Railway Plugin)
    └── Connection: mongodb+srv://...
```

---

## ✨ PRONTO!

Agora seu projeto está configurado para deploy no Railway usando **npm** ao invés de Bun! 

Se tiver algum erro, consulte a seção de Troubleshooting ou verifique os logs no Railway.

