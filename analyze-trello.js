/**
 * Script para Analisar a estrutura do Trello
 * Identifica as listas de jogos e suas características
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TRELLO_JSON_PATH = path.join(__dirname, 'trelo-bMxrji3D - gamingflix-backup.json');

console.log('📖 Lendo arquivo JSON do Trello...\n');
const trelloData = JSON.parse(fs.readFileSync(TRELLO_JSON_PATH, 'utf8'));

console.log(`📋 Board: ${trelloData.name}`);
console.log(`📊 Total de listas: ${trelloData.lists.length}`);
console.log(`🎴 Total de cards: ${trelloData.cards.length}\n`);

console.log('=' .repeat(70));
console.log('📁 LISTAS ENCONTRADAS:\n');

const listsMap = {};
trelloData.lists.forEach(list => {
  listsMap[list.id] = list.name;
  console.log(`   ${list.name}`);
});

console.log('\n' + '='.repeat(70));
console.log('🎮 ANÁLISE DAS LISTAS DE JOGOS:\n');

// Identificar listas de jogos
const gameListNames = ['Games Offline', 'Games Online', 'GamePacks'];
const gameLists = trelloData.lists.filter(list => 
  gameListNames.some(name => list.name.includes(name))
);

gameLists.forEach(list => {
  const cardsInList = trelloData.cards.filter(card => card.idList === list.id);
  console.log(`\n📂 ${list.name} (${cardsInList.length} cards)`);
  console.log('-'.repeat(70));
  
  cardsInList.forEach((card, index) => {
    console.log(`   ${index + 1}. ${card.name}`);
    
    // Mostrar preview da descrição
    if (card.desc && card.desc.length > 0) {
      const preview = card.desc.substring(0, 150).replace(/\n/g, ' ');
      console.log(`      📝 ${preview}...`);
    }
  });
});

console.log('\n' + '='.repeat(70));
console.log('📊 RESUMO:\n');

const totalGameCards = gameLists.reduce((sum, list) => {
  return sum + trelloData.cards.filter(card => card.idList === list.id).length;
}, 0);

console.log(`   🎮 Total de jogos a importar: ${totalGameCards}`);
console.log(`   📋 Listas de jogos: ${gameLists.length}`);

// Salvar análise em arquivo
const analysis = {
  boardName: trelloData.name,
  totalLists: trelloData.lists.length,
  totalCards: trelloData.cards.length,
  gameLists: gameLists.map(list => ({
    name: list.name,
    id: list.id,
    cardsCount: trelloData.cards.filter(card => card.idList === list.id).length,
    cards: trelloData.cards
      .filter(card => card.idList === list.id)
      .map(card => ({
        name: card.name,
        hasDescription: !!card.desc,
        descriptionLength: card.desc ? card.desc.length : 0
      }))
  })),
  totalGameCards
};

fs.writeFileSync('trello-analysis.json', JSON.stringify(analysis, null, 2));
console.log('\n✅ Análise salva em: trello-analysis.json');