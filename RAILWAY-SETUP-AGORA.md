# 🚂 RAILWAY - CONFIGURAÇÃO SIMPLIFICADA

## ⚡ CONFIGURAÇÃO ATUAL (FUNCIONANDO)

O projeto está configurado para deploy unificado:
- Frontend builda para `/dist`
- Backend serve o `/dist` + API
- Tudo em 1 serviço só!

---

## 🎯 PASSOS NO RAILWAY

### 1️⃣ Criar Projeto
1. Acesse: https://railway.app
2. **New Project** → **Deploy from GitHub repo**
3. Selecione: **Gamingflix-2.0**
4. Aguarde detecção automática

### 2️⃣ Configurar Variáveis de Ambiente

Clique em **Variables** e adicione TODAS estas variáveis:

```env
# === PORTA DO SERVIDOR ===
PORT=3000

# === AMBIENTE ===
NODE_ENV=production

# === MONGODB (ATLAS OBRIGATÓRIO!) ===
MONGODB_URL=mongodb+srv://seu_usuario:sua_senha@cluster.mongodb.net/gameflix?retryWrites=true&w=majority
MONGODB_DB_NAME=gameflix

# === JWT ===
JWT_SECRET=SuaChaveSecretaSuperForteAqui123456
JWT_EXPIRES_IN=7d

# === CORS ===
CORS_ORIGIN=*

# === VITE (FRONTEND) ===
VITE_API_URL=/api
VITE_STEAM_GUARD_API_URL=
VITE_SUPABASE_URL=https://rtyrmkniabujabcwbcnh.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0eXJta25pYWJ1amFiY3diY25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMzcwMzgsImV4cCI6MjA3NTYxMzAzOH0.aoZb-FjO4UJIxtiDQ9VqgJvtTLb3bZm4GmE68f9WiG4

# === EMAIL (IMAP) - Steam Guard ===
EMAIL_USER=contato@gamingflix.space
EMAIL_PASSWORD=sua_senha_email
EMAIL_HOST=mail.spacemail.com
EMAIL_PORT=993
EMAIL_TLS=true
EMAIL_MAILBOX=INBOX

# === STEAM GUARD ===
STEAM_EMAIL_SUBJECT=Steam Guard Code
STEAM_CODE_REGEX=([A-Z0-9]{5})
STEAM_CODE_MAX_AGE_MIN=30

# === SMTP (Recuperação de Senha) ===
SMTP_HOST=mail.spacemail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=contato@gamingflix.space
SMTP_PASS=sua_senha_email
SMTP_FROM="GamingFlix" <contato@gamingflix.space>

# === URL DO FRONTEND ===
FRONTEND_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}
```

> ⚠️ **IMPORTANTE:** Troque `sua_senha_email` pela senha real!

---

## 🗄️ MONGODB ATLAS (OBRIGATÓRIO)

### Passo a Passo:

1. **Criar conta:** https://www.mongodb.com/cloud/atlas/register

2. **Criar cluster:**
   - Escolha **M0 (Free)**
   - Provider: AWS
   - Region: us-east-1 (ou mais próximo)

3. **Criar usuário:**
   - Aba **"Database Access"**
   - **Add New Database User**
   - Username: `gameflix`
   - Password: Gere uma senha forte (anote!)
   - Role: **Atlas admin**

4. **Liberar acesso:**
   - Aba **"Network Access"**
   - **Add IP Address**
   - Clique **"Allow Access from Anywhere"** (0.0.0.0/0)
   - Confirme

5. **Copiar connection string:**
   - Aba **"Database"**
   - Clique **"Connect"**
   - **"Connect your application"**
   - **Driver:** Node.js
   - **Version:** 4.1 or later
   - Copie a string:
   ```
   mongodb+srv://gameflix:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   
6. **Ajustar string:**
   - Troque `<password>` pela senha que você criou
   - Adicione `/gameflix` antes do `?`:
   ```
   mongodb+srv://gameflix:SuaSenha@cluster0.xxxxx.mongodb.net/gameflix?retryWrites=true&w=majority
   ```

7. **Colar no Railway:**
   - Cole na variável `MONGODB_URL`

---

## 🔑 GERAR JWT_SECRET

Use um destes métodos:

**PowerShell:**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

**Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Online:**
https://randomkeygen.com/ (escolha "Fort Knox Passwords")

---

## ✅ CHECKLIST

Antes de fazer deploy, confirme:

- [ ] MongoDB Atlas criado e configurado
- [ ] Connection string testada (IP 0.0.0.0/0 liberado)
- [ ] Todas as variáveis de ambiente configuradas no Railway
- [ ] `JWT_SECRET` gerado e configurado
- [ ] Email e senha atualizados

---

## 🚀 FAZER DEPLOY

1. **Salve as variáveis** no Railway
2. Railway vai **automaticamente**:
   - Instalar dependências
   - Buildar frontend
   - Instalar backend
   - Iniciar servidor

3. **Aguarde** (pode levar 2-5 minutos)

4. **Verifique logs:**
   - Clique em **"View Logs"**
   - Deve aparecer:
     ```
     Servidor rodando em http://0.0.0.0:3000
     MongoDB conectado com sucesso
     ```

5. **Acesse a aplicação:**
   - Clique em **"Settings"** → **"Domains"**
   - Veja a URL gerada: `https://gamingflix-production-xxxx.up.railway.app`
   - Clique para abrir!

---

## 🐛 TROUBLESHOOTING

### ❌ "Crashed" logo após deploy

**Causa:** MongoDB não conectou

**Solução:**
1. Verifique a variável `MONGODB_URL` no Railway
2. Teste no MongoDB Compass: https://www.mongodb.com/try/download/compass
3. Confirme que IP 0.0.0.0/0 está liberado no Atlas

### ❌ Build dá erro

**Causa:** Dependências faltando

**Solução:**
1. Veja os logs do build
2. Pode ser que precise fazer redeploy
3. **Settings** → **Redeploy**

### ❌ Frontend carrega mas API retorna erro

**Causa:** Variáveis de ambiente não configuradas

**Solução:**
1. Verifique TODAS as variáveis
2. Especialmente `MONGODB_URL` e `JWT_SECRET`
3. Após adicionar, faça redeploy

### ❌ "Cannot find module"

**Causa:** Dependências do backend não instaladas

**Solução:**
1. Força novo build: **Settings** → **Redeploy**

---

## 📊 VERIFICAR SE ESTÁ FUNCIONANDO

### Health Check
Acesse: `https://sua-url.railway.app/health`

Deve retornar:
```json
{
  "status": "ok",
  "timestamp": "2025-11-17T..."
}
```

### Frontend
Acesse: `https://sua-url.railway.app`

Deve carregar a página inicial do Gamingflix

### API
Acesse: `https://sua-url.railway.app/api/health`

Deve retornar:
```json
{
  "status": "ok",
  "timestamp": "...",
  "via": "proxy"
}
```

---

## 💰 CUSTOS

**Railway Free Tier:**
- $5/mês de crédito grátis
- 500 horas de execução
- Sem cartão de crédito necessário inicialmente

**MongoDB Atlas:**
- M0: Totalmente grátis
- 512MB de storage
- Conexões compartilhadas

**Total: GRÁTIS!** 🎉

---

## 🎯 RESUMO

1. ✅ Configurar MongoDB Atlas
2. ✅ Copiar connection string
3. ✅ Adicionar TODAS variáveis no Railway
4. ✅ Aguardar deploy automático
5. ✅ Acessar URL gerada
6. ✅ Testar `/health`

**Pronto! Seu Gamingflix está no ar!** 🚀

