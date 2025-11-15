# 🔧 CONFIGURAR NOVO REPOSITÓRIO GIT

**Status:** Projeto NÃO está conectado a nenhum repositório Git

---

## 🎯 PASSO A PASSO COMPLETO

### 1️⃣ CRIAR REPOSITÓRIO NO GITHUB

1. Acesse: https://github.com/new
2. Nome do repositório: `gameflix-catalog` (ou outro nome)
3. Descrição: "GamingFlix - Plataforma de catálogo de jogos Steam com Steam Guard automático"
4. **Privado** ✅ (recomendado - tem dados sensíveis)
5. **NÃO** marcar "Add a README file"
6. **NÃO** marcar "Add .gitignore"
7. **NÃO** marcar "Choose a license"
8. Clique: **Create repository**

GitHub vai te mostrar comandos - **IGNORE POR ENQUANTO**, vamos fazer melhor abaixo!

---

### 2️⃣ INICIALIZAR GIT LOCAL

No PowerShell na pasta do projeto:

```powershell
cd C:\Users\spaceverse001\Desktop\gameflix-catalog-51332-main

# Inicializar Git
git init

# Configurar seu nome e email (se ainda não configurou)
git config user.name "Seu Nome"
git config user.email "seu@email.com"
```

---

### 3️⃣ FAZER PRIMEIRO BACKUP DO MONGODB

**IMPORTANTE:** Fazer backup ANTES de commitar!

```powershell
node backup-mongo.js
```

---

### 4️⃣ ADICIONAR E COMMITAR TUDO

```powershell
# Adicionar todos os arquivos
git add .

# Ver o que vai ser commitado
git status

# Fazer commit inicial
git commit -m "Commit inicial - GamingFlix com sistema de backup completo"
```

---

### 5️⃣ CONECTAR AO GITHUB

Substitua `SEU-USUARIO` e `NOME-REPO` pelos seus:

```powershell
# Adicionar remote
git remote add origin https://github.com/SEU-USUARIO/NOME-REPO.git

# Renomear branch para main (padrão do GitHub)
git branch -M main

# Push inicial
git push -u origin main
```

**Exemplo:**
```powershell
git remote add origin https://github.com/spaceverse001/gameflix-catalog.git
git branch -M main
git push -u origin main
```

---

### 6️⃣ AUTENTICAÇÃO

Se pedir usuário/senha:

#### Opção A: Personal Access Token (Recomendado)

1. GitHub → Settings → Developer settings
2. Personal access tokens → Tokens (classic)
3. Generate new token (classic)
4. Marcar: `repo` (todos os sub-items)
5. Generate token
6. **COPIAR O TOKEN** (não vai aparecer de novo!)
7. Usar como senha no `git push`

#### Opção B: GitHub CLI

```powershell
# Instalar GitHub CLI
winget install GitHub.cli

# Autenticar
gh auth login
```

---

## ✅ VERIFICAR SE DEU CERTO

```powershell
# Ver remote configurado
git remote -v

# Deve mostrar:
# origin  https://github.com/SEU-USUARIO/gameflix-catalog.git (fetch)
# origin  https://github.com/SEU-USUARIO/gameflix-catalog.git (push)
```

Acesse seu repositório no GitHub e veja se os arquivos aparecem!

---

## 🔄 USO DIÁRIO (Após configurado)

```powershell
# Backup automático + push
.\auto-backup-and-push.ps1 "Descrição do trabalho"
```

Ou manual:

```powershell
# 1. Backup MongoDB
node backup-mongo.js

# 2. Add, commit, push
git add .
git commit -m "Backup - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
git push
```

---

## 📦 O QUE VAI PRO GITHUB

### ✅ Incluído (.gitignore já configurado):

- ✅ Código fonte (backend + frontend)
- ✅ **Backups MongoDB** (mongodb-backup/)
- ✅ Scripts de backup/restore
- ✅ Documentação completa
- ✅ Configurações (nginx.conf, etc)
- ✅ .env.example (template)

### ❌ Excluído (.gitignore):

- ❌ `backend/.env` (senhas!)
- ❌ `node_modules/` (dependências)
- ❌ `dist/` (build)
- ❌ `logs/` (arquivos de log)
- ❌ Certificados SSL

---

## 🔐 SEGURANÇA DO .ENV

O `.env` **NÃO vai pro GitHub** (está no .gitignore).

**Salve em local seguro separado:**

1. Google Drive (pasta privada)
2. Password Manager (1Password, Bitwarden)
3. Arquivo criptografado local
4. Anotações seguras

**Vai precisar dele para restaurar em nova máquina!**

---

## 🆘 PROBLEMAS COMUNS

### Erro: "Permission denied (publickey)"

**Solução:** Use HTTPS em vez de SSH:

```powershell
# Remover remote atual
git remote remove origin

# Adicionar com HTTPS
git remote add origin https://github.com/SEU-USUARIO/gameflix-catalog.git
```

---

### Erro: "Repository not found"

**Causas:**
1. Nome do repositório errado
2. Repositório não existe no GitHub
3. Sem permissão de acesso

**Solução:** Verifique URL do repositório no GitHub

---

### Erro: "Failed to push some refs"

**Causa:** Branch local desatualizada

**Solução:**
```powershell
git pull origin main --allow-unrelated-histories
git push origin main
```

---

### Erro: "Git is not initialized"

**Solução:**
```powershell
cd C:\Users\spaceverse001\Desktop\gameflix-catalog-51332-main
git init
```

---

## 📊 ESTRUTURA FINAL NO GITHUB

Seu repositório vai ficar assim:

```
gameflix-catalog/
├── backend/
│   ├── src/
│   ├── .env.example      ← Template (sem senhas)
│   └── package.json
├── src/                  ← Frontend React
├── mongodb-backup/       ← BACKUPS IMPORTANTES!
│   └── backup-2025.../
│       ├── profiles.json
│       ├── games.json
│       └── ...
├── backup-mongo.js
├── restore-mongo.js
├── auto-backup-and-push.ps1
├── .gitignore            ← Protege .env
├── README.md
├── PROTECAO-DADOS.md
└── ... (outros arquivos)
```

---

## 🎯 CHECKLIST

- [ ] Repositório criado no GitHub
- [ ] `git init` executado
- [ ] Nome/email configurados
- [ ] Backup MongoDB feito
- [ ] `git add .` executado
- [ ] Commit inicial feito
- [ ] Remote adicionado
- [ ] Push feito com sucesso
- [ ] Arquivos visíveis no GitHub
- [ ] .env salvo em local seguro
- [ ] Teste de `.\auto-backup-and-push.ps1`

---

## 💡 DICAS

### 1. README.md no GitHub

Crie um `README.md` para explicar o projeto:

```markdown
# 🎮 GamingFlix

Plataforma de catálogo de jogos Steam com Steam Guard automático.

## Features
- Catálogo de jogos Steam
- Steam Guard automático (sem copiar códigos!)
- Sistema de assinaturas
- Backup automático do banco de dados

## Tecnologias
- Backend: Node.js + Express + MongoDB
- Frontend: React + TypeScript + Tailwind
- Email: IMAP para Steam Guard
- Deploy: Nginx + VPS
```

---

### 2. Branches

Para organizar melhor:

```powershell
# Criar branch de desenvolvimento
git checkout -b desenvolvimento

# Trabalhar na branch dev
git add .
git commit -m "Feature X"
git push origin desenvolvimento

# Quando estiver estável, merge para main
git checkout main
git merge desenvolvimento
git push origin main
```

---

### 3. .gitignore Adicional

Se precisar ignorar mais coisas, edite `.gitignore`:

```
# Adicionar ao .gitignore
*.tmp
teste/
rascunho.md
```

---

## 🚀 DEPOIS DE CONFIGURAR

1. **Backup diário:**
   ```powershell
   .\auto-backup-and-push.ps1 "Trabalho do dia"
   ```

2. **Ver histórico:**
   ```powershell
   git log --oneline
   ```

3. **Ver diferenças:**
   ```powershell
   git diff
   ```

4. **Desfazer mudanças:**
   ```powershell
   git checkout -- arquivo.js
   ```

---

## 📞 COMANDOS RÁPIDOS

```powershell
# Status
git status

# Ver remote
git remote -v

# Ver branches
git branch -a

# Pull (baixar do GitHub)
git pull

# Push (enviar para GitHub)
git push

# Ver histórico
git log --oneline --graph --all

# Backup + Push automático
.\auto-backup-and-push.ps1 "Mensagem"
```

---

## 🎉 PRONTO!

Depois de seguir este guia, seu projeto estará:

✅ Versionado com Git  
✅ Sincronizado com GitHub  
✅ Com backups automáticos  
✅ Protegido contra perda de dados  
✅ Pronto para colaboração (se quiser)  

**Seus dados agora estão seguros na nuvem!** ☁️

---

**Criado por:** Cascade AI Assistant  
**Data:** 2025-11-15  
**Status:** ✅ GUIA COMPLETO
