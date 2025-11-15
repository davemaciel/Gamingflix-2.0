import fetch from 'node-fetch';

const API_URL = 'http://localhost:3000/api';

// Substitua com um token válido de admin
const TOKEN = process.env.ADMIN_TOKEN || 'SEU_TOKEN_AQUI';

async function testUpdateGame() {
  try {
    console.log('🔍 Buscando todos os jogos...\n');
    
    // 1. Buscar todos os jogos
    const gamesResponse = await fetch(`${API_URL}/games`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!gamesResponse.ok) {
      console.error('❌ Erro ao buscar jogos:', await gamesResponse.text());
      return;
    }
    
    const games = await gamesResponse.json();
    console.log(`✅ ${games.length} jogos encontrados`);
    
    if (games.length === 0) {
      console.log('⚠️  Nenhum jogo disponível para teste');
      return;
    }
    
    // 2. Pegar o primeiro jogo
    const gameToUpdate = games[0];
    console.log(`\n📝 Jogo selecionado para teste: ${gameToUpdate.title} (ID: ${gameToUpdate.id})`);
    console.log('Dados atuais:');
    console.log(`  Login: ${gameToUpdate.login}`);
    console.log(`  Senha: ${gameToUpdate.password}`);
    
    // 3. Atualizar o jogo (mudar a senha como teste)
    const newPassword = `TESTE_${Date.now()}`;
    console.log(`\n🔄 Tentando atualizar senha para: ${newPassword}`);
    
    const updateResponse = await fetch(`${API_URL}/games/${gameToUpdate.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...gameToUpdate,
        password: newPassword
      })
    });
    
    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error('❌ Erro ao atualizar:', errorText);
      return;
    }
    
    const updatedGame = await updateResponse.json();
    console.log('✅ Jogo atualizado com sucesso!');
    console.log(`  Nova senha no response: ${updatedGame.password}`);
    
    // 4. Buscar novamente para verificar
    console.log('\n🔍 Buscando jogo atualizado para verificar...');
    const verifyResponse = await fetch(`${API_URL}/games/${gameToUpdate.id}`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!verifyResponse.ok) {
      console.error('❌ Erro ao buscar jogo:', await verifyResponse.text());
      return;
    }
    
    const verifiedGame = await verifyResponse.json();
    console.log(`✅ Jogo buscado novamente`);
    console.log(`  Senha verificada: ${verifiedGame.password}`);
    
    if (verifiedGame.password === newPassword) {
      console.log('\n✅ SUCESSO! A atualização está funcionando corretamente!');
    } else {
      console.log('\n❌ ERRO! A senha não foi atualizada no banco de dados!');
      console.log(`  Esperado: ${newPassword}`);
      console.log(`  Recebido: ${verifiedGame.password}`);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

// Executar o teste
testUpdateGame();
