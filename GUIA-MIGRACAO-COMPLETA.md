# 🚀 GUIA COMPLETO DE MIGRAÇÃO E BACKUP

**Criado para:** Proteger dados caso a VPS do Google Cloud caia  
**Objetivo:** Fazer backup completo (código + banco de dados) no GitHub  
**Restauração:** Facilitar deploy em nova máquina sem perder nada

---

## 📋 ÍNDICE

1. [Por que este guia?](#por-que-este-guia)
2. [Backup Rápido (Uso Diário)](#backup-rápido-uso-diário)
3. [Backup Completo Manual](#backup-completo-manual)
4. [Restauração em Nova Máquina](#restauração-em-nova-máquina)
5. [Automação de Backup](#automação-de-backup)
6. [Checklist de Segurança](#checklist-de-segurança)

---

## 🎯 POR QUE ESTE GUIA?

### Situação Atual:
- ✅ Projeto rodando em VPS Google Cloud
- ⚠️ Créditos limitados - máquina pode cair a qualquer momento
- ⚠️ Banco de dados MongoDB local na VPS
- ⚠️ Se a VPS cair = **PERDA DE DADOS**

### Solução:
- ✅ Backup automático do MongoDB em JSON
- ✅ Tudo versionado no GitHub
- ✅ Restauração rápida em nova máquina
- ✅ Sem perda de dados!

---

## ⚡ BACKUP RÁPIDO (USO DIÁRIO)

### Opção 1: Script Automático (Recomendado)

```powershell
# Faz backup do MongoDB + Git push automático
.\auto-backup-and-push.ps1 "Backup do dia - trabalho completo"
```

**O que este script faz:**
1. ✅ Backup completo do MongoDB em JSON
2. ✅ `git add .` (adiciona tudo)
3. ✅ `git commit -m "mensagem"`
4. ✅ `git push` (envia para GitHub)

**Quando usar:**
- 🕐 Final do dia de trabalho
- 🕐 Após mudanças importantes
- 🕐 Antes de testar algo arriscado
- 🕐 Sempre que tiver medo de perder dados

---

### Opção 2: Manual Rápido

```powershell
# 1. Backup MongoDB
node backup-mongo.js

# 2. Git add/commit/push
git add .
git commit -m "Backup - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
git push
```

---

## 📦 BACKUP COMPLETO MANUAL

### Passo 1: Backup do MongoDB

```powershell
cd C:\Users\spaceverse001\Desktop\gameflix-catalog-51332-main
node backup-mongo.js
```

**O que este script faz:**
- Conecta ao MongoDB local
- Exporta TODAS as coleções para JSON:
  - `profiles` (usuários cadastrados)
  - `games` (catálogo de jogos)
  - `subscriptions` (assinaturas ativas)
  - `steam_codes` (códigos Steam Guard)
  - `reset_tokens` (tokens de recuperação)
  - `game_history` (histórico)
- Salva em: `mongodb-backup/backup-YYYY-MM-DD-HH-MM-SS/`

**Resultado:**
```
✅ profiles: 15 documentos salvos
✅ games: 52 documentos salvos
✅ subscriptions: 8 documentos salvos
...
📁 Local: mongodb-backup/backup-2025-11-15-19-30-00/
```

---

### Passo 2: Verificar Backup

```powershell
# Ver backups criados
ls mongodb-backup/

# Ver conteúdo de um backup
ls mongodb-backup/backup-2025-11-15-19-30-00/
```

Você deve ver arquivos como:
- `profiles.json`
- `games.json`
- `subscriptions.json`
- `metadata.json`

---

### Passo 3: Commit para Git

```powershell
# Adicionar TUDO (código + backups)
git add .

# Ver o que vai ser commitado
git status

# Commit
git commit -m "Backup completo - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"

# Push para GitHub
git push
```

---

## 🔄 RESTAURAÇÃO EM NOVA MÁQUINA

### Cenário: VPS caiu, você está em nova máquina

---

### Passo 1: Clonar Repositório

```bash
# Clone do GitHub
git clone https://github.com/SEU-USUARIO/gameflix-catalog-51332-main.git
cd gameflix-catalog-51332-main
```

---

### Passo 2: Instalar Dependências

```bash
# Node.js (backend)
cd backend
npm install
cd ..

# React (frontend)
npm install
```

---

### Passo 3: Configurar Variáveis de Ambiente

```bash
# Copiar exemplo
cp backend/.env.example backend/.env

# Editar com suas credenciais
nano backend/.env
```

**Variáveis importantes:**
```bash
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=ggflixbot

EMAIL_USER=contato@gamingflix.space
EMAIL_PASSWORD=SuaSenha

JWT_SECRET=GerarNovoSecretAqui

# ... outras variáveis
```

---

### Passo 4: Instalar MongoDB

#### Ubuntu/Debian:
```bash
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### Windows:
- Baixar: https://www.mongodb.com/try/download/community
- Instalar e iniciar serviço

---

### Passo 5: Restaurar Backup do MongoDB

```bash
# Executar script de restore
node restore-mongo.js
```

**O que acontece:**
1. Script lista backups disponíveis
2. Escolhe o mais recente automaticamente
3. Conecta ao MongoDB
4. Restaura TODAS as coleções
5. Pronto! Dados recuperados ✅

**Resultado:**
```
✅ profiles: 15 documentos restaurados
✅ games: 52 documentos restaurados
✅ subscriptions: 8 documentos restaurados
...
✅ RESTAURAÇÃO COMPLETA!
```

---

### Passo 6: Iniciar Serviços

```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend (dev) ou Nginx (prod)
npm run build
# ... configurar nginx
```

---

## 🤖 AUTOMAÇÃO DE BACKUP

### Backup Automático Diário

#### Windows (Task Scheduler):

1. **Criar arquivo:** `backup-diario.bat`

```bat
@echo off
cd C:\Users\spaceverse001\Desktop\gameflix-catalog-51332-main
powershell -ExecutionPolicy Bypass -File .\auto-backup-and-push.ps1 "Backup automático diário"
```

2. **Agendar no Task Scheduler:**
   - Abrir "Agendador de Tarefas"
   - Criar Tarefa Básica
   - Nome: "GamingFlix Backup Diário"
   - Gatilho: Diariamente às 23:00
   - Ação: Iniciar programa `backup-diario.bat`

---

#### Linux (Cron):

```bash
# Editar crontab
crontab -e

# Adicionar linha (backup às 23:00)
0 23 * * * cd /path/to/projeto && node backup-mongo.js && git add . && git commit -m "Backup automático" && git push
```

---

## ✅ CHECKLIST DE SEGURANÇA

### Antes de Desligar VPS:

- [ ] ✅ Backup MongoDB executado
- [ ] ✅ Git push feito para GitHub
- [ ] ✅ Verificar que backup aparece no GitHub
- [ ] ✅ Anotar última versão do backup
- [ ] ✅ Salvar .env em local seguro (NÃO no GitHub!)
- [ ] ✅ Documentar configurações especiais (nginx, etc)

---

### Ao Migrar para Nova Máquina:

- [ ] ✅ Node.js instalado
- [ ] ✅ MongoDB instalado e rodando
- [ ] ✅ Projeto clonado do GitHub
- [ ] ✅ `npm install` em backend e frontend
- [ ] ✅ `.env` configurado com credenciais
- [ ] ✅ Backup MongoDB restaurado
- [ ] ✅ Backend iniciado e testado
- [ ] ✅ Frontend buildado e servido
- [ ] ✅ Nginx configurado (se prod)
- [ ] ✅ Testes de funcionalidade completos

---

## 📊 ESTRUTURA DE ARQUIVOS

```
gameflix-catalog-51332-main/
│
├── mongodb-backup/              ← Backups do banco
│   ├── backup-2025-11-15-19-30-00/
│   │   ├── profiles.json       ← Usuários
│   │   ├── games.json          ← Jogos
│   │   ├── subscriptions.json  ← Assinaturas
│   │   └── metadata.json       ← Info do backup
│   └── backup-2025-11-16-20-15-00/
│       └── ...
│
├── backend/
│   ├── .env                    ← NÃO vai pro Git
│   ├── .env.example            ← Vai pro Git (template)
│   └── src/
│
├── src/                        ← Frontend React
│
├── backup-mongo.js             ← Script de backup
├── restore-mongo.js            ← Script de restore
├── auto-backup-and-push.ps1    ← Automação completa
│
└── GUIA-MIGRACAO-COMPLETA.md   ← Este arquivo
```

---

## 🔐 SEGURANÇA

### ⚠️ O QUE NUNCA COMMITAR:

```
❌ backend/.env                  (senhas, tokens, secrets)
❌ *.pem, *.key                 (certificados SSL)
❌ node_modules/                (dependências)
❌ logs/                        (arquivos de log)
```

### ✅ O QUE DEVE COMMITAR:

```
✅ mongodb-backup/**/*.json     (dados do banco!)
✅ backend/.env.example         (template)
✅ Código fonte
✅ Documentação
✅ Scripts de backup/restore
```

---

## 💡 DICAS IMPORTANTES

### 1. Backup Frequente
```bash
# Faça backup SEMPRE após:
- Cadastrar novos jogos
- Criar novos usuários/assinaturas
- Mudanças no código importantes
- Final do dia de trabalho
```

### 2. Múltiplos Backups
```bash
# Mantenha múltiplas versões
# Os backups têm timestamp único
# Você pode restaurar qualquer versão
```

### 3. Teste de Restauração
```bash
# Teste o restore periodicamente
# Não espere a VPS cair para testar!
```

### 4. Backup do .env
```bash
# Salve .env em local seguro
# Exemplo: Google Drive, password manager
# NUNCA commite no Git!
```

---

## 🆘 TROUBLESHOOTING

### Erro: "Cannot connect to MongoDB"
```bash
# Verificar se MongoDB está rodando
sudo systemctl status mongod

# Iniciar MongoDB
sudo systemctl start mongod
```

---

### Erro: "Permission denied" no Git Push
```bash
# Configurar credenciais GitHub
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"

# Autenticar (pode precisar de token)
# Veja: https://github.com/settings/tokens
```

---

### Backup muito grande para GitHub
```bash
# Se backup > 100MB, considere:
1. Usar Git LFS (Large File Storage)
2. Comprimir backups: zip mongodb-backup/
3. Usar MongoDB Atlas (cloud) em vez de local
```

---

## 📞 COMANDOS ÚTEIS

```powershell
# Backup rápido
.\auto-backup-and-push.ps1

# Backup manual
node backup-mongo.js

# Restaurar último backup
node restore-mongo.js

# Ver backups
ls mongodb-backup/

# Status do Git
git status

# Ver histórico de commits
git log --oneline

# Push forçado (se necessário)
git push --force
```

---

## 🎯 RESUMO EXECUTIVO

**Para NUNCA perder dados:**

1. **Diariamente:** Execute `.\auto-backup-and-push.ps1`
2. **Semanalmente:** Verifique que backups estão no GitHub
3. **Mensalmente:** Teste restauração em ambiente de teste
4. **Sempre:** Mantenha .env salvo em local seguro

**Se VPS cair:**

1. Clone repositório do GitHub
2. Instale dependências (`npm install`)
3. Configure .env (copie do backup seguro)
4. Restaure MongoDB (`node restore-mongo.js`)
5. Inicie serviços (`npm start`)

**Pronto! Dados recuperados em < 30 minutos!** ✅

---

## 📚 RECURSOS ADICIONAIS

- [Documentação MongoDB Backup](https://www.mongodb.com/docs/manual/tutorial/backup-and-restore-tools/)
- [GitHub Large Files](https://git-lfs.github.com/)
- [Nginx Configuration](https://nginx.org/en/docs/)

---

**Criado em:** 2025-11-15  
**Atualizado:** Manter sempre atualizado  
**Autor:** Cascade AI Assistant  
**Status:** ✅ PRONTO PARA USO

**🎮 GamingFlix - Seus dados sempre protegidos!**
