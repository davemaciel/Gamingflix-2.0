# 🎮 Guia do Painel Admin - Gerenciamento de Usuários e Assinaturas

## 📋 Visão Geral

O painel administrativo agora possui **gerenciamento completo de usuários e assinaturas**, com:

- ✅ **Listar todos os usuários** cadastrados
- ✅ **Editar informações** de usuários (email, nome, whatsapp)
- ✅ **Gerenciar roles** (Admin/Cliente)
- ✅ **Tornar usuário Founder** (acesso vitalício)
- ✅ **Criar assinaturas** para usuários
- ✅ **Renovar assinaturas** existentes
- ✅ **Cancelar assinaturas**
- ✅ **Deletar usuários** (remove todos os dados relacionados)
- ✅ **Expiração automática** de assinaturas (verifica a cada 1 hora)

---

## 🚀 Como Acessar

1. Faça login com uma conta **Admin**
2. Acesse `/admin`
3. Clique na aba **"Usuários"**

---

## 👥 Gerenciar Usuários

### 📝 **Visualizar Usuários**

A lista mostra:
- Nome completo
- Email
- WhatsApp
- Role (Admin/Cliente)
- Status Founder
- Status da assinatura (Ativa/Inativa)
- Data de expiração da assinatura

### ✏️ **Editar Usuário**

1. Clique em **"Editar"** no card do usuário
2. Atualize:
   - Email
   - Nome completo
   - WhatsApp
   - Marcar/Desmarcar **Founder**
3. Clique em **"Salvar"**

**Founder:** Usuários marcados como Founder têm acesso vitalício a todos os jogos, independente de assinatura.

### 🛡️ **Gerenciar Roles**

- Clique em **"Tornar Admin"** para promover um cliente a administrador
- Clique em **"Remover Admin"** para rebaixar um admin para cliente

**⚠️ Atenção:** Admins têm acesso total ao painel administrativo!

### 🗑️ **Deletar Usuário**

1. Clique em **"Deletar"**
2. Confirme a ação
3. Todos os dados serão removidos:
   - Perfil do usuário
   - Assinaturas
   - Seleções de jogos
   - Roles

**⚠️ Importante:** Você não pode deletar sua própria conta!

---

## 💳 Gerenciar Assinaturas

### ➕ **Criar Assinatura**

Para usuários **sem assinatura ativa**:

1. Clique em **"Criar Assinatura"**
2. Selecione o **plano**
3. Defina a **duração em meses**
4. Clique em **"Criar Assinatura"**

A assinatura será criada automaticamente e:
- Status: `active`
- Data de início: Agora
- Data de expiração: Calculada automaticamente
- Qualquer assinatura anterior será cancelada

### 🔄 **Renovar Assinatura**

Para usuários **com assinatura ativa**:

1. Clique em **"Renovar"**
2. Digite quantos meses deseja adicionar
3. A data de expiração será estendida

**Exemplo:**
- Assinatura expira em: **31/12/2025**
- Renovar por: **3 meses**
- Nova expiração: **31/03/2026**

### ❌ **Cancelar Assinatura**

1. Clique em **"Cancelar Assinatura"**
2. Confirme a ação
3. O status mudará para `cancelled`
4. O usuário perderá acesso aos jogos

---

## ⚙️ Funcionamento Automático

### 🕐 **Verificação de Expiração**

O sistema **verifica automaticamente** a cada **1 hora** se há assinaturas expiradas:

- Assinaturas com `expires_at` no passado são marcadas como `expired`
- Usuários perdem acesso aos jogos automaticamente
- Founders **nunca perdem acesso** (acesso vitalício)

### 📊 **Logs**

Todas as ações são registradas nos logs do backend:
```
info: Subscription created for user abc123: plan premium, expires 2025-12-31
info: Subscription renewed for user abc123: new expiration 2026-03-31
info: Subscription cancelled for user abc123
info: Expired 5 subscription(s)
```

---

## 🔐 Permissões

### **Admin**
- ✅ Ver todos os usuários
- ✅ Editar qualquer usuário
- ✅ Gerenciar roles
- ✅ Criar/renovar/cancelar assinaturas
- ✅ Deletar usuários (exceto a si mesmo)

### **Cliente**
- ❌ Não tem acesso ao painel admin
- ✅ Pode ver apenas seus próprios dados

---

## 📡 API Endpoints (Backend)

### **Usuários**
```
GET    /api/users              - Listar todos
GET    /api/users/:id          - Buscar específico
PUT    /api/users/:id          - Atualizar dados
PUT    /api/users/:id/role     - Atualizar role
DELETE /api/users/:id          - Deletar usuário
```

### **Assinaturas (via usuários)**
```
POST   /api/users/:id/subscription        - Criar assinatura
DELETE /api/users/:id/subscription        - Cancelar assinatura
PUT    /api/users/:id/subscription/renew  - Renovar assinatura
```

**⚠️ Todas as rotas requerem autenticação de Admin!**

---

## 🧪 Como Testar

### **1. Criar uma Assinatura**
```bash
# Via painel admin
1. Vá para aba "Usuários"
2. Clique em "Criar Assinatura" em um usuário
3. Selecione plano e duração
4. Confirme
```

### **2. Verificar Expiração Automática**
```bash
# Opção 1: Esperar 1 hora
# Opção 2: Reiniciar o backend para forçar verificação imediata

# No MongoDB, altere manualmente expires_at para o passado:
db.subscriptions.updateOne(
  { user_id: "abc123" },
  { $set: { expires_at: new Date("2020-01-01") } }
)

# Aguarde até 1 hora ou reinicie o backend
# A assinatura mudará para status "expired"
```

### **3. Testar Acesso**
```bash
# Com assinatura ativa: Usuário vê todos os jogos
# Com assinatura expirada: Usuário não vê jogos (exceto se for Founder)
# Founder: Sempre vê todos os jogos
```

---

## 🎯 Casos de Uso

### **Caso 1: Novo Cliente Pagou**
1. Cliente se cadastrou no site
2. Admin recebe notificação de pagamento
3. Admin vai ao painel
4. Cria assinatura para o cliente
5. Cliente recebe acesso imediato aos jogos

### **Caso 2: Renovação Manual**
1. Cliente esqueceu de renovar automaticamente
2. Admin identifica assinatura prestes a expirar
3. Admin renova manualmente por mais meses
4. Cliente mantém acesso sem interrupção

### **Caso 3: Founder VIP**
1. Cliente especial merece acesso vitalício
2. Admin edita o usuário
3. Marca como "Founder"
4. Cliente tem acesso perpétuo, mesmo sem assinatura

### **Caso 4: Cancelamento**
1. Cliente solicitou reembolso
2. Admin cancela a assinatura
3. Cliente perde acesso imediatamente

---

## 🐛 Resolução de Problemas

### **Assinatura não expira automaticamente**
- Verifique os logs: `Subscription checker started`
- Confirme que o backend está rodando continuamente
- O intervalo é de 1 hora, aguarde

### **Não consigo deletar usuário**
- Você está tentando deletar sua própria conta? (bloqueado)
- Verifique se sua conta é Admin

### **Usuário não vê jogos mesmo com assinatura ativa**
- Verifique se `expires_at` está no futuro
- Confirme que `status` é `active`
- Verifique os logs do backend

---

## 📚 Estrutura de Dados

### **User (Profile)**
```javascript
{
  id: "uuid",
  email: "user@example.com",
  full_name: "Nome do Usuário",
  whatsapp: "+5511999999999",
  is_founder: false,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z"
}
```

### **User Role**
```javascript
{
  id: "uuid",
  user_id: "user-uuid",
  role: "admin" | "client",
  created_at: "2025-01-01T00:00:00Z"
}
```

### **Subscription**
```javascript
{
  id: "uuid",
  user_id: "user-uuid",
  plan_id: "plan-uuid",
  status: "active" | "cancelled" | "expired",
  started_at: "2025-01-01T00:00:00Z",
  expires_at: "2026-01-01T00:00:00Z", // null = vitalício
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z"
}
```

---

## ✅ Checklist de Implementação

- [x] Controller de usuários no backend
- [x] Rotas protegidas com middleware admin
- [x] API de gerenciamento de assinaturas
- [x] Serviço de verificação automática de expiração
- [x] Interface de gerenciamento no frontend
- [x] Abas no painel admin (Jogos | Usuários)
- [x] Busca de usuários por email/nome
- [x] Dialogs de edição e criação
- [x] Badges de status (Admin, Founder, Assinatura)
- [x] Confirmações de ações destrutivas
- [x] Toast notifications
- [x] Documentação completa

---

## 🎉 Conclusão

O sistema de gerenciamento está **completo e pronto para uso em produção**!

Principais benefícios:
- ✅ Controle total sobre usuários
- ✅ Gerenciamento flexível de assinaturas
- ✅ Expiração automática
- ✅ Interface intuitiva
- ✅ Logs detalhados
- ✅ Segurança robusta

**Qualquer dúvida, consulte este guia ou os logs do backend!** 🚀
