# 🔐 SISTEMA DE BACKUP AUTOMÁTICO

## ⚡ USO RÁPIDO

### Fazer Backup Completo + Push GitHub:
```powershell
.\auto-backup-and-push.ps1 "Descrição do backup"
```

---

## 📦 SCRIPTS DISPONÍVEIS

### 1. `backup-mongo.js`
Faz backup completo do MongoDB em arquivos JSON.

**Uso:**
```bash
node backup-mongo.js
```

**Resultado:**
- Cria pasta `mongodb-backup/backup-YYYY-MM-DD-HH-MM-SS/`
- Exporta todas as coleções em JSON
- Gera arquivo `metadata.json` com informações do backup

---

### 2. `restore-mongo.js`
Restaura backup do MongoDB.

**Uso:**
```bash
node restore-mongo.js
```

**O que faz:**
- Lista backups disponíveis
- Escolhe o mais recente automaticamente
- Restaura todas as coleções no MongoDB

---

### 3. `auto-backup-and-push.ps1`
Script completo que faz backup + Git push automático.

**Uso:**
```powershell
.\auto-backup-and-push.ps1 "Mensagem do commit"
```

**Passos executados:**
1. ✅ Backup MongoDB (`node backup-mongo.js`)
2. ✅ Git add (todos os arquivos)
3. ✅ Git commit
4. ✅ Git push para GitHub

---

## 📊 COLEÇÕES BACKUPEADAS

- `profiles` - Usuários cadastrados
- `games` - Catálogo de jogos
- `subscriptions` - Assinaturas ativas
- `steam_codes` - Códigos Steam Guard
- `reset_tokens` - Tokens de recuperação de senha
- `game_history` - Histórico de uso

---

## 🎯 QUANDO FAZER BACKUP

✅ **Diariamente:**
- Final do dia de trabalho
- Após mudanças importantes

✅ **Antes de:**
- Testar código novo
- Fazer deploy
- Migrar servidor
- Atualizar dependências

✅ **Depois de:**
- Cadastrar jogos novos
- Criar usuários/assinaturas
- Mudanças no banco de dados

---

## 🔄 RESTAURAÇÃO

### Em Nova Máquina:

```bash
# 1. Clonar repo
git clone https://github.com/SEU-USUARIO/gameflix-catalog.git
cd gameflix-catalog

# 2. Instalar dependências
npm install
cd backend && npm install && cd ..

# 3. Configurar .env
cp backend/.env.example backend/.env
# Editar backend/.env com suas credenciais

# 4. Restaurar MongoDB
node restore-mongo.js

# 5. Iniciar
cd backend && npm start
```

---

## 📁 ESTRUTURA DE BACKUP

```
mongodb-backup/
└── backup-2025-11-15-19-30-00/
    ├── profiles.json          (usuários)
    ├── games.json             (jogos)
    ├── subscriptions.json     (assinaturas)
    ├── steam_codes.json       (códigos)
    ├── reset_tokens.json      (tokens)
    ├── game_history.json      (histórico)
    └── metadata.json          (info do backup)
```

---

## ⚠️ IMPORTANTE

### ✅ VAI PRO GIT:
- `mongodb-backup/**/*.json` (dados!)
- Código fonte
- Scripts de backup

### ❌ NÃO VAI PRO GIT:
- `backend/.env` (senhas!)
- `node_modules/`
- `dist/`
- `logs/`

---

## 🆘 PROBLEMAS COMUNS

### Erro: "Cannot find module"
```bash
npm install
```

### Erro: "Cannot connect to MongoDB"
```bash
# Verificar se MongoDB está rodando
sudo systemctl start mongod  # Linux
# ou
net start MongoDB            # Windows
```

### Erro: Git push
```bash
# Configurar credenciais
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
```

---

## 💡 DICAS

1. **Automatize:** Configure backup automático diário
2. **Teste:** Teste restauração periodicamente
3. **Múltiplas versões:** Mantenha vários backups
4. **Segurança:** Salve .env em local seguro separado

---

## 📚 DOCUMENTAÇÃO COMPLETA

Ver: `GUIA-MIGRACAO-COMPLETA.md`

---

**🎮 GamingFlix - Backup sempre atualizado!**
