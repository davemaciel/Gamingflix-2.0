# 📧 Sistema de Emails Automáticos de Assinaturas

## 🎯 Visão Geral

Sistema completo de notificações por email para gerenciamento de assinaturas, incluindo:

- ✅ **Email de boas-vindas** quando assinatura é criada
- ✅ **Aviso de vencimento (7 dias)** antes da expiração
- ✅ **Aviso urgente (3 dias)** antes da expiração
- ✅ **Email de expiração** quando assinatura vence
- ✅ **Email de cancelamento** (manual ou por falta de pagamento)
- ✅ **Email de renovação** quando assinatura é estendida

---

## 📨 Tipos de Emails

### 1️⃣ **Bem-vindo ao GamingFlix! 🎮**

**Enviado quando:** Admin cria uma assinatura para o usuário

**Conteúdo:**
- Saudação personalizada
- Detalhes do plano contratado
- Data de expiração
- Lista de benefícios
- Botão para explorar o catálogo

**Visual:** Gradient roxo/azul (tema principal)

**Subject:** `🎮 Bem-vindo ao GamingFlix! Sua assinatura está ativa`

---

### 2️⃣ **Aviso de Vencimento (7 dias) ⏰**

**Enviado quando:** Faltam 7 dias para a assinatura expirar

**Conteúdo:**
- Lembrete amigável
- Contador de dias restantes
- Data de expiração
- Benefícios de renovar
- Botão de renovação

**Visual:** Gradient laranja (alerta moderado)

**Subject:** `⏰ Sua assinatura GamingFlix vence em 7 dias!`

**Importante:** Envia apenas UMA VEZ (usa flag `notified_7_days`)

---

### 3️⃣ **Aviso Urgente (3 dias) 🚨**

**Enviado quando:** Faltam apenas 3 dias para expirar

**Conteúdo:**
- Tom urgente
- Contador em destaque (36px, vermelho)
- Lista do que será perdido
- Call-to-action forte
- Botão "RENOVAR AGORA!"

**Visual:** Gradient vermelho (alerta crítico)

**Subject:** `🚨 URGENTE: Sua assinatura GamingFlix vence em 3 dias!`

**Importante:** Envia apenas UMA VEZ (usa flag `notified_3_days`)

---

### 4️⃣ **Assinatura Expirada 😢**

**Enviado quando:** Assinatura vence e muda para `expired`

**Conteúdo:**
- Notificação de expiração
- Status "EXPIRADA"
- Mensagem de "sentimos sua falta"
- Incentivo para reativar
- Oferta de retorno

**Visual:** Gradient cinza

**Subject:** `😢 Sua assinatura GamingFlix expirou`

---

### 5️⃣ **Assinatura Cancelada ❌**

**Enviado quando:** Admin cancela a assinatura

**Conteúdo:**
- Notificação de cancelamento
- Motivo do cancelamento:
  - `cancelamento` - Cancelamento manual
  - `payment_failed` - Falha no pagamento
- Oferta especial de retorno (7 dias)
- Botão de reativação

**Visual:** Gradient laranja-escuro

**Subject:** `❌ Sua assinatura GamingFlix foi cancelada`

---

### 6️⃣ **Assinatura Renovada ✅**

**Enviado quando:** Admin renova a assinatura do usuário

**Conteúdo:**
- Confirmação de renovação
- Nova data de expiração
- Agradecimento
- Botão para explorar jogos

**Visual:** Gradient verde (sucesso)

**Subject:** `✅ Sua assinatura GamingFlix foi renovada!`

---

## ⚙️ Configuração

### **Requisitos**

1. **SMTP Configurado** no `backend/.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=seu@email.com
SMTP_PASS=sua_senha_de_app
SMTP_FROM=GamingFlix <noreply@gamingflix.com>
FRONTEND_URL=http://localhost:8080
```

2. **Backend rodando** com o verificador automático ativo

---

## 🔄 Funcionamento Automático

### **Verificação a Cada 1 Hora**

O sistema executa automaticamente:

```javascript
// A cada 1 hora
✓ Busca assinaturas expiradas → envia email → muda status para 'expired'
✓ Busca assinaturas que expiram em 7 dias → envia aviso
✓ Busca assinaturas que expiram em 3 dias → envia aviso urgente
```

### **Evita Duplicação**

- Usa flags `notified_7_days` e `notified_3_days`
- Cada email de aviso é enviado **apenas UMA VEZ**
- Ao renovar, as flags são resetadas

---

## 🎬 Quando os Emails São Enviados

| Ação | Email Enviado | Automático? |
|------|---------------|-------------|
| Admin cria assinatura | Boas-vindas | ✅ Sim (imediato) |
| 7 dias antes de expirar | Aviso 7 dias | ✅ Sim (verificação horária) |
| 3 dias antes de expirar | Aviso 3 dias | ✅ Sim (verificação horária) |
| Assinatura expira | Expirada | ✅ Sim (verificação horária) |
| Admin cancela assinatura | Cancelada | ✅ Sim (imediato) |
| Admin renova assinatura | Renovada | ✅ Sim (imediato) |

---

## 🧪 Como Testar

### **Teste 1: Email de Boas-vindas**

1. Vá para `/admin` → aba "Usuários"
2. Clique em "Criar Assinatura" em um usuário
3. Selecione plano e duração
4. Confirme
5. **Email enviado imediatamente!**

**Verifique:**
- Caixa de entrada do usuário
- Pasta de spam
- Logs do backend: `Subscription created email sent to...`

---

### **Teste 2: Aviso de 7 Dias**

**Opção A: Criar assinatura de teste**
```bash
# Criar assinatura com expiração em ~7 dias
1. Criar assinatura para 1 mês
2. No MongoDB, alterar expires_at para daqui 7 dias:
   db.subscriptions.updateOne(
     { user_id: "USER_ID" },
     { $set: { expires_at: new Date(Date.now() + 7*24*60*60*1000) } }
   )
3. Aguardar próxima verificação (até 1 hora) ou reiniciar backend
```

**Opção B: Forçar verificação**
```javascript
// Adicione temporariamente ao backend/src/index.js
import { runAllSubscriptionChecks } from './services/subscription.service.js';

// Logo após connectDatabase():
await runAllSubscriptionChecks();
```

---

### **Teste 3: Aviso de 3 Dias**

Similar ao teste 2, mas alterar `expires_at` para daqui 3 dias:

```javascript
db.subscriptions.updateOne(
  { user_id: "USER_ID" },
  { $set: {
    expires_at: new Date(Date.now() + 3*24*60*60*1000),
    notified_7_days: true  // Já foi avisado há 4 dias
  }}
)
```

---

### **Teste 4: Email de Expiração**

```javascript
// Alterar para o passado
db.subscriptions.updateOne(
  { user_id: "USER_ID" },
  { $set: {
    expires_at: new Date("2020-01-01")
  }}
)

// Aguardar verificação ou reiniciar backend
// Email será enviado + status mudará para 'expired'
```

---

### **Teste 5: Email de Cancelamento**

**No Painel Admin:**
1. Vá para aba "Usuários"
2. Clique em "Cancelar Assinatura"
3. Confirme
4. **Email enviado imediatamente!**

**Via API (com motivo):**
```bash
curl -X DELETE http://localhost:3000/api/users/USER_ID/subscription \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "payment_failed"}'
```

---

### **Teste 6: Email de Renovação**

**No Painel Admin:**
1. Vá para aba "Usuários"
2. Clique em "Renovar"
3. Digite quantos meses (ex: 3)
4. Confirme
5. **Email enviado imediatamente!**

---

## 📊 Logs

### **Logs de Sucesso**

```
info: Subscription created email sent to user@example.com
info: Expiring 7 days email sent to user@example.com
info: Expiring 3 days email sent to user@example.com
info: Subscription expired email sent to user@example.com
info: Subscription cancelled email sent to user@example.com (reason: payment_failed)
info: Subscription renewed email sent to user@example.com
```

### **Logs de Verificação**

```
info: Running subscription checks...
info: Expired 2 subscription(s) and sent emails
info: Sent 5 expiring 7-days warning email(s)
info: Sent 3 expiring 3-days urgent warning email(s)
info: Subscription checks completed
```

### **Logs de Erro**

```
error: Error sending subscription created email: connect ETIMEDOUT
warn: Email transporter not configured. Subscription created email not sent.
```

---

## 🐛 Resolução de Problemas

### **Emails não estão sendo enviados**

1. **Verifique configuração SMTP no `.env`:**
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_SECURE=true
   SMTP_USER=seu@email.com
   SMTP_PASS=sua_senha_de_app
   ```

2. **Gmail requer senha de app:**
   - Não use sua senha normal!
   - Gere em: https://myaccount.google.com/apppasswords
   - Use a senha gerada no `SMTP_PASS`

3. **Verifique logs do backend:**
   ```bash
   tail -f backend/logs/combined.log
   ```

4. **Teste conexão SMTP:**
   ```bash
   cd backend
   node test-email-connection.js
   ```

---

### **Avisos de 7/3 dias não são enviados**

1. **Verifique se o backend está rodando continuamente**
   - Sistema verifica a cada 1 hora
   - Se o backend parar, não envia

2. **Verifique flags de notificação:**
   ```javascript
   db.subscriptions.find({ notified_7_days: true })
   ```

3. **Reset manual das flags:**
   ```javascript
   db.subscriptions.updateMany(
     {},
     { $set: { notified_7_days: false, notified_3_days: false } }
   )
   ```

---

### **Emails vão para spam**

1. **Configure SPF/DKIM** no seu domínio
2. **Use um serviço profissional:**
   - SendGrid
   - Mailgun
   - Amazon SES

3. **Evite palavras de spam:**
   - "GRÁTIS", "URGENTE" em excesso
   - Muitos emojis

---

## 📁 Estrutura de Arquivos

```
backend/
├── src/
│   ├── templates/
│   │   └── email.templates.js          # 📧 Templates HTML
│   ├── services/
│   │   ├── subscription-emails.service.js  # ✉️ Envio de emails
│   │   └── subscription.service.js      # ⏰ Verificação automática
│   ├── controllers/
│   │   └── users.controller.js          # 🎯 Integração nos eventos
│   └── config/
│       └── email.js                     # ⚙️ Config nodemailer
```

---

## 🎨 Personalização de Templates

### **Editar Cores**

Em `backend/src/templates/email.templates.js`:

```javascript
// Cor principal (botões, destaques)
const buttonStyle = `background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);`

// Cor de aviso (7 dias)
const warningColor = '#f59e0b';

// Cor urgente (3 dias)
const urgentColor = '#ef4444';
```

### **Editar Textos**

Busque no template correspondente e altere:

```javascript
export const subscriptionCreatedTemplate = (userName, planName, expiresAt) => {
  return `
    <h1>🎮 Bem-vindo ao GamingFlix!</h1>  <!-- Edite aqui -->
    <p>Sua assinatura foi ativada com sucesso! 🎉</p>
  `;
};
```

### **Adicionar Logo**

```html
<img src="https://seudominio.com/logo.png" alt="GamingFlix" style="height: 60px;">
```

---

## 📈 Estatísticas e Monitoramento

### **Verificar Emails Enviados (Logs)**

```bash
# Últimos emails enviados
grep "email sent to" backend/logs/combined.log | tail -20

# Emails por tipo
grep "Subscription created email" backend/logs/combined.log | wc -l
grep "Expiring 7 days email" backend/logs/combined.log | wc -l
grep "Expiring 3 days email" backend/logs/combined.log | wc -l
```

### **Verificar Assinaturas Próximas de Expirar**

```javascript
// MongoDB
const sevenDaysFromNow = new Date();
sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

db.subscriptions.find({
  status: 'active',
  expires_at: { $lt: sevenDaysFromNow }
}).count()
```

---

## ✅ Checklist de Implementação

- [x] Templates HTML responsivos
- [x] 6 tipos de emails diferentes
- [x] Serviço de envio com nodemailer
- [x] Verificação automática a cada 1 hora
- [x] Avisos de 7 e 3 dias antes
- [x] Email de expiração automático
- [x] Integração com criação de assinatura
- [x] Integração com renovação
- [x] Integração com cancelamento
- [x] Flags anti-duplicação
- [x] Logs detalhados
- [x] Documentação completa

---

## 🚀 Próximos Passos (Opcional)

### **Melhorias Futuras**

1. **Dashboard de Emails:**
   - Estatísticas de emails enviados
   - Taxa de abertura (com tracking pixel)
   - Taxa de clique

2. **Personalização Avançada:**
   - Templates por idioma (PT/EN/ES)
   - A/B testing de subject lines
   - Segmentação por tipo de usuário

3. **Automação Extra:**
   - Email 1 dia antes de expirar
   - Email de reengajamento (30 dias após expiração)
   - Newsletter mensal de jogos novos

4. **Integrações:**
   - SendGrid/Mailgun para melhor entregabilidade
   - Twilio para SMS além de email
   - WhatsApp Business API

---

## 🎉 Conclusão

Sistema de emails **completo e pronto para produção**!

**Benefícios:**
- ✅ Usuários sempre informados
- ✅ Reduz churn com avisos antecipados
- ✅ Automação total (zero trabalho manual)
- ✅ Templates profissionais e responsivos
- ✅ Fácil de customizar

**Dúvidas?** Consulte os logs ou este guia! 📧✨
