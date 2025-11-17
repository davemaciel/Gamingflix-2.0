# 🔄 Configurar Auto-Deploy no Railway

## 🎯 CONFIGURAÇÃO DA BRANCH

### ✅ PASSOS NO RAILWAY:

1. **Clique no botão "Eject"** (ao lado de "davemaciel/Gamingflix-2.0")

2. **Na seção "Branch connected to production":**
   - Clique no campo de texto
   - Digite: `main`
   - Pressione Enter

3. **Confirme:**
   - Deve aparecer: "Updates will be pulled from the latest commit on this GitHub branch"
   - Branch: **main**

---

## 🚀 COMO FUNCIONA:

Agora **TODA VEZ** que você fizer:

```bash
git add .
git commit -m "Sua mensagem"
git push origin main
```

O Railway vai **automaticamente**:
1. Detectar o push
2. Fazer pull do código
3. Rodar build
4. Fazer redeploy
5. Aplicação atualizada! 🎉

---

## 🔧 SE DER ERRO "Problem processing request":

### Solução 1: Atualizar manualmente
1. Clique em **"Check for updates"**
2. Se aparecer nova versão, clique para atualizar

### Solução 2: Reconectar repositório
1. Clique em **"Disconnect"**
2. Clique em **"Connect to GitHub"**
3. Selecione: **davemaciel/Gamingflix-2.0**
4. Configure branch: **main**

### Solução 3: Redeploy manual
1. Vá em **Settings** (do serviço)
2. Clique em **"Redeploy"**

---

## ⚙️ VARIÁVEIS DE AMBIENTE

**IMPORTANTE:** Configure TODAS estas variáveis primeiro!

```env
# === BANCO DE DADOS (OBRIGATÓRIO!) ===
MONGODB_URL=mongodb+srv://usuario:senha@cluster.mongodb.net/gameflix?retryWrites=true&w=majority
MONGODB_DB_NAME=gameflix

# === SERVIDOR ===
PORT=3000
NODE_ENV=production
CORS_ORIGIN=*

# === JWT ===
JWT_SECRET=sua_chave_secreta_forte_aqui
JWT_EXPIRES_IN=7d

# === FRONTEND (VITE) ===
VITE_API_URL=/api
VITE_STEAM_GUARD_API_URL=
VITE_SUPABASE_URL=https://rtyrmkniabujabcwbcnh.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0eXJta25pYWJ1amFiY3diY25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMzcwMzgsImV4cCI6MjA3NTYxMzAzOH0.aoZb-FjO4UJIxtiDQ9VqgJvtTLb3bZm4GmE68f9WiG4

# === EMAIL (IMAP) ===
EMAIL_USER=contato@gamingflix.space
EMAIL_PASSWORD=sua_senha
EMAIL_HOST=mail.spacemail.com
EMAIL_PORT=993
EMAIL_TLS=true
EMAIL_MAILBOX=INBOX

# === STEAM GUARD ===
STEAM_EMAIL_SUBJECT=Steam Guard Code
STEAM_CODE_REGEX=([A-Z0-9]{5})
STEAM_CODE_MAX_AGE_MIN=30

# === SMTP ===
SMTP_HOST=mail.spacemail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=contato@gamingflix.space
SMTP_PASS=sua_senha
SMTP_FROM="GamingFlix" <contato@gamingflix.space>

# === FRONTEND URL ===
FRONTEND_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}
```

---

## 📝 CHECKLIST ANTES DE ATIVAR AUTO-DEPLOY

- [ ] MongoDB Atlas configurado e funcionando
- [ ] Todas as variáveis de ambiente configuradas
- [ ] Pelo menos 1 deploy manual funcionou
- [ ] Branch configurada: `main`
- [ ] Auto-deploy ativado

---

## 🎯 TESTAR AUTO-DEPLOY

1. Faça uma mudança pequena (ex: adicione um comentário no código)

2. Commit e push:
   ```bash
   git add .
   git commit -m "Test auto-deploy"
   git push origin main
   ```

3. No Railway:
   - Vá em **"Deployments"**
   - Deve aparecer um novo deployment iniciando
   - Aguarde finalizar
   - Acesse a URL para ver a mudança

---

## ✅ PRONTO!

Agora toda mudança que você fizer e der push, o Railway atualiza automaticamente! 🚀

**Tempo de deploy:** ~2-5 minutos

