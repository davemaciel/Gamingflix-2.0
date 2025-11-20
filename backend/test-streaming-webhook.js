import fetch from 'node-fetch';
import crypto from 'crypto';

// Configuração
const WEBHOOK_URL = 'http://localhost:3000/api/streaming/webhook/payment';
const SECRET = 'minha_chave_secreta_teste'; // Certifique-se de que isso esteja no seu .env como GGCHECKOUT_WEBHOOK_SECRET

// Dados de Exemplo
const payload = {
  event: "payment.approved",
  transaction_id: `txn_${Date.now()}`,
  user_id: "user-uuid-exemplo", // Substitua por um ID real do seu banco se quiser testar atribuição real
  service_id: "service-uuid-exemplo", // Substitua por um ID de serviço real
  amount: 29.90,
  timestamp: new Date().toISOString()
};

// Gerar Assinatura
const hmac = crypto.createHmac('sha256', SECRET);
const signature = hmac.update(JSON.stringify(payload)).digest('hex');

console.log('Payload:', JSON.stringify(payload, null, 2));
console.log('Signature:', signature);
console.log('Enviando Webhook para:', WEBHOOK_URL);

async function sendWebhook() {
    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-GGCheckout-Signature': signature
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Resposta:', data);
    } catch (error) {
        console.error('Erro ao enviar webhook:', error);
    }
}

sendWebhook();
