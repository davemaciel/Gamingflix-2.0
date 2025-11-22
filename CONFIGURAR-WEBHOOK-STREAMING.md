# Configurar Webhook para Streaming

## 🔍 Diagnóstico do Problema

Os logs mostram que **NENHUM webhook está sendo recebido** quando você compra um serviço de streaming. Isso significa que o GGCheckout não está enviando notificações para o nosso servidor.

### Sintomas Observados
- ✅ Servidor está rodando: `https://ultimate.gamingflix.space`
- ✅ Rotas de streaming funcionam: `GET /api/streaming/services`
- ❌ Nenhum `POST` ao webhook aparece nos logs
- ❌ Perfil de streaming não é atribuído automaticamente

## 🎯 Solução: Configurar URL do Webhook no GGCheckout

### Opção 1: URL Universal (RECOMENDADO)
Use o endpoint principal que agora detecta automaticamente webhooks de streaming:

```
https://ultimate.gamingflix.space/api/checkout/webhook
```

**Vantagens:**
- Funciona para jogos E streaming
- Não precisa alterar URLs quando mudar o produto
- Já está testado e funcionando para assinaturas de jogos

### Opção 2: URL Específica para Streaming
Se preferir separar, use o endpoint dedicado:

```
https://ultimate.gamingflix.space/api/streaming/webhook/payment
```

## 📋 Passo a Passo: Configurar no GGCheckout

### 1. Acesse o Dashboard do GGCheckout
- Entre em [https://ggcheckout.com/dashboard](https://ggcheckout.com/dashboard)
- Faça login na sua conta

### 2. Configure o Webhook

#### Se estiver usando um Produto Específico (Netflix, Disney+, etc):
1. Vá em **Produtos** ou **Serviços**
2. Encontre o produto "Netflix" (ou similar)
3. Clique em **Configurações** ou **Webhooks**
4. Cole a URL: `https://ultimate.gamingflix.space/api/checkout/webhook`
5. **Salve** as alterações

#### Se estiver usando Configuração Global:
1. Vá em **Configurações** → **Webhooks**
2. Adicione/Atualize a URL de webhook
3. Cole: `https://ultimate.gamingflix.space/api/checkout/webhook`
4. Eventos a habilitar:
   - ✅ `payment.approved`
   - ✅ `payment.paid` (se disponível)
   - ✅ `pix.paid`
   - ✅ `card.paid`
5. **Salve**

### 3. Configure o Secret (Segurança)
Se o GGCheckout solicitar um "Webhook Secret" ou "Secret Key":

**Use o mesmo valor que está na sua variável de ambiente:**
```
GG_CHECKOUT_WEBHOOK_SECRET
```

⚠️ **IMPORTANTE**: O valor deve ser IDÊNTICO no GGCheckout e no servidor (.env).

## 🧪 Testar o Webhook

### Método 1: Teste no Dashboard do GGCheckout
Muitos gateways têm um botão "Testar Webhook" ou "Enviar Webhook de Teste":
1. Encontre essa opção no dashboard
2. Clique para enviar um webhook de teste
3. Verifique os logs do servidor no Render

### Método 2: Compra Real (Sandbox/Teste)
Se o GGCheckout tiver ambiente de teste:
1. Faça uma "compra" de teste
2. Use dados de cartão de teste (geralmente fornecidos pela documentação)
3. Complete o pagamento
4. Verifique os logs

### Método 3: Script Manual (Desenvolvimento Local)
Use o script que criamos:

```bash
cd backend
node test-streaming-webhook.js
```

**Antes de executar**, edite o arquivo e ajuste:
- `user_id`: ID real de um usuário do seu banco
- `service_id`: ID real de um serviço de streaming (Netflix, etc)
- `SECRET`: Valor do `GG_CHECKOUT_WEBHOOK_SECRET`

## 📊 Estrutura de Payload Esperada

### Para Streaming (Nova Estrutura):
```json
{
  "event": "payment.approved",
  "transaction_id": "txn_123abc",
  "user_id": "uuid-do-usuario",
  "service_id": "uuid-do-servico-streaming",
  "amount": 29.90,
  "timestamp": "2025-11-20T10:00:00Z"
}
```

### Para Jogos (Estrutura Antiga - ainda suportada):
```json
{
  "event": "pix.paid",
  "customer": {
    "email": "usuario@email.com",
    "name": "Nome do Usuário"
  },
  "payment": {
    "id": "pay_123",
    "amount": 59.90,
    "method": "pix"
  },
  "products": [...]
}
```

## 🔐 Validação de Segurança

O webhook valida a assinatura HMAC enviada no header:
```
X-GGCheckout-Signature: <hash-hmac-sha256>
```

Se a assinatura não bater, o webhook será rejeitado com **401 Unauthorized**.

## 📝 Como Verificar se Funcionou

### Logs Esperados (Render/Railway):
```
info: === WEBHOOK RECEBIDO ===
info: Body: { "event": "payment.approved", ... }
info: 🔄 Redirecionando webhook para controller de Streaming...
info: === WEBHOOK STREAMING RECEBIDO ===
info: ✅ Assinatura validada com sucesso
info: Transação txn_123 registrada.
info: 💰 Pagamento aprovado para user abc, serviço xyz
info: ✅ Perfil perfil-123 atribuído com sucesso ao usuário abc
```

### No Banco de Dados:
- **Coleção `transactions`**: Nova entrada com `type: "streaming_purchase"`
- **Coleção `streamingProfiles`**: Perfil com `status: "assigned"` e `assigned_to: user_id`

### Na Interface do Usuário:
1. Usuário acessa a página do serviço (Netflix)
2. Vê suas credenciais (email/senha do perfil)
3. Consegue acessar o streaming

## ❌ Troubleshooting

### Problema: Webhook não chega
**Causa**: URL não configurada ou incorreta no GGCheckout  
**Solução**: Siga o passo a passo acima e verifique a URL

### Problema: Webhook retorna 401 (Assinatura inválida)
**Causa**: Secret diferente entre GGCheckout e servidor  
**Solução**: Confirme que `GG_CHECKOUT_WEBHOOK_SECRET` é idêntico em ambos

### Problema: Webhook chega mas perfil não é atribuído
**Causa 1**: Payload com `user_id` ou `service_id` errado  
**Solução**: Verifique logs para ver o payload recebido

**Causa 2**: Não há perfis disponíveis  
**Solução**: Crie perfis de streaming no admin (`POST /api/streaming/accounts`)

**Causa 3**: Usuário já tem perfil  
**Solução**: Sistema bloqueia duplicatas. Verifique os logs ("CRÍTICO: Usuário pagou mas já tinha perfil")

### Problema: "Nenhum perfil disponível"
**Causa**: Estoque esgotado (todos perfis `assigned`)  
**Solução**: 
1. Vá no painel admin
2. Adicione mais contas/perfis
3. Ou libere perfis não utilizados

## 🚀 URLs de Referência Rápida

| Descrição | URL |
|-----------|-----|
| Webhook Universal | `https://ultimate.gamingflix.space/api/checkout/webhook` |
| Webhook Streaming (específico) | `https://ultimate.gamingflix.space/api/streaming/webhook/payment` |
| Listar serviços | `GET https://ultimate.gamingflix.space/api/streaming/services` |
| Ver meu perfil | `GET https://ultimate.gamingflix.space/api/streaming/services/{id}/my-profile` |

## ✅ Checklist de Implantação

- [ ] Variável `GG_CHECKOUT_WEBHOOK_SECRET` configurada no servidor
- [ ] URL do webhook configurada no GGCheckout dashboard
- [ ] Secret sincronizado entre GGCheckout e servidor
- [ ] Teste de webhook enviado com sucesso
- [ ] Logs mostram "WEBHOOK RECEBIDO"
- [ ] Perfil atribuído corretamente no banco
- [ ] Usuário consegue ver credenciais na interface

---

**Próximo Passo:** Acesse o dashboard do GGCheckout e configure o webhook seguindo este guia.
