import { connectDatabase, collections } from './src/config/database.js';

async function listarTudo() {
  try {
    console.log('🔍 Conectando ao MongoDB...');
    await connectDatabase();

    // 1. Serviços
    const services = await collections.streamingServices().find({}).toArray();
    console.log(`\n📺 SERVIÇOS DE STREAMING: ${services.length}`);
    if (services.length === 0) {
      console.log('   ❌ Nenhum serviço cadastrado!');
      console.log('\n💡 VOCÊ PRECISA:');
      console.log('   1. Acessar o painel Admin');
      console.log('   2. Ir em "Streaming"');
      console.log('   3. Adicionar serviços (Netflix, Disney+, etc)');
    } else {
      services.forEach(s => {
        console.log(`\n   🎬 ${s.name}`);
        console.log(`      ID: ${s.id}`);
        console.log(`      Descrição: ${s.description || 'N/A'}`);
      });
    }

    // 2. Perfis
    const profiles = await collections.streamingProfiles().find({}).toArray();
    console.log(`\n\n👤 PERFIS DE STREAMING: ${profiles.length}`);
    if (profiles.length === 0) {
      console.log('   ❌ Nenhum perfil cadastrado!');
    } else {
      const available = profiles.filter(p => !p.assigned_to).length;
      const assigned = profiles.filter(p => p.assigned_to).length;
      console.log(`   ✅ Disponíveis: ${available}`);
      console.log(`   🔒 Atribuídos: ${assigned}`);
      
      profiles.forEach((p, i) => {
        console.log(`\n   ${i + 1}. ${p.profile_name || 'Sem nome'}`);
        console.log(`      Serviço ID: ${p.service_id}`);
        console.log(`      Email: ${p.email}`);
        console.log(`      Status: ${p.assigned_to ? '🔒 Atribuído a ' + p.assigned_to : '✅ Disponível'}`);
      });
    }

    // 3. Transações recentes
    const transactions = await collections.transactions()
      .find({})
      .sort({ created_at: -1 })
      .limit(5)
      .toArray();
    
    console.log(`\n\n💰 ÚLTIMAS TRANSAÇÕES: ${transactions.length}`);
    transactions.forEach((t, i) => {
      console.log(`\n   ${i + 1}. ${t.event || 'N/A'}`);
      console.log(`      Email: ${t.customer_email}`);
      console.log(`      Status: ${t.status}`);
      console.log(`      Data: ${t.created_at}`);
      if (t.products && t.products.length > 0) {
        console.log(`      Produto: ${t.products[0].name || t.products[0].title || 'N/A'}`);
      }
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

listarTudo();
