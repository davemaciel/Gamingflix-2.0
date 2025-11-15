# 🚀 SETUP INICIAL - Nova Instalação

Este guia é para quando você clonar o projeto em uma nova máquina.

---

## 📋 PRÉ-REQUISITOS

Instale antes de começar:

- [x] **Node.js** v18+ ([Download](https://nodejs.org/))
- [x] **MongoDB** v6+ ([Download](https://www.mongodb.com/try/download/community))
- [x] **Git** ([Download](https://git-scm.com/))
- [x] **Nginx** (opcional, para produção)

---

## 🔧 PASSO 1: CLONAR REPOSITÓRIO

```bash
git clone https://github.com/SEU-USUARIO/gameflix-catalog-51332-main.git
cd gameflix-catalog-51332-main
```

---

## 📦 PASSO 2: INSTALAR DEPENDÊNCIAS

### Frontend:
```bash
npm install
```

### Backend:
```bash
cd backend
npm install
cd ..
```

---

## ⚙️ PASSO 3: CONFIGURAR VARIÁVEIS DE AMBIENTE

```bash
# Copiar exemplo
cp backend/.env.example backend/.env
```

Edite `backend/.env` com suas credenciais:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=ggflixbot

# Email (para enviar códigos Steam Guard)
EMAIL_USER=contato@gamingflix.space
EMAIL_PASSWORD=SuaSenhaAqui
EMAIL_HOST=mail.spacemail.com
EMAIL_PORT=993
EMAIL_TLS=true

# JWT
JWT_SECRET=GerarUmSecretSeguroAqui
JWT_EXPIRES_IN=7d

# Steam Guard
STEAM_CODE_MAX_AGE_MIN=5
STEAM_EMAIL_SUBJECT=Steam Guard
STEAM_CODE_REGEX=([A-Z0-9]{5})

# SMTP (para enviar emails)
SMTP_HOST=mail.spacemail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=contato@gamingflix.space
SMTP_PASS=SuaSenhaAqui
SMTP_FROM="GamingFlix" <contato@gamingflix.space>

# Frontend URL
FRONTEND_URL=https://ultimate.gamingflix.space

# Porta do servidor
PORT=3000
```

**IMPORTANTE:** Gerar JWT_SECRET seguro:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 🗄️ PASSO 4: MONGODB

### Opção A: Já tem backup (Restaurar)

Se você tem um backup do MongoDB:

```bash
node restore-mongo.js
```

Isso vai restaurar todos os dados:
- Usuários
- Jogos
- Assinaturas
- Códigos Steam Guard
- etc.

---

### Opção B: Começar do zero

Se é primeira vez:

```bash
# Iniciar MongoDB
sudo systemctl start mongod  # Linux
# ou
net start MongoDB            # Windows

# MongoDB criará o banco automaticamente
# quando o backend iniciar pela primeira vez
```

---

## 🎮 PASSO 5: INICIAR BACKEND

```bash
cd backend
npm start
```

Você deve ver:
```
✅ Servidor rodando na porta 3000
✅ MongoDB conectado
✅ Subscription checker started
```

---

## 🌐 PASSO 6: FRONTEND

### Desenvolvimento:
```bash
npm run dev
```

Acesse: `http://localhost:5173`

---

### Produção:
```bash
# Build
npm run build

# Servir com Nginx
# Configure nginx.conf para servir a pasta dist/
```

---

## 🔐 PASSO 7: CONFIGURAR NGINX (Produção)

Edite `/etc/nginx/sites-available/gamingflix` (Linux) ou `C:\nginx\conf\nginx.conf` (Windows):

```nginx
server {
    listen 80;
    server_name ultimate.gamingflix.space;

    # Frontend (arquivos estáticos)
    location / {
        root C:/path/to/gameflix-catalog-51332-main/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Reiniciar Nginx:
```bash
sudo systemctl restart nginx  # Linux
# ou
nginx -s reload              # Windows
```

---

## ✅ PASSO 8: TESTAR

### Teste 1: Backend
```bash
curl http://localhost:3000/api/health
# Deve retornar: {"status":"ok"}
```

### Teste 2: Frontend
Abra navegador: `http://localhost:5173` (dev) ou `http://ultimate.gamingflix.space` (prod)

### Teste 3: Steam Guard
Acesse: `/steam-guard`
Clique em "Buscar Código Steam Guard"

---

## 📊 VERIFICAR DADOS

### Ver coleções no MongoDB:

```bash
mongosh
use ggflixbot
show collections

# Ver dados
db.profiles.find()
db.games.find()
db.subscriptions.find()
```

---

## 🔄 FAZER PRIMEIRO BACKUP

Depois de tudo configurado:

```powershell
# Windows
.\auto-backup-and-push.ps1 "Setup inicial completo"

# Linux
node backup-mongo.js
git add .
git commit -m "Setup inicial completo"
git push
```

---

## 🆘 TROUBLESHOOTING

### Erro: "Cannot connect to MongoDB"
```bash
# Verificar se está rodando
sudo systemctl status mongod

# Iniciar
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Erro: "PORT 3000 already in use"
```bash
# Matar processo na porta 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux:
lsof -ti:3000 | xargs kill -9
```

### Erro: "Module not found"
```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

### Erro: EACCES (permissão negada)
```bash
# Linux: Dar permissão
sudo chown -R $USER:$USER .
chmod +x *.sh

# Windows: Executar como Admin
```

---

## 📚 DOCUMENTAÇÃO ADICIONAL

- **Backup/Restore:** Ver `README-BACKUP.md`
- **Migração Completa:** Ver `GUIA-MIGRACAO-COMPLETA.md`
- **Steam Guard:** Ver `PAGINA-STEAM-GUARD.md`
- **Correções:** Ver `CORRECAO-*.md`

---

## 🎯 CHECKLIST FINAL

- [ ] Node.js instalado
- [ ] MongoDB instalado e rodando
- [ ] Repositório clonado
- [ ] Dependências instaladas (frontend + backend)
- [ ] `.env` configurado
- [ ] Backup restaurado (se houver)
- [ ] Backend rodando (porta 3000)
- [ ] Frontend buildado
- [ ] Nginx configurado (prod)
- [ ] Testes básicos passando
- [ ] Primeiro backup feito
- [ ] Push para GitHub

---

## 🎉 PRONTO!

Seu projeto está configurado e rodando!

**Próximos passos:**
1. Cadastrar jogos no catálogo
2. Criar usuários de teste
3. Testar funcionalidade Steam Guard
4. Fazer backup diário

---

**🎮 GamingFlix - Setup completo!**
