# 📧 Configurar Email para Recuperação de Senha

Sistema de recuperação de senha implementado com sucesso! Para que funcione, configure o SMTP no backend.

## ⚙️ Configuração do Backend

Edite o arquivo `backend/.env` e configure as variáveis SMTP:

```env
# SMTP Configuration (Para recuperação de senha)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app
SMTP_FROM=GamingFlix <seu-email@gmail.com>

# Frontend URL (Para links de recuperação)
FRONTEND_URL=http://localhost:5173
```

## 📧 Opções de SMTP

### 1. Gmail (Recomendado para testes)

**Criar Senha de App:**
1. Acesse: https://myaccount.google.com/security
2. Ative verificação em 2 etapas
3. Vá em "Senhas de app" → Selecione "Outro" → Digite "GamingFlix"
4. Use a senha gerada de 16 caracteres

**Configuração:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seuemail@gmail.com
SMTP_PASS=sua-senha-de-app-16-caracteres
SMTP_FROM=GamingFlix <seuemail@gmail.com>
```

### 2. Mailtrap (Recomendado para desenvolvimento)

**Criar conta grátis:**
1. Acesse: https://mailtrap.io
2. Crie uma inbox de teste
3. Copie as credenciais SMTP

**Configuração:**
```env
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER=seu-username-mailtrap
SMTP_PASS=sua-password-mailtrap
SMTP_FROM=noreply@gamingflix.com
```

### 3. Outros Provedores

- **Outlook/Hotmail:** smtp-mail.outlook.com:587
- **Yahoo:** smtp.mail.yahoo.com:587
- **SendGrid, Mailgun, AWS SES:** Consulte documentação do provedor

## ✅ Funcionalidades Implementadas

### 🔐 Backend (Express + MongoDB)
- ✅ `POST /api/auth/forgot-password` - Solicitar recuperação de senha
- ✅ `POST /api/auth/reset-password` - Redefinir senha com token
- ✅ Sistema de tokens de recuperação com expiração de 1 hora
- ✅ Envio de emails HTML com link de recuperação
- ✅ Senhas hasheadas com bcrypt após reset

### 🎨 Frontend (React + TypeScript)
- ✅ Página `/forgot-password` - Solicitar recuperação
- ✅ Página `/reset-password?token=XXX` - Redefinir senha
- ✅ Link "Esqueci minha senha" na página de login
- ✅ Ícone de olhinho (Eye/EyeOff) em todos os campos de senha
- ✅ Validação de senha (mínimo 6 caracteres)
- ✅ Confirmação de senha no reset

## 🚀 Como Testar

### 1. Com Email Configurado:
```bash
# 1. Configure o SMTP no backend/.env
# 2. Reinicie o backend
cd backend
npm run dev

# 3. Acesse http://localhost:5173/auth
# 4. Clique em "Esqueci minha senha"
# 5. Digite seu email
# 6. Verifique o email recebido
# 7. Clique no link e redefina a senha
```

### 2. Sem Email (Modo Debug):
```bash
# Usuários antigos podem resetar senha via MongoDB:
mongosh gameflix
db.profiles.updateOne(
  { email: "usuario@example.com" },
  { $set: { password: "$2b$10$HASH_AQUI" } }
)
```

## 🔧 Solução para Usuários Antigos

Usuários migrados do Supabase têm senhas em formato incompatível (hash diferente). 

**Soluções:**
1. **Recuperação de senha** (Recomendado) - Usuários resetam via email
2. **Reset manual via MongoDB** - Admin reseta senhas específicas
3. **Script de migração** - Força todos a resetarem na primeira vez

## 📝 Notas Importantes

- ⚠️ Token de recuperação expira em **1 hora**
- 🔒 Senhas devem ter **mínimo 6 caracteres**
- 📧 Emails vão para **caixa de spam** se SMTP não estiver configurado corretamente
- 🔄 Backend deve ser **reiniciado** após alterar variáveis de ambiente
- 🌐 `FRONTEND_URL` deve apontar para o domínio correto em produção

## 🎯 Em Produção

Antes de colocar em produção:

1. **Use provedor de email profissional** (SendGrid, Mailgun, AWS SES)
2. **Configure DNS (SPF, DKIM, DMARC)** para evitar spam
3. **Altere `FRONTEND_URL`** para domínio real
4. **Customize o template do email** em `backend/src/config/email.js`
5. **Adicione rate limiting** para evitar spam de recuperação

---

✅ **Sistema de recuperação de senha está funcionando!**
🎉 **Usuários antigos e novos podem agora recuperar suas senhas por email**
👁️ **Todos os campos de senha agora têm o ícone de visualizar/esconder**
