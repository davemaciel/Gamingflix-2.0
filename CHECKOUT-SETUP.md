# Configuração do Checkout GGCheckout

## Resumo da Implementação

Integração completa do GGCheckout para vender o plano **Ultimate Founders** (R$ 59,90) com processamento automático de pagamentos via webhook.

## Funcionalidades Implementadas

### Backend

1. **Endpoint de Checkout** (`GET /api/checkout/session`)
   - Retorna URL do checkout hospedado do GGCheckout
   - Requer autenticação JWT
   - URL configurável via `GG_CHECKOUT_CHECKOUT_URL`

2. **Webhook GGCheckout** (`POST /api/checkout/webhook`)
   - Processa eventos de pagamento (pix.paid, card.paid, etc.)
   - Salva transações na collection `checkout_transactions`
   - Cria assinaturas automaticamente para pagamentos aprovados
   - Cria usuários placeholder se email não existir
   - Marca usuários como Founders (`is_founder: true`)

3. **API de Transações** (Admin)
   - `GET /api/transactions` - Lista transações com filtros
   - `GET /api/transactions/:id` - Detalhes de transação
   - `GET /api/transactions/stats` - Estatísticas agregadas

### Frontend

1. **Preço Atualizado**
   - Founders: R$ 59,90 (antes R$ 67,90)
   - Atualizado em todas traduções e componentes

2. **Painel Admin - Aba Transações**
   - Visualização de todas as transações
   - Filtros por status (pago/pendente/falhou/reembolsado)
   - Busca por email do cliente
   - Estatísticas em tempo real (total, pagas, pendentes, receita)
   - Paginação

## Variáveis de Ambiente (Render/Railway)

Adicione as seguintes variáveis no painel do Render:

```bash
# URL do checkout hospedado (opcional, já tem default)
GG_CHECKOUT_CHECKOUT_URL=https://www.ggcheckout.com/checkout/v2/Et6D7G1DJX9xxt6mCOcA

# Secret para validar webhook (recomendado)
GG_CHECKOUT_WEBHOOK_SECRET=seu-secret-aqui

# URL do frontend (já configurado)
FRONTEND_URL=https://ultimate.gamingflix.space
```

## Configuração do Webhook no GGCheckout

Acesse o painel do GGCheckout e configure:

1. **Nome da Integração**: Gamingflix
2. **URL da Integração**: `https://ultimate.gamingflix.space/api/checkout/webhook`
3. **Secret**: (gere um e adicione em `GG_CHECKOUT_WEBHOOK_SECRET`)
4. **Produtos**: Selecione o produto Ultimate Founders
5. **Eventos**: Marque todos para rastreio completo
   - ✅ Pix Generated
   - ✅ Pix Paid
   - ✅ Card Generated
   - ✅ Card Paid
   - ✅ Card Failed
   - ✅ Card Refunded
   - ✅ Card Pending

## Fluxo de Pagamento

### 1. Usuário clica em "Comprar"
- Frontend chama `GET /api/checkout/session`
- Recebe URL do checkout
- Redireciona usuário para GGCheckout

### 2. Usuário paga (PIX ou Cartão)
- GGCheckout processa pagamento
- Dispara webhook `POST /api/checkout/webhook`

### 3. Backend processa webhook
- Salva transação em `checkout_transactions`
- Se evento = `pix.paid` ou `card.paid`:
  - Busca usuário por email
  - Se não existe, cria placeholder
  - Cancela assinaturas antigas
  - Cria nova assinatura de 30 dias
  - Marca como Founder (`is_founder: true`)
  - Envia email de boas-vindas via Resend

### 4. Usuário recebe acesso
- Assinatura ativa por 30 dias
- Status de Founder garantido
- Email de confirmação enviado

## Estrutura de Dados

### Collection: `checkout_transactions`

```javascript
{
  id: "uuid",
  event: "pix.paid",
  status: "paid", // pending | paid | failed | refunded
  payment_method: "pix",
  amount: 59.90,
  customer_email: "cliente@email.com",
  customer_name: "João Silva",
  customer_phone: "+5511999999999",
  products: [...],
  raw_payload: {...}, // payload completo do webhook
  created_at: ISODate,
  updated_at: ISODate
}
```

### Collection: `subscription_plans` (Ultimate Founders)

```javascript
{
  id: "uuid",
  name: "Ultimate Founders",
  slug: "ultimate-founders",
  price: 59.90,
  max_games: 999999,
  description: "Acesso total vitalício com preço bloqueado para sempre",
  features: [...],
  is_active: true
}
```

## Deploy

### 1. Push do branch feature/checkout

```bash
git push origin feature/checkout
```

### 2. Configurar variáveis no Render

Adicione `GG_CHECKOUT_WEBHOOK_SECRET` e `GG_CHECKOUT_CHECKOUT_URL`

### 3. Configurar webhook no GGCheckout

Use a URL: `https://ultimate.gamingflix.space/api/checkout/webhook`

### 4. Testar webhook

Faça um pagamento de teste e verifique:
- Logs do Render para ver webhook recebido
- Aba "Transações" no admin para ver transação registrada
- Collection `checkout_transactions` no MongoDB
- Assinatura criada para o usuário

## Configuração de Back Redirect no GGCheckout

### Recuperação de Checkout Abandonado

Para melhorar a conversão e recuperar checkouts abandonados, configure o **Back Redirect** no painel do GGCheckout:

1. **Acesse**: Menu → Produtos → Checkout → Editar Checkout
2. **Encontre**: Seção "Back Redirect" 
3. **Configure**:
   ```
   URL de Redirecionamento:
   https://ultimate.gamingflix.space/?checkout=abandoned
   ```

### Como Funciona

Quando o usuário:
- Clica em "Voltar" no checkout
- Fecha a janela de pagamento
- Cancela o pagamento

Ele será redirecionado para o site com o parâmetro `?checkout=abandoned`, o que automaticamente:

✅ **Exibe modal de recuperação** com benefícios destacados  
✅ **Oferece botão para retornar ao checkout** rapidamente  
✅ **Cria senso de urgência** (vagas limitadas, preço vitalício)  
✅ **Melhora taxa de conversão** ao engajar usuários que abandonaram

### Benefícios

- **Experiência profissional**: Em vez de ficar na página do GGCheckout, volta para seu site
- **Recuperação ativa**: Modal persuasivo incentiva conclusão da compra
- **Tracking**: Rastreia quantos usuários abandonam o checkout
- **Segunda chance**: Oferece nova oportunidade de conversão

## Rollback

Se necessário reverter para versão estável:

```bash
git checkout main
git reset --hard v1.0-pre-checkout
git push -f origin main
```

## Próximos Passos

1. ✅ Deploy no Render
2. ✅ Configurar webhook no GGCheckout
3. ✅ Testar pagamento completo
4. ⏳ Atualizar frontend para usar checkout em vez de WhatsApp (opcional)
5. ⏳ Implementar renovação automática de assinaturas
6. ⏳ Adicionar notificações por email para cada transação

## Suporte

Em caso de problemas:
- Verifique logs do Render em "Deploy logs"
- Verifique MongoDB Atlas para transações registradas
- Teste webhook manualmente com payload de exemplo
- Consulte documentação do GGCheckout

---

**Branch**: `feature/checkout`  
**Commit**: `feat: integra checkout GGCheckout e painel de transações`  
**Data**: 2025-11-18
