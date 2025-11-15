# 🚀 Guia Completo: Iniciar Projeto com MongoDB

Este guia explica como rodar o projeto GameFlix usando **MongoDB local** em vez do Supabase.

## 📋 Pré-requisitos

### 1. Node.js
- Versão recomendada: 18.x ou superior
- Download: https://nodejs.org

### 2. MongoDB
Escolha uma das opções:

#### Opção A: MongoDB Community (Instalação Local)
1. Download: https://www.mongodb.com/try/download/community
2. Instale com configurações padrão
3. O serviço inicia automaticamente no Windows

#### Opção B: Docker
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## 🔧 Configuração Inicial

### 1. Verificar se MongoDB está Rodando

```bash
npm run check:mongodb
```

**Se der erro:**
```bash
# Windows
net start MongoDB

# Docker
docker start mongodb
```

### 2. Migrar Dados do Supabase (Primeira vez)

```bash
npm run migrate:supabase-to-mongo
```

Responda **"s"** quando perguntar se quer importar.

### 3. Instalar Dependências

```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

## ▶️ Iniciar o Projeto

### Opção 1: Script Automático (Recomendado)

**Windows:**
```bash
iniciar-projeto.bat
```

Ou clique duas vezes no arquivo `iniciar-projeto.bat`

### Opção 2: Manual

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## 🌐 Acessar o Projeto

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000/api
- **MongoDB:** mongodb://localhost:27017

## 📦 Estrutura do Projeto

```
atendimentozapflix/
├── backend/                 # Backend Node.js + Express + MongoDB
│   ├── src/
│   │   ├── config/         # Configuração MongoDB
│   │   ├── controllers/    # Lógica de negócio
│   │   ├── middleware/     # JWT auth
│   │   ├── routes/         # Rotas da API
│   │   └── index.js        # Servidor principal
│   └── .env                # Variáveis backend
├── src/                     # Frontend React
│   ├── lib/
│   │   └── api.ts          # Cliente API (substitui Supabase)
│   └── hooks/
│       ├── useAuth.tsx     # Autenticação JWT
│       └── useSubscription.tsx
├── .env                     # Variáveis frontend
└── iniciar-projeto.bat      # Script de inicialização
```

## 🔑 Variáveis de Ambiente

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:3000/api
VITE_STEAM_GUARD_API_URL=http://localhost:3000
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=gameflix
```

### Backend (`backend/.env`)
```env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*

# MongoDB
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=gameflix

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Email (Steam Guard)
EMAIL_USER=seu-email@dominio.com
EMAIL_PASSWORD=sua-senha
EMAIL_HOST=mail.dominio.com
EMAIL_PORT=993
EMAIL_TLS=true
```

## 🔐 Primeiro Acesso

### Criar Usuário Admin

1. Cadastre-se normalmente pelo frontend
2. Conecte no MongoDB:
```bash
mongosh
```

3. Promova o usuário a admin:
```javascript
use gameflix

// Encontre o ID do usuário
db.profiles.findOne({ email: "seu@email.com" })

// Adicione role de admin
db.user_roles.insertOne({
  id: crypto.randomUUID(),
  user_id: "ID_DO_USUARIO_AQUI",
  role: "admin",
  created_at: new Date()
})
```

## 📊 Verificar Dados

### Via MongoDB Compass (GUI)
1. Download: https://www.mongodb.com/try/download/compass
2. Conecte: `mongodb://localhost:27017`
3. Navegue pelo banco `gameflix`

### Via Linha de Comando
```bash
mongosh

use gameflix

# Ver estatísticas
db.games.countDocuments()
db.profiles.countDocuments()
db.subscriptions.countDocuments()

# Ver dados
db.games.find().limit(3)
db.profiles.find()
```

## 🔄 Atualizar Dados do Supabase

Para sincronizar dados mais recentes do Supabase:

```bash
npm run migrate:supabase-to-mongo
```

**⚠️ ATENÇÃO:** Isso irá **SOBRESCREVER** todos os dados locais!

## ❓ Problemas Comuns

### ❌ "MongoServerError: connect ECONNREFUSED"
**Solução:** MongoDB não está rodando
```bash
net start MongoDB
```

### ❌ "Error: Cannot find module 'mongodb'"
**Solução:** Instale as dependências
```bash
cd backend
npm install
cd ..
npm install
```

### ❌ "JWT authentication error"
**Solução:** Token expirado. Faça logout e login novamente.

### ❌ Backend não conecta no MongoDB
**Solução:** Verifique o `.env` do backend:
```env
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=gameflix
```

### ⚠️ Catálogo vazio
**Solução:** Execute a migração:
```bash
npm run migrate:supabase-to-mongo
```

## 🛠️ Comandos Úteis

```bash
# Verificar MongoDB
npm run check:mongodb

# Migrar dados do Supabase
npm run migrate:supabase-to-mongo

# Apenas importar (se já exportou antes)
npm run import:mongo-only

# Iniciar frontend
npm run dev

# Iniciar backend
cd backend && npm start

# Build para produção
npm run build
```

## 🔧 Desenvolvimento

### Adicionar Novo Jogo (Admin)

1. Faça login como admin
2. Acesse a página `/admin`
3. Use o formulário para adicionar jogos

### Testar API Diretamente

```bash
# Login
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@email.com","password":"senha"}'

# Listar jogos (precisa do token)
curl http://localhost:3000/api/games \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 📚 Documentação da API

### Autenticação
- `POST /api/auth/signup` - Cadastro
- `POST /api/auth/signin` - Login
- `GET /api/auth/me` - Dados do usuário
- `GET /api/auth/role` - Verificar se é admin

### Jogos
- `GET /api/games` - Listar todos
- `GET /api/games/:id` - Um jogo específico
- `POST /api/games` - Criar (admin)
- `PUT /api/games/:id` - Atualizar (admin)
- `DELETE /api/games/:id` - Deletar (admin)

### Assinaturas
- `GET /api/subscriptions/me` - Minha assinatura
- `GET /api/subscriptions/founder` - Status founder
- `GET /api/subscriptions/plans` - Planos disponíveis
- `GET /api/subscriptions/games` - Meus jogos selecionados
- `POST /api/subscriptions/games` - Adicionar jogo
- `DELETE /api/subscriptions/games/:id` - Remover jogo

Todas as rotas (exceto signup/signin) requerem header:
```
Authorization: Bearer TOKEN_JWT
```

## 🔒 Segurança

### Produção

1. **Altere o JWT_SECRET:**
```env
JWT_SECRET=gere-um-secret-seguro-aqui-use-uuid-por-exemplo
```

2. **Configure CORS apropriadamente:**
```env
CORS_ORIGIN=https://seu-dominio.com
```

3. **Use HTTPS no frontend**

4. **Configure MongoDB com autenticação:**
```env
MONGODB_URL=mongodb://usuario:senha@host:27017/gameflix?authSource=admin
```

## 📝 Notas Importantes

- ✅ Supabase foi **removido** completamente
- ✅ Autenticação usa **JWT** (token no localStorage)
- ✅ Dados ficam no **MongoDB local**
- ✅ Backend em **Node.js + Express**
- ✅ Frontend continua em **React + Vite**

## 🤝 Suporte

Se encontrar problemas:
1. Verifique se MongoDB está rodando: `npm run check:mongodb`
2. Verifique os logs do backend (na janela do terminal)
3. Verifique o console do navegador (F12)
4. Confirme que migrou os dados: `npm run migrate:supabase-to-mongo`
