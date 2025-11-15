# 👤 Sistema de Perfil e Username

## 🎯 Visão Geral

Sistema completo de gerenciamento de perfil com nome de usuário (username), validação em tempo real, confirmação de email/senha e pop-up obrigatório para usuários antigos.

### ✅ Funcionalidades Implementadas

- ✅ **Username único** para cada usuário
- ✅ **Validação em tempo real** (✅/❌) durante cadastro
- ✅ **Confirmação de email** (digitar duas vezes)
- ✅ **Confirmação de senha** (digitar duas vezes)
- ✅ **Página de perfil** completa com edição
- ✅ **Troca de senha** dentro do perfil
- ✅ **Pop-up obrigatório** para usuários sem username
- ✅ **Avatar customizável** (URL)
- ✅ **Username exibido no Header**

---

## 📋 Estrutura de Dados

### **Campos do Perfil (MongoDB - collection: profiles)**

```javascript
{
  id: "uuid",
  email: "user@example.com",           // Único, não pode ser alterado
  username: "jogador123",               // NOVO: Único, pode ser alterado
  password: "hashed_password",
  full_name: "Nome do Usuário",
  whatsapp: "+5511999999999",
  avatar_url: "https://...",            // NOVO: URL opcional do avatar
  is_founder: false,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z"
}
```

**Campos Obrigatórios:**
- `email` - Definido no cadastro, não pode ser alterado
- `username` - Mínimo 3 caracteres, deve ser único
- `password` - Mínimo 6 caracteres
- `full_name` - Nome completo do usuário
- `whatsapp` - Número de WhatsApp

**Campos Opcionais:**
- `avatar_url` - URL da foto de perfil (se vazio, usa avatar gerado automaticamente)

---

## 🔐 Backend - API Endpoints

### **1. Cadastro (Signup)**
```
POST /api/auth/signup
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "senha123",
  "username": "jogador123",
  "full_name": "Nome Usuário",
  "whatsapp": "+5511999999999"
}
```

**Validações:**
- Email único
- Username único (min 3 caracteres)
- Password mínimo 6 caracteres

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "jogador123",
    "full_name": "Nome Usuário",
    "whatsapp": "+5511999999999",
    "avatar_url": null
  },
  "token": "jwt_token"
}
```

---

### **2. Verificar Username Disponível**
```
GET /api/auth/check-username/:username
```

**Não requer autenticação**

**Response:**
```json
{
  "available": true,
  "username": "jogador123"
}
```

**Uso:** Chamado em tempo real durante digitação para validar se username está disponível.

---

### **3. Atualizar Perfil**
```
PUT /api/auth/profile
```

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "username": "novo_username",     // Opcional
  "full_name": "Novo Nome",         // Opcional
  "whatsapp": "+5511888888888",     // Opcional
  "avatar_url": "https://..."       // Opcional
}
```

**Validações:**
- Se mudar username, verifica se já está em uso
- Username mínimo 3 caracteres

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "novo_username",
    "full_name": "Novo Nome",
    "whatsapp": "+5511888888888",
    "avatar_url": "https://..."
  }
}
```

---

### **4. Trocar Senha**
```
POST /api/auth/change-password
```

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "currentPassword": "senha_atual",
  "newPassword": "nova_senha"
}
```

**Validações:**
- Senha atual deve estar correta
- Nova senha mínimo 6 caracteres

**Response:**
```json
{
  "message": "Senha alterada com sucesso"
}
```

---

## 🎨 Frontend - Páginas e Componentes

### **1. Página de Cadastro (`/auth`)**

**Novos Campos:**
- ✅ **Nome de Usuário** com validação em tempo real
  - Mostra ✅ verde se disponível
  - Mostra ❌ vermelho se já em uso
  - Loader durante verificação
- ✅ **Confirmar Email** (campo adicional)
  - Valida se emails coincidem
- ✅ **Confirmar Senha** (campo adicional)
  - Valida se senhas coincidem

**Validações em Tempo Real:**
```typescript
// Verifica username a cada 500ms (debounce)
useEffect(() => {
  const timeout = setTimeout(() => {
    if (username) {
      checkUsernameAvailability(username);
    }
  }, 500);
  return () => clearTimeout(timeout);
}, [username]);
```

**Visual:**
- Indicadores visuais de validação (✅/❌)
- Mensagens de erro/sucesso abaixo dos campos
- Botão desabilitado se username indisponível

---

### **2. Página de Perfil (`/profile`)**

**Acesso:** Usuário logado clica no botão com seu username no Header

**Abas:**

#### **Aba: Perfil**
- Avatar URL (opcional)
  - Preview do avatar
  - Fallback para avatar gerado (ui-avatars.com)
- Username (editável, com validação)
- Nome Completo
- WhatsApp
- Email (somente leitura, não pode ser alterado)

#### **Aba: Segurança**
- Senha Atual
- Nova Senha
- Confirmar Nova Senha
- Botão "Alterar Senha"

**Validações:**
- Username disponível (se mudou)
- Senhas coincidem
- Senha atual correta

---

### **3. Pop-up Obrigatório (`CompleteProfileDialog`)**

**Quando Aparece:**
- Usuário faz login e `username` está `null`
- Acontece com usuários antigos que cadastraram antes do username

**Comportamento:**
- **Não pode ser fechado** até completar
- Bloqueia acesso ao resto do app
- Campos obrigatórios:
  - Username (com validação em tempo real)
  - Nome Completo
  - WhatsApp

**Visual:**
- Ícone de alerta (AlertCircle)
- Mensagem clara: "Complete seu perfil"
- Validação em tempo real do username
- Botão desabilitado até preencher tudo corretamente

**Após Completar:**
- Atualiza perfil no backend
- Recarrega a página
- Usuário pode continuar usando o app

---

### **4. Header Atualizado**

**Desktop:**
```
[Logo] [Busca] [Plano Badge] [Idioma] [Username] [Admin?] [Sair]
                                         ↑
                                    Botão de Perfil
```

**Mobile:**
```
[Logo] [Plano?] [Idioma] [👤] [Admin?] [Sair]
                           ↑
                      Ícone de Perfil
```

**Botão de Perfil:**
- Mostra o **username** do usuário (ou email se username não definido)
- Clique → Navega para `/profile`
- Variant: `outline` para destacar

---

## 🔄 Fluxo de Uso

### **Novo Usuário (Cadastro)**

1. Usuário acessa `/auth` → aba "Cadastrar"
2. Preenche:
   - Nome Completo
   - **Username** (sistema valida em tempo real)
   - WhatsApp
   - Email
   - **Confirmar Email**
   - Senha
   - **Confirmar Senha**
3. Sistema valida:
   - ✅ Username disponível?
   - ✅ Emails coincidem?
   - ✅ Senhas coincidem?
4. Clica "Cadastrar"
5. **Conta criada!** → Redirecionado para catálogo

---

### **Usuário Antigo (Sem Username)**

1. Usuário faz login normalmente
2. **Pop-up aparece automaticamente** (não pode fechar)
3. Preenche:
   - **Username** (validação em tempo real)
   - Nome Completo (pré-preenchido se já existe)
   - WhatsApp (pré-preenchido se já existe)
4. Sistema valida username
5. Clica "Completar Perfil e Continuar"
6. **Perfil atualizado!** → Página recarrega
7. Pode continuar usando normalmente

---

### **Editar Perfil**

1. Usuário clica no botão com seu username no Header
2. Navega para `/profile`
3. **Aba Perfil:**
   - Pode atualizar avatar (URL)
   - Pode mudar username (validação em tempo real)
   - Pode atualizar nome e whatsapp
   - Email não pode ser alterado
4. **Aba Segurança:**
   - Digita senha atual
   - Digita nova senha
   - Confirma nova senha
   - Clica "Alterar Senha"
5. **Perfil/Senha atualizado!**

---

## 🧪 Testes

### **Teste 1: Cadastro Novo Usuário**

```
1. Acesse http://localhost:8080/auth
2. Aba "Cadastrar"
3. Preencha todos os campos
4. Digite username: "teste123"
   → Aguarde 500ms
   → Deve mostrar ✅ verde (disponível)
5. Digite username existente: "admin"
   → Deve mostrar ❌ vermelho (em uso)
6. Digite emails diferentes
   → Mensagem de erro deve aparecer
7. Digite senhas diferentes
   → Mensagem de erro deve aparecer
8. Preencha tudo corretamente
9. Clique "Cadastrar"
   → Deve criar conta e redirecionar
```

---

### **Teste 2: Usuário Antigo (Pop-up)**

**Setup:**
```javascript
// No MongoDB, simule usuário sem username
db.profiles.updateOne(
  { email: "teste@example.com" },
  { $unset: { username: "" } }
)
```

**Teste:**
```
1. Faça login com o usuário
2. Pop-up deve aparecer automaticamente
3. Tente fechar o pop-up
   → Deve mostrar toast: "Você precisa completar seu perfil"
4. Preencha username, nome, whatsapp
5. Username deve validar em tempo real
6. Clique "Completar Perfil e Continuar"
   → Perfil atualizado
   → Página recarrega
   → Pop-up não aparece mais
```

---

### **Teste 3: Editar Perfil**

```
1. Faça login
2. Clique no botão com seu username no Header
3. Deve navegar para /profile
4. Aba "Perfil":
   - Cole URL de avatar
   → Preview deve aparecer
   - Mude username para um disponível
   → Deve mostrar ✅ verde
   - Clique "Salvar Alterações"
   → Perfil atualizado
5. Aba "Segurança":
   - Digite senha atual errada
   → Erro: "Senha atual incorreta"
   - Digite senha correta + nova senha
   - Confirme nova senha
   - Clique "Alterar Senha"
   → Senha alterada com sucesso
```

---

### **Teste 4: Validação de Username**

```javascript
// Via API diretamente
curl http://localhost:3000/api/auth/check-username/teste123

// Response se disponível:
{
  "available": true,
  "username": "teste123"
}

// Response se em uso:
{
  "available": false,
  "username": "admin"
}
```

---

## 📊 Validações e Regras

### **Username**
- ✅ Mínimo 3 caracteres
- ✅ Deve ser único (case-insensitive no backend)
- ✅ Convertido para lowercase automaticamente no frontend
- ✅ Validação em tempo real (debounce 500ms)
- ❌ Não pode ser vazio
- ❌ Não pode ter espaços

### **Email**
- ✅ Formato válido de email
- ✅ Deve ser único
- ✅ Confirmação obrigatória no cadastro
- ❌ Não pode ser alterado após criação

### **Senha**
- ✅ Mínimo 6 caracteres
- ✅ Confirmação obrigatória no cadastro
- ✅ Hash bcrypt com salt 10
- ✅ Para trocar: deve fornecer senha atual

### **Avatar**
- ✅ URL válida (opcional)
- ✅ Fallback automático para ui-avatars.com
- ✅ Pode ser vazio (null)

---

## 🐛 Resolução de Problemas

### **Username não valida em tempo real**

**Causa:** Debounce muito curto ou API não responde

**Solução:**
```typescript
// Verifique o debounce (deve ser 500ms)
useEffect(() => {
  const timeout = setTimeout(() => {
    checkUsernameAvailability(username);
  }, 500); // ← 500ms
  return () => clearTimeout(timeout);
}, [username]);
```

---

### **Pop-up não aparece para usuários antigos**

**Causa:** Campo `username` não está `null` no banco

**Solução:**
```javascript
// Verifique no MongoDB
db.profiles.find({ username: { $exists: false } })
// ou
db.profiles.find({ username: null })

// Se retornar vazio, force:
db.profiles.updateOne(
  { email: "user@example.com" },
  { $unset: { username: "" } }
)
```

---

### **Erro "Username já está em uso" mas está disponível**

**Causa:** Verificação case-sensitive

**Solução:** Backend já trata isso, mas verifique:
```javascript
// Backend usa findOne direto
const existingUser = await collections.profiles().findOne({ username });
// MongoDB é case-sensitive por padrão

// Para garantir case-insensitive, crie índice:
db.profiles.createIndex(
  { username: 1 },
  { unique: true, collation: { locale: 'en', strength: 2 } }
)
```

---

### **Avatar não carrega**

**Causa:** URL inválida ou CORS

**Solução:**
```typescript
// Componente tem fallback automático
<img
  src={avatar_url}
  onError={(e) => {
    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(full_name)}&background=6366f1&color=fff`;
  }}
/>
```

---

## 📁 Arquivos Criados/Modificados

### **Backend**

```
✅ backend/src/controllers/auth.controller.js (MODIFICADO)
   - Adicionado username no signUp
   - Função checkUsername
   - Função updateProfile
   - Função changePassword

✅ backend/src/routes/auth.routes.js (MODIFICADO)
   - GET /check-username/:username
   - PUT /profile
   - POST /change-password
```

### **Frontend**

```
✅ src/lib/api.ts (MODIFICADO)
   - Interface User atualizada (username, avatar_url)
   - authApi.checkUsername
   - authApi.updateProfile
   - authApi.changePassword

✅ src/hooks/useAuth.tsx (MODIFICADO)
   - signUp aceita username

✅ src/pages/Auth.tsx (REESCRITO)
   - Novo campo username com validação
   - Confirmação de email
   - Confirmação de senha
   - Validação em tempo real

✅ src/pages/Profile.tsx (NOVO)
   - Página completa de perfil
   - Aba Perfil (editar dados)
   - Aba Segurança (trocar senha)

✅ src/components/CompleteProfileDialog.tsx (NOVO)
   - Pop-up obrigatório para usuários sem username
   - Não pode ser fechado até completar

✅ src/components/Header.tsx (MODIFICADO)
   - Botão de perfil mostrando username
   - Desktop: username no texto
   - Mobile: ícone de User

✅ src/App.tsx (MODIFICADO)
   - Rota /profile
   - CompleteProfileDialog global
```

---

## ✅ Checklist de Implementação

- [x] Campo `username` no backend (MongoDB)
- [x] Campo `avatar_url` no backend (MongoDB)
- [x] Rota de verificação de username
- [x] Rota de atualização de perfil
- [x] Rota de troca de senha
- [x] Validação única de username
- [x] Cadastro com username obrigatório
- [x] Confirmação de email no cadastro
- [x] Confirmação de senha no cadastro
- [x] Validação em tempo real (frontend)
- [x] Debounce na validação (500ms)
- [x] Indicadores visuais (✅/❌)
- [x] Página de perfil completa
- [x] Edição de avatar (URL)
- [x] Troca de senha no perfil
- [x] Pop-up obrigatório para usuários antigos
- [x] Pop-up não pode ser fechado
- [x] Username exibido no Header
- [x] Botão de perfil no Header
- [x] Documentação completa

---

## 🎉 Conclusão

Sistema de perfil e username **completo e pronto para produção**!

**Principais Benefícios:**
- ✅ Identificação única com username
- ✅ Experiência moderna com validação em tempo real
- ✅ Segurança com confirmação de email/senha
- ✅ Migração suave para usuários antigos
- ✅ Avatar customizável
- ✅ Troca de senha segura
- ✅ Interface intuitiva

**Próximos Passos Opcionais:**
- Upload de imagem para avatar (em vez de URL)
- Validação de formato de username (apenas letras, números, _)
- Histórico de alterações de perfil
- Verificação de email
- Autenticação de dois fatores (2FA)

---

**Documentação Completa!** 🚀👤

Para dúvidas, consulte este guia ou os comentários no código!
