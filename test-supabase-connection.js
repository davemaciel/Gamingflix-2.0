/**
 * 🧪 Script de Teste de Conexão com Supabase
 * 
 * Execute este script para verificar se as credenciais do Supabase
 * estão configuradas corretamente ANTES de importar os jogos.
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_KEY = SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log('🧪 Testando conexão com Supabase...\n');
console.log('='.repeat(60));

// 1. Verificar variáveis de ambiente
console.log('\n📋 Passo 1: Verificando variáveis de ambiente...');

if (!SUPABASE_URL) {
  console.error('❌ ERRO: VITE_SUPABASE_URL não definida no .env');
  process.exit(1);
}

if (!SUPABASE_KEY) {
  console.error('❌ ERRO: SUPABASE_SERVICE_ROLE_KEY (recomendado) ou VITE_SUPABASE_PUBLISHABLE_KEY não definidos no .env');
  process.exit(1);
}

console.log(`✅ VITE_SUPABASE_URL: ${SUPABASE_URL}`);
if (SUPABASE_SERVICE_ROLE_KEY) {
  console.log(`✅ SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY.substring(0, 6)}... (parcial)`);
} else {
  console.log(`✅ VITE_SUPABASE_PUBLISHABLE_KEY: ${SUPABASE_KEY.substring(0, 20)}...`);
}

// 2. Criar cliente Supabase
console.log('\n🔌 Passo 2: Conectando ao Supabase...');

let supabase;
try {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log('✅ Cliente Supabase criado com sucesso!');
} catch (err) {
  console.error('❌ ERRO ao criar cliente Supabase:', err.message);
  process.exit(1);
}

// 3. Testar conexão básica
console.log('\n🌐 Passo 3: Testando conexão básica...');

try {
  const { data, error } = await supabase.from('games').select('count', { count: 'exact', head: true });
  
  if (error) {
    console.error('❌ ERRO na conexão:', error.message);
    console.log('\n💡 Possíveis causas:');
    console.log('   - A tabela "games" não existe (execute as migrações SQL)');
    console.log('   - As credenciais do Supabase estão incorretas');
    console.log('   - O projeto Supabase está pausado ou indisponível');
    process.exit(1);
  }
  
  console.log('✅ Conexão estabelecida com sucesso!');
} catch (err) {
  console.error('❌ ERRO ao testar conexão:', err.message);
  process.exit(1);
}

// 4. Verificar tabela games
console.log('\n📊 Passo 4: Verificando estrutura da tabela "games"...');

try {
  const { data, error, count } = await supabase
    .from('games')
    .select('*', { count: 'exact', head: true });
  
  if (error) {
    console.error('❌ ERRO ao acessar tabela:', error.message);
    console.log('\n💡 Possíveis causas:');
    console.log('   - As migrações SQL não foram executadas');
    console.log('   - A tabela "games" não foi criada corretamente');
    process.exit(1);
  }
  
  console.log(`✅ Tabela "games" encontrada!`);
  console.log(`📦 Jogos atualmente no banco: ${count || 0}`);
  
  if (count > 0) {
    console.log('\n⚠️ ATENÇÃO: A tabela já contém jogos!');
    console.log('   Se você importar novamente, pode haver duplicatas.');
    console.log('   Considere limpar a tabela antes de importar:');
    console.log('   DELETE FROM games;');
  }
} catch (err) {
  console.error('❌ ERRO ao verificar tabela:', err.message);
  process.exit(1);
}

// 5. Testar inserção (rollback)
console.log('\n✍️ Passo 5: Testando permissões de escrita...');

try {
  const testGame = {
    title: 'TEST_GAME_DELETE_ME',
    cover_url: '/placeholder.svg',
    description: 'Jogo de teste',
    gradient: 'from-blue-500 to-purple-500',
    login: 'teste@teste.com',
    password: 'teste123',
    family_code: null,
    tutorial: JSON.stringify([{ step: 1, title: 'Teste', description: 'Teste' }])
  };
  
  const { data: insertData, error: insertError } = await supabase
    .from('games')
    .insert(testGame)
    .select();
  
  if (insertError) {
    console.error('❌ ERRO ao testar inserção:', insertError.message);
    console.log('\n💡 Possíveis causas:');
    console.log('   - Políticas RLS (Row Level Security) bloqueando inserções');
    console.log('   - Estrutura da tabela diferente do esperado');
    console.log('   - Chave do Supabase sem permissões adequadas');
    process.exit(1);
  }
  
  console.log('✅ Teste de inserção bem-sucedido!');
  
  // Deletar o jogo de teste
  if (insertData && insertData[0]) {
    const { error: deleteError } = await supabase
      .from('games')
      .delete()
      .eq('id', insertData[0].id);
    
    if (!deleteError) {
      console.log('✅ Jogo de teste removido com sucesso!');
    }
  }
} catch (err) {
  console.error('❌ ERRO ao testar inserção:', err.message);
  process.exit(1);
}

// 6. Resumo final
console.log('\n' + '='.repeat(60));
console.log('🎉 TESTE CONCLUÍDO COM SUCESSO!\n');
console.log('✅ Todas as verificações passaram!');
console.log('✅ Seu Supabase está pronto para receber os jogos!');
console.log('\n📌 Próximo passo:');
console.log('   npm run import:games');
console.log('='.repeat(60) + '\n');
