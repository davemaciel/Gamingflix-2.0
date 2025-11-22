import { connectDatabase, collections } from './src/config/database.js';

async function verificarPerfisNetflix() {
  try {
    console.log('🔍 Conectando ao MongoDB...');
    await connectDatabase();

    // Buscar serviço Netflix
    const netflixService = await collections.streamingServices().findOne({
      name: /netflix/i
    });

    if (!netflixService) {
      console.log('❌ Serviço Netflix não encontrado no banco!');
      console.log('\n📋 Serviços disponíveis:');
      const services = await collections.streamingServices().find({}).toArray();
      services.forEach(s => console.log(`  - ${s.name} (ID: ${s.id})`));
      process.exit(1);
    }

    console.log('\n✅ Serviço Netflix encontrado:');
    console.log(`   ID: ${netflixService.id}`);
    console.log(`   Nome: ${netflixService.name}`);

    // Buscar todos os perfis da Netflix
    const allProfiles = await collections.streamingProfiles()
      .find({ service_id: netflixService.id })
      .toArray();

    console.log(`\n📊 Total de perfis Netflix: ${allProfiles.length}`);

    // Contar perfis disponíveis
    const availableProfiles = allProfiles.filter(p => !p.assigned_to);
    const assignedProfiles = allProfiles.filter(p => p.assigned_to);

    console.log(`   ✅ Disponíveis: ${availableProfiles.length}`);
    console.log(`   🔒 Atribuídos: ${assignedProfiles.length}`);

    if (availableProfiles.length > 0) {
      console.log('\n📝 Perfis disponíveis:');
      availableProfiles.forEach((p, i) => {
        console.log(`\n   ${i + 1}. Perfil: ${p.profile_name || 'Sem nome'}`);
        console.log(`      Email: ${p.email}`);
        console.log(`      Senha: ${p.password}`);
        console.log(`      PIN: ${p.pin || 'N/A'}`);
      });
    } else {
      console.log('\n⚠️ Nenhum perfil disponível para atribuição!');
    }

    if (assignedProfiles.length > 0) {
      console.log('\n🔒 Perfis já atribuídos:');
      assignedProfiles.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.profile_name} → ${p.assigned_to}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

verificarPerfisNetflix();
