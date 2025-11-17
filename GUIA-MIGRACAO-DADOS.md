# 🔄 Migração de Dados: MongoDB Local → Atlas

## 📋 SITUAÇÃO

Você tem:
- ✅ **MongoDB Local** (localhost:27017) = COM jogos e dados
- ❌ **MongoDB Atlas** (cloud) = VAZIO

**Precisamos:** Copiar os dados do Local para o Atlas!

---

## 🚀 OPÇÃO 1: Script Automático (RECOMENDADO)

### **Pré-requisitos:**

1. ✅ MongoDB Local rodando
2. ✅ MongoDB Atlas configurado
3. ✅ IP 0.0.0.0/0 liberado no Atlas

### **Executar Migração:**

```bash
npm run migrate:local-to-atlas
```

### **O que o script faz:**

1. Conecta no MongoDB Local
2. Conecta no MongoDB Atlas
3. Copia todas as collections:
   - games
   - profiles
   - subscriptions
   - subscription_plans
   - user_game_selections
   - user_roles
4. Mostra relatório final

### **Saída esperada:**

```
🚀 Iniciando migração de dados...

📦 Conectando ao MongoDB Local...
✅ Conectado ao MongoDB Local

☁️  Conectando ao MongoDB Atlas...
✅ Conectado ao MongoDB Atlas

📂 Collections encontradas no local: games, profiles, subscriptions

📋 Migrando collection: games
   📊 150 documentos encontrados
   ✅ 150 documentos migrados com sucesso!

📋 Migrando collection: profiles
   📊 25 documentos encontrados
   ✅ 25 documentos migrados com sucesso!

🎉 Migração concluída com sucesso!

📊 RESUMO:
   games: 150 documentos
   profiles: 25 documentos
   subscriptions: 10 documentos
```

---

## 🐛 TROUBLESHOOTING

### ❌ "Error: connect ECONNREFUSED"

**Causa:** MongoDB local não está rodando

**Solução:**
```bash
# Windows - Inicie o MongoDB
net start MongoDB
```

### ❌ "MongoNetworkError: connection timeout"

**Causa:** IP não liberado no Atlas

**Solução:**
1. MongoDB Atlas → Network Access
2. Add IP: 0.0.0.0/0
3. Aguarde ficar Active

### ❌ "Authentication failed"

**Causa:** Senha errada no script

**Solução:**
1. Abra: `migrar-local-para-atlas.js`
2. Linha 5, ajuste a connection string:
   ```js
   const ATLAS_URL = 'mongodb+srv://gameflix:SuaSenha@ggflix...';
   ```

---

## 📊 VERIFICAR MIGRAÇÃO

### **No MongoDB Atlas:**

1. Acesse: https://cloud.mongodb.com
2. Database → Browse Collections
3. Selecione database: `gameflix`
4. Veja as collections e documentos

### **No Railway:**

1. Configure as variáveis (se ainda não fez)
2. Aguarde redeploy
3. Acesse o site
4. **Os jogos devem aparecer!** 🎮

---

## ⚠️ IMPORTANTE

### **O script SUBSTITUI os dados no Atlas!**

Se você rodar 2x, vai duplicar os dados apenas se não limpar antes.

O script já limpa automaticamente antes de inserir.

---

## 🎯 CHECKLIST

- [ ] MongoDB Local rodando
- [ ] MongoDB Atlas configurado
- [ ] IP 0.0.0.0/0 liberado
- [ ] Script rodado: `npm run migrate:local-to-atlas`
- [ ] Verificado no Atlas que os dados estão lá
- [ ] Variáveis configuradas no Railway
- [ ] Site recarregado e jogos aparecendo

---

## 💾 BACKUP (Opcional)

### **Antes de migrar, faça backup:**

```bash
# Exportar tudo do local
npm run backup:mongodb
```

Isso vai criar uma pasta `mongodb-backup/` com todos os dados.

---

## ✅ APÓS MIGRAÇÃO

1. **Configure variáveis no Railway** (se ainda não fez)
2. **Aguarde redeploy** (1-2 min)
3. **Recarregue o site**
4. **Veja os jogos aparecerem!** 🎉

---

## 🔧 ALTERNATIVA: MongoDB Compass (GUI)

Se preferir interface visual:

1. Baixe: https://www.mongodb.com/try/download/compass
2. Conecte no Local: `mongodb://localhost:27017`
3. Export collections → JSON
4. Conecte no Atlas
5. Import JSON

---

**Pronto! Seus dados estarão no Atlas e funcionando no Railway!** 🚀
