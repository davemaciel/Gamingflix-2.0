import jwt from 'jsonwebtoken';

const testGamesAPI = async () => {
  try {
    const token = jwt.sign(
      { id: '9ecdcd34-9fb0-4035-b39b-78036e379594', email: 'davimaciel.ecom@gmail.com' },
      'your-super-secret-jwt-key-change-this-in-production',
      { expiresIn: '1h' }
    );

    console.log('🔑 Token gerado:', token.substring(0, 50) + '...\n');

    const response = await fetch('http://localhost:3000/api/games', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('📡 Status:', response.status);
    
    const data = await response.json();
    
    if (Array.isArray(data)) {
      console.log('✅ Total de jogos retornados:', data.length);
      if (data.length > 0) {
        console.log('\n🎮 Primeiros 3 jogos:');
        data.slice(0, 3).forEach((game, i) => {
          console.log(`  ${i + 1}. ${game.title} (${game.id})`);
        });
      }
    } else {
      console.log('❌ Resposta:', data);
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
};

testGamesAPI();
