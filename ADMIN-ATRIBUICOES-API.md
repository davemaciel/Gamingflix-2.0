# 📋 API de Gerenciamento de Atribuições

## Novas Funcionalidades Implementadas

---

## 🔵 APIs do Usuário

### 1️⃣ Cancelar Meu Perfil

**Endpoint:** `DELETE /api/streaming/services/:serviceId/cancel-my-profile`

**Autenticação:** Requer token JWT do usuário

**Descrição:** Permite que o usuário cancele/desvincu seu próprio perfil de streaming, devolvendo-o ao estoque.

**Resposta:**
```json
{
  "message": "Perfil cancelado com sucesso"
}
```

**Exemplo de uso:**
```javascript
// Cancelar perfil Netflix
const response = await fetch('/api/streaming/services/netflix-id/cancel-my-profile', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${userToken}`
  }
});
const result = await response.json();
```

**Exemplo no Frontend:**
```jsx
function CancelProfileButton({ serviceId }) {
  const handleCancel = async () => {
    if (!confirm('Deseja realmente cancelar seu perfil? Você perderá o acesso imediatamente.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/streaming/services/${serviceId}/cancel-my-profile`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      alert('Perfil cancelado com sucesso!');
      window.location.reload(); // Recarregar página
    } catch (error) {
      alert('Erro ao cancelar perfil');
    }
  };
  
  return (
    <button onClick={handleCancel} className="btn-danger">
      ❌ Cancelar Meu Perfil
    </button>
  );
}
```

---

## 🔴 APIs do Admin

### 1️⃣ Listar Perfis Atribuídos

**Endpoint:** `GET /api/streaming/services/:serviceId/assigned-profiles`

**Autenticação:** Requer token JWT de Admin

**Descrição:** Lista todos os perfis atribuídos de um serviço específico com informações do usuário e data de expiração.

**Resposta:**
```json
[
  {
    "id": "profile-uuid",
    "profile_name": "user1",
    "email": "netflix@gamingflix.com",
    "password": "senha123",
    "pin": "3211",
    "status": "assigned",
    "assigned_to": "user-uuid",
    "assigned_at": "2025-11-20T14:00:00.000Z",
    "user": {
      "id": "user-uuid",
      "email": "cliente@email.com",
      "full_name": "Nome do Cliente"
    },
    "assignment_info": {
      "assigned_at": "2025-11-20T14:00:00.000Z",
      "expiration_date": "2025-12-20T14:00:00.000Z",
      "days_remaining": 28,
      "is_expired": false
    }
  }
]
```

**Exemplo de uso:**
```javascript
// Listar perfis Netflix atribuídos
const response = await fetch('/api/streaming/services/netflix-id/assigned-profiles', {
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
});
const assignedProfiles = await response.json();
```

---

### 2️⃣ Desvincular Perfil Manualmente

**Endpoint:** `DELETE /api/streaming/profiles/:profileId/unassign`

**Autenticação:** Requer token JWT de Admin

**Descrição:** Desvincula um perfil de um usuário, tornando-o disponível novamente.

**Resposta:**
```json
{
  "message": "Perfil desvinculado com sucesso"
}
```

**Exemplo de uso:**
```javascript
// Desvincular um perfil
const response = await fetch('/api/streaming/profiles/profile-uuid/unassign', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
});
const result = await response.json();
```

---

### 3️⃣ Verificar Expirações Manualmente

**Endpoint:** `POST /api/streaming/check-expirations`

**Autenticação:** Requer token JWT de Admin

**Descrição:** Executa verificação manual de perfis expirados e os desvincula automaticamente (30 dias desde a atribuição).

**Resposta:**
```json
{
  "message": "Verificação de expiração executada",
  "profiles_expired": 3
}
```

**Exemplo de uso:**
```javascript
// Executar verificação de expiração
const response = await fetch('/api/streaming/check-expirations', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
});
const result = await response.json();
console.log(`${result.profiles_expired} perfis expirados foram desvinculados`);
```

---

## Expiração Automática

### Como Funciona

- **Período de Expiração:** 30 dias desde a atribuição
- **Verificação Automática:** A cada 1 hora (mesma task que verifica assinaturas)
- **Ação Automática:** Perfis expirados são automaticamente desvinculados e voltam ao estoque

### Logs

Quando um perfil expira automaticamente, o sistema gera logs:

```
info: 3 perfis expirados desvinculados automaticamente
info: Perfil expirado: user1 (profile-uuid) - Usuário: user-uuid
```

---

## Interface Admin Sugerida

### Tela de Gerenciamento de Atribuições

**Para cada serviço (Netflix, Disney+, etc):**

```
┌─────────────────────────────────────────────────────┐
│ 📊 Perfis Netflix - Gerenciamento                  │
├─────────────────────────────────────────────────────┤
│                                                      │
│ Perfil          Cliente              Expira em      │
│ ──────────────────────────────────────────────────  │
│ user1           cliente@email.com    28 dias   [❌] │
│ user2           outro@email.com      15 dias   [❌] │
│ user3           teste@email.com      EXPIRADO  [❌] │
│                                                      │
│ [🔄 Verificar Expirações Manualmente]               │
└─────────────────────────────────────────────────────┘
```

**Funcionalidades:**
- ✅ Mostrar todos os perfis atribuídos
- ✅ Ver email do cliente
- ✅ Ver dias restantes (vermelho se < 7 dias)
- ✅ Destacar perfis expirados
- ✅ Botão para desvincular manualmente
- ✅ Botão para forçar verificação de expiração

---

## Exemplo Completo de Integração

```javascript
// Componente React/Admin para gerenciar atribuições

function StreamingAssignmentsManager({ serviceId }) {
  const [profiles, setProfiles] = useState([]);
  
  // Carregar perfis atribuídos
  async function loadAssignedProfiles() {
    const response = await fetch(
      `/api/streaming/services/${serviceId}/assigned-profiles`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    const data = await response.json();
    setProfiles(data);
  }
  
  // Desvincular perfil
  async function unassignProfile(profileId) {
    if (!confirm('Deseja realmente desvincular este perfil?')) return;
    
    await fetch(`/api/streaming/profiles/${profileId}/unassign`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    // Recarregar lista
    loadAssignedProfiles();
  }
  
  // Verificar expirações
  async function checkExpirations() {
    const response = await fetch('/api/streaming/check-expirations', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await response.json();
    
    alert(`${result.profiles_expired} perfis expirados foram desvinculados`);
    loadAssignedProfiles();
  }
  
  return (
    <div>
      <h2>Perfis Atribuídos</h2>
      
      <button onClick={checkExpirations}>
        🔄 Verificar Expirações
      </button>
      
      <table>
        <thead>
          <tr>
            <th>Perfil</th>
            <th>Cliente</th>
            <th>Email</th>
            <th>Atribuído em</th>
            <th>Expira em</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {profiles.map(profile => (
            <tr key={profile.id}>
              <td>{profile.profile_name}</td>
              <td>{profile.user?.full_name}</td>
              <td>{profile.user?.email}</td>
              <td>{new Date(profile.assigned_at).toLocaleDateString()}</td>
              <td>{new Date(profile.assignment_info.expiration_date).toLocaleDateString()}</td>
              <td>
                {profile.assignment_info.is_expired ? (
                  <span style={{ color: 'red' }}>EXPIRADO</span>
                ) : (
                  <span style={{ 
                    color: profile.assignment_info.days_remaining < 7 ? 'orange' : 'green' 
                  }}>
                    {profile.assignment_info.days_remaining} dias
                  </span>
                )}
              </td>
              <td>
                <button onClick={() => unassignProfile(profile.id)}>
                  ❌ Desvincular
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## Resumo das Alterações

### Backend

✅ **streaming.controller.js**
- `getAssignedProfiles()` - Lista perfis com info do usuário
- `unassignProfile()` - Desvincula manualmente
- `checkExpiredAssignments()` - Verifica e remove expirados
- `runExpirationCheck()` - Endpoint manual para admin

✅ **streaming.routes.js**
- `GET /services/:serviceId/assigned-profiles`
- `DELETE /profiles/:profileId/unassign`
- `POST /check-expirations`

✅ **subscription.service.js**
- Verificação automática de expiração a cada 1 hora

### Regras de Negócio

- ⏰ **Período:** 30 dias desde `assigned_at`
- 🔄 **Auto-check:** A cada 1 hora
- 📧 **Sem email:** Apenas desvincula silenciosamente
- 🔓 **Status:** Volta para `available` quando expira

---

## Próximos Passos

1. **Frontend Admin:** Criar interface de gerenciamento
2. **Notificações:** Avisar usuário quando perfil está próximo de expirar (7 dias)
3. **Renovação:** Permitir renovar assinatura antes de expirar
4. **Dashboard:** Mostrar estatísticas de perfis atribuídos/disponíveis
