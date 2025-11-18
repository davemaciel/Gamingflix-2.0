# 🔍 DEBUG DO WEBHOOK - Guia Definitivo

## 🎯 **OBJETIVO: Descobrir porque o webhook não está funcionando**

---

## 📋 **PASSO 1: Deploy das Mudanças**

```bash
git push origin feature/checkout
```

**Aguarde** o deploy no Render terminar (~3-5 minutos)

---

## 🧪 **PASSO 2: Testar Webhook Localmente (Simulação)**

### **2.1. Faça login no site**
```
https://ultimate.gamingflix.space
```

### **2.2. Abra o Console do Navegador (F12)**

### **2.3. Execute este comando no console:**

```javascript
fetch('https://ultimate.gamingflix.space/api/checkout/webhook/test', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => console.log('✅ Resultado:', data))
.catch(err => console.error('❌ Erro:', err));
```

### **2.4. Verificar Resultado**

**Se funcionar:**
- ✅ Você deve ganhar uma assinatura
- ✅ Deve aparecer "Founder" no perfil
- ✅ Deve receber email de boas-vindas

**Se falhar:**
- ❌ Veja o erro no console
- ❌ Veja os logs do Render

---

## 📊 **PASSO 3: Verificar Logs do Render**

Acesse os logs do Render e procure por:

### **Logs que DEVEM aparecer se o webhook estiver funcionando:**

```
=== TESTE DE WEBHOOK INICIADO ===
=== WEBHOOK RECEBIDO ===
🎉 Evento de pagamento bem-sucedido detectado: pix.paid
=== PROCESSANDO PAGAMENTO BEM-SUCEDIDO ===
✅ Assinatura criada com sucesso
✅ Usuário marcado como Founder
📧 Enviando email de boas-vindas...
✅ Email enviado com sucesso
✅ Pagamento processado com sucesso!
=== WEBHOOK PROCESSADO COM SUCESSO ===
```

### **Logs de ERRO (se algo estiver errado):**

```
❌ ERROR PROCESSING WEBHOOK
```

---

## 🎯 **PASSO 4: Teste Real com PIX**

### **4.1. Faça um pagamento de teste**
- Vá em "Assinar agora"
- Gere um PIX de R$ 1,00
- Pague

### **4.2. Verifique os logs do Render**

**Procure por:**
```
=== WEBHOOK RECEBIDO ===
```

**Se APARECER:**
- ✅ GGCheckout está enviando webhooks
- ✅ O problema é no processamento (veja os logs de erro)

**Se NÃO APARECER:**
- ❌ GGCheckout NÃO está enviando webhooks
- ❌ Vá para PASSO 5

---

## ⚙️ **PASSO 5: Verificar Configuração no GGCheckout**

### **5.1. Acesse o painel GGCheckout**

### **5.2. Verifique Webhook**
```
Configurações → Webhook
```

**URL deve ser:**
```
https://ultimate.gamingflix.space/api/checkout/webhook
```

**Eventos marcados:**
- ☑️ pix.generated
- ☑️ pix.paid ← CRÍTICO
- ☑️ card.paid ← CRÍTICO
- ☑️ card.generated
- ☑️ card.failed
- ☑️ card.refunded
- ☑️ card.pending

### **5.3. Verifique Logs de Webhook no GGCheckout**

Procure por:
- **Tentativas de envio** para a transação paga
- **Códigos de erro** (401, 403, 500, etc.)
- **Status de resposta**

---

## 🔧 **DIAGNÓSTICO**

| Sintoma | Causa Provável | Solução |
|---------|----------------|---------|
| Teste local funciona, PIX real não | Webhook não está sendo enviado | Verificar config no GGCheckout |
| Logs mostram "payload inválido" | Formato do webhook mudou | Atualizar parser |
| Logs mostram erro de DB | Problema com MongoDB | Verificar conexão |
| Nenhum log aparece | Webhook não chega ao backend | Verificar URL e DNS |
| Erro 401/403 nos logs do GGCheckout | Secret incorreto | Atualizar `GG_CHECKOUT_WEBHOOK_SECRET` |

---

## 📧 **PASSO 6: Verificar Email**

Depois que a assinatura for criada com sucesso:

### **6.1. Verificar Resend Dashboard**
```
https://resend.com/emails
```

Deve aparecer:
- **To:** seu-email@gmail.com
- **Subject:** 🎮 Bem-vindo ao GamingFlix! Sua assinatura está ativa
- **Status:** Delivered

### **6.2. Se não aparecer:**
- Verifique `RESEND_API_KEY` no Render
- Verifique `RESEND_FROM` no Render
- Veja logs do Render para "Email enviado"

---

## 🎬 **RESULTADO ESPERADO**

Após seguir todos os passos:

1. ✅ Teste local cria assinatura
2. ✅ Logs mostram processamento completo
3. ✅ Pagamento real PIX/Cartão funciona
4. ✅ Webhook aparece nos logs
5. ✅ Email chega na caixa de entrada
6. ✅ Redirecionamento para `/catalogo`

---

## 🆘 **Se ainda não funcionar:**

**Me envie:**
1. Screenshot dos logs do Render após teste local
2. Screenshot dos logs do Render após PIX real
3. Screenshot da configuração do webhook no GGCheckout
4. Screenshot dos logs de webhook no painel GGCheckout
5. Resultado do teste do console (passo 2.3)

**Com isso eu vou identificar EXATAMENTE onde está o problema!** 🎯
