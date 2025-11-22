import crypto from 'crypto';

const WEBHOOK_URL = 'https://ultimate.gamingflix.space/api/checkout/webhook';
const WEBHOOK_SECRET = process.env.GG_CHECKOUT_WEBHOOK_SECRET || 'your-secret-here';

const payload = {
  event: 'pix.paid', // Evento de pagamento confirmado
  customer: {
    name: 'Dave de Oliveira Maciel',
    email: 'davimaciel.ecom@gmail.com',
    document: null,
    phone: '+5585996493616',
    ip: '187.19.149.46'
  },
  payment: {
    id: crypto.randomUUID(),
    method: 'pix',
    amount: 2000, // R$ 20,00
    status: 'paid',
    paid_at: new Date().toISOString(),
    pix_code: 'SIMULATED_PIX_CODE'
  },
  products: [
    {
      id: 'prod_netflix_001',
      name: 'Netflix Premium 1 Mês', // ✅ Nome contém "netflix"
      quantity: 1,
      price: 2000
    }
  ]
};

// Gerar assinatura HMAC
const signature = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(JSON.stringify(payload))
  .digest('hex');

console.log('🧪 TESTE DE WEBHOOK - NETFLIX');
console.log('================================');
console.log('\n📦 Payload:');
console.log(JSON.stringify(payload, null, 2));
console.log(`\n🔐 Signature: ${signature}`);
console.log(`\n🎯 URL: ${WEBHOOK_URL}`);
console.log('\n⚙️ Enviando webhook...\n');

fetch(WEBHOOK_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-ggcheckout-signature': signature
  },
  body: JSON.stringify(payload)
})
  .then(res => {
    console.log(`✅ Status: ${res.status} ${res.statusText}`);
    return res.json();
  })
  .then(data => {
    console.log('\n📥 Resposta:');
    console.log(JSON.stringify(data, null, 2));
    console.log('\n✅ Webhook enviado com sucesso!');
    console.log('\n💡 Agora acesse a plataforma e vá em Streaming → Netflix');
    console.log('   Você deve ver o perfil atribuído ao seu usuário!');
  })
  .catch(error => {
    console.error('\n❌ Erro ao enviar webhook:', error.message);
  });
