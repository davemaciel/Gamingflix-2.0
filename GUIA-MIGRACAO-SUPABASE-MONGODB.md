# 🔄 Guia de Migração: Supabase → MongoDB Local

Este guia mostra como migrar seus dados do Supabase Cloud para MongoDB local **SEM precisar de plano pago**.

## 📋 Pré-requisitos

### 1. MongoDB Instalado Localmente

**Windows:**
- Baixe em: https://www.mongodb.com/try/download/community
- Instale com configurações padrão
- Ou use Docker: `docker run -d -p 27017:27017 --name mongodb mongo:latest`

**Verificar se MongoDB está rodando:**
```bash
# Windows (PowerShell)
Get-Service -Name MongoDB

# Ou teste a conexão
mongosh --eval "db.version()"
```

### 2. Instalar Dependências

```bash
npm install
```

Isso instalará o driver `mongodb` necessário para a migração.

## 🚀 Como Usar

### Opção 1: Exportar e Importar em um único comando

```bash
npm run migrate:supabase-to-mongo
```

Este comando irá:
1. ✅ Conectar ao seu Supabase Cloud
2. ✅ Exportar todas as tabelas para arquivos JSON (na pasta `supabase-export/`)
3. ✅ Perguntar se você quer importar para o MongoDB
4. ✅ Importar os dados no MongoDB local

### Opção 2: Apenas Exportar (sem importar)

Se você quiser apenas exportar os dados para conferir primeiro:

```bash
node export-supabase-to-mongodb.js
```

Depois responda **"n"** quando perguntar se quer importar.

### Opção 3: Importar de arquivos já exportados

Se você já exportou antes e quer re-importar:

```bash
npm run import:mongo-only
```

## 📊 Tabelas Migradas

O script migra automaticamente estas tabelas:

- ✅ **games** - Catálogo de jogos
- ✅ **profiles** - Perfis de usuários
- ✅ **subscription_plans** - Planos de assinatura
- ✅ **subscriptions** - Assinaturas dos usuários
- ✅ **user_game_selections** - Jogos selecionados pelos usuários
- ✅ **user_roles** - Roles/Permissões dos usuários

## 📁 Estrutura de Arquivos

Após a exportação, você terá:

```
supabase-export/
├── games.json                  (Todos os jogos)
├── profiles.json               (Perfis)
├── subscription_plans.json     (Planos)
├── subscriptions.json          (Assinaturas)
├── user_game_selections.json   (Seleções)
├── user_roles.json             (Roles)
└── _export_summary.json        (Resumo da exportação)
```

## 🔧 Configuração

As configurações estão no arquivo `.env`:

```env
# Supabase (já configurado)
VITE_SUPABASE_URL="https://rtyrmkniabujabcwbcnh.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="sua-chave-service-role"

# MongoDB Local
MONGODB_URL="mongodb://localhost:27017"
MONGODB_DB_NAME="gameflix"
```

### Alterar Configurações do MongoDB

Se seu MongoDB estiver em outra porta ou com autenticação:

```env
# Com autenticação
MONGODB_URL="mongodb://usuario:senha@localhost:27017"

# Outro banco de dados
MONGODB_DB_NAME="meu_catalogo"

# Outro host/porta
MONGODB_URL="mongodb://192.168.1.100:27018"
```

## 🔍 Verificar Dados no MongoDB

### Usando MongoDB Compass (GUI)
1. Baixe: https://www.mongodb.com/try/download/compass
2. Conecte em: `mongodb://localhost:27017`
3. Abra o banco `gameflix`

### Usando mongosh (CLI)
```bash
mongosh

use gameflix
db.games.countDocuments()
db.games.findOne()
```

## ❓ Problemas Comuns

### ❌ "MongoServerError: connect ECONNREFUSED"
**Solução:** MongoDB não está rodando
```bash
# Windows
net start MongoDB
# Ou inicie o serviço do MongoDB manualmente
```

### ❌ "Error: Cannot find module 'mongodb'"
**Solução:** Instale as dependências
```bash
npm install
```

### ❌ "Authentication failed"
**Solução:** Verifique suas credenciais do Supabase no `.env`

### ⚠️ "Nenhum registro encontrado em [tabela]"
**Normal:** Algumas tabelas podem estar vazias se não tiver dados ainda.

## 📝 Exemplo de Uso Completo

```bash
# 1. Certifique-se que MongoDB está rodando
mongosh --eval "db.version()"

# 2. Execute a migração
npm run migrate:supabase-to-mongo

# 3. Aguarde a exportação (pode demorar alguns minutos)
# Você verá algo como:
# 📥 Exportando tabela: games...
#    ✓ Página 1: 50 registros
# ✅ Exportado 50 registros para supabase-export/games.json

# 4. Quando perguntar se quer importar, digite: s
# ❓ Deseja importar os dados para o MongoDB agora? (s/n): s

# 5. Verifique os dados
mongosh
> use gameflix
> db.games.countDocuments()
```

## 🎯 Próximos Passos

Após a migração, você pode:

1. **Configurar o backend para usar MongoDB** ao invés de Supabase
2. **Manter ambos** (Supabase para produção, MongoDB para dev local)
3. **Criar backups regulares** dos dados do MongoDB

## 💾 Backup dos Dados MongoDB

```bash
# Backup
mongodump --db gameflix --out ./mongodb-backup

# Restore
mongorestore --db gameflix ./mongodb-backup/gameflix
```

## 🔄 Atualizar Dados

Para atualizar os dados do MongoDB com as últimas alterações do Supabase:

```bash
npm run migrate:supabase-to-mongo
```

**⚠️ ATENÇÃO:** Isso irá **SUBSTITUIR** todos os dados no MongoDB!

## 📞 Suporte

Se tiver problemas:
1. Verifique se o MongoDB está rodando
2. Confirme as credenciais do Supabase no `.env`
3. Veja os logs de erro para mais detalhes
