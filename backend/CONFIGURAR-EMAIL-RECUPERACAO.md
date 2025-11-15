# 📧 Configurar Email de Recuperação de Senha

## Pré-requisitos

Para enviar emails de recuperação de senha, você precisa configurar um servidor SMTP. As opções mais comuns são:

1. **Gmail** (recomendado para desenvolvimento)
2. **SendGrid** (recomendado para produção)
3. **Amazon SES**
4. **Mailgun**
5. **Outro servidor SMTP**

---

## 🔧 Opção 1: Configurar com Gmail

### Passo 1: Habilitar autenticação de 2 fatores

1. Acesse https://myaccount.google.com/security
2. Ative a "Verificação em duas etapas"

### Passo 2: Criar senha de app

1. Acesse https://myaccount.google.com/apppasswords
2. Selecione "App": **Correio**
3. Selecione "Dispositivo": **Outro (nome personalizado)**
4. Digite: **GamingFlix**
5. Clique em "Gerar"
6. Copie a senha de 16 caracteres gerada

### Passo 3: Configurar o .env

Edite o arquivo `backend/.env` e adicione:

```env
# Configuração SMTP - Gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu.email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
SMTP_FROM=seu.email@gmail.com

# URL do frontend (para o link de reset)
FRONTEND_URL=http://localhost:5173
```

**IMPORTANTE:** Use a senha de app de 16 caracteres, NÃO sua senha do Gmail!

---

## 🔧 Opção 2: Configurar com SendGrid (Recomendado para Produção)

### Passo 1: Criar conta no SendGrid

1. Acesse https://sendgrid.com/
2. Crie uma conta gratuita (100 emails/dia grátis)

### Passo 2: Criar API Key

1. No painel do SendGrid, vá em **Settings** > **API Keys**
2. Clique em **Create API Key**
3. Nome: **GamingFlix**
4. Permissões: **Full Access** ou **Mail Send**
5. Copie a chave gerada (só aparece uma vez!)

### Passo 3: Verificar domínio/email

1. Em **Settings** > **Sender Authentication**
2. Clique em **Verify a Single Sender**
3. Preencha seus dados
4. Confirme o email recebido

### Passo 4: Configurar o .env

```env
# Configuração SMTP - SendGrid
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SMTP_FROM=noreply@seudominio.com

# URL do frontend (para o link de reset)
FRONTEND_URL=https://seudominio.com
```

---

## 🔧 Opção 3: Outros provedores SMTP

### Mailgun

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@seu-dominio.mailgun.org
SMTP_PASS=sua-senha-mailgun
SMTP_FROM=noreply@seudominio.com
FRONTEND_URL=https://seudominio.com
```

### Amazon SES

```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-username-ses
SMTP_PASS=sua-senha-ses
SMTP_FROM=noreply@seudominio.com
FRONTEND_URL=https://seudominio.com
```

---

## ✅ Testar Configuração

Após configurar o `.env`, reinicie o backend e teste:

### 1. Via interface (recomendado)

1. Acesse a página de login
2. Clique em "Esqueci minha senha"
3. Digite seu email
4. Verifique se recebeu o email

### 2. Via API (teste manual)

```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"seu@email.com"}'
```

### 3. Verificar logs do backend

Os logs devem mostrar:

```
✅ Password reset email sent to seu@email.com
```

Se houver erro:

```
❌ Error sending password reset email: ...
⚠️  Email not sent but token created. Token: abc123...
```

---

## 🔍 Solução de Problemas

### Erro: "Email transporter not configured"

- **Causa:** Variáveis SMTP não configuradas
- **Solução:** Verifique se `SMTP_USER` e `SMTP_PASS` estão no `.env`

### Erro: "Invalid login" (Gmail)

- **Causa:** Senha incorreta ou não é senha de app
- **Solução:** 
  1. Certifique-se de usar a senha de app (16 caracteres)
  2. Ative autenticação de 2 fatores

### Erro: "Connection timeout"

- **Causa:** Firewall bloqueando porta 587 ou 465
- **Solução:** 
  1. Teste outra porta (587, 465, 2525)
  2. Verifique firewall/antivírus

### Email não chega (sem erro nos logs)

- **Causa:** Email na pasta de spam
- **Solução:**
  1. Verifique a pasta de spam
  2. Adicione o remetente como contato confiável
  3. Use um provedor profissional (SendGrid)

### Erro: "Unauthorized"

- **Causa:** Credenciais incorretas
- **Solução:** Verifique usuário e senha do SMTP

---

## 📧 Como o Email Fica

O usuário receberá um email assim:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Recuperação de Senha

Você solicitou a recuperação de senha da sua conta GamingFlix.

Clique no link abaixo para redefinir sua senha:

[ Redefinir Senha ]  (botão azul)

Este link expira em 1 hora.

Se você não solicitou esta recuperação, ignore este email.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GamingFlix - Seu catálogo de jogos
```

---

## 🔒 Segurança

### Boas Práticas

1. ✅ Use senha de app, não senha real do email
2. ✅ Não compartilhe as credenciais SMTP
3. ✅ Use HTTPS em produção para o frontend
4. ✅ Configure SPF, DKIM e DMARC para seu domínio
5. ✅ Use um email profissional (não @gmail.com em produção)

### Variáveis obrigatórias

```env
SMTP_USER=     # Email ou username SMTP
SMTP_PASS=     # Senha ou API Key
```

### Variáveis opcionais (com valores padrão)

```env
SMTP_HOST=smtp.gmail.com      # Padrão: Gmail
SMTP_PORT=587                 # Padrão: 587 (TLS)
SMTP_SECURE=false             # Padrão: false
SMTP_FROM=                    # Padrão: usa SMTP_USER
FRONTEND_URL=http://localhost:5173  # Padrão: localhost
```

---

## 📝 Checklist de Configuração

- [ ] Escolhi um provedor SMTP (Gmail/SendGrid/etc)
- [ ] Criei senha de app ou API Key
- [ ] Configurei todas as variáveis no `backend/.env`
- [ ] Reiniciei o backend
- [ ] Testei o envio de email
- [ ] Recebi o email com sucesso
- [ ] Testei o link de redefinição de senha
- [ ] Redefinição de senha funcionou

---

## 🆘 Suporte

Se ainda tiver problemas:

1. Verifique os logs do backend em `backend/logs/`
2. Teste com outro email
3. Teste com outro provedor SMTP
4. Verifique se o firewall não está bloqueando

---

## 🎉 Pronto!

Após configurar corretamente, os usuários poderão:

1. Clicar em "Esqueci minha senha"
2. Receber email com link
3. Redefinir a senha
4. Fazer login com a nova senha
