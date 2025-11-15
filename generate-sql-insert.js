/**
 * 🎮 Gerador de SQL INSERT para JOGOS
 * Lê o JSON do Trello e gera um arquivo SQL pronto para executar no Supabase
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TRELLO_JSON_PATH = path.join(__dirname, 'trelo-bMxrji3D - gamingflix-backup.json');
const OUTPUT_SQL_PATH = path.join(__dirname, 'insert-jogos-completo.sql');
const GAME_LIST_NAMES = ['Games Offline', 'Games Online', 'GamePacks'];

// ========================================
// MAPEAMENTO DE CORES/GRADIENTES
// ========================================

const GAME_GRADIENTS = {
  'call of duty': 'from-orange-500 to-red-600',
  'cod': 'from-orange-500 to-red-600',
  'resident evil': 'from-red-600 to-black',
  're4': 'from-red-600 to-black',
  'fifa': 'from-green-500 to-blue-600',
  'fc': 'from-green-500 to-blue-600',
  'gta': 'from-purple-600 to-pink-600',
  'grand theft auto': 'from-purple-600 to-pink-600',
  'red dead': 'from-red-700 to-orange-600',
  'rdr': 'from-red-700 to-orange-600',
  'assassin': 'from-blue-600 to-gray-800',
  'spider-man': 'from-red-600 to-blue-600',
  'spiderman': 'from-red-600 to-blue-600',
  'god of war': 'from-red-600 to-gray-900',
  'hogwarts': 'from-purple-600 to-yellow-600',
  'harry potter': 'from-purple-600 to-yellow-600',
  'elden ring': 'from-yellow-600 to-gray-800',
  'dark souls': 'from-gray-700 to-black',
  'cyberpunk': 'from-yellow-400 to-pink-600',
  'the witcher': 'from-gray-700 to-red-800',
  'fallout': 'from-green-600 to-yellow-500',
  'skyrim': 'from-blue-400 to-gray-700',
  'minecraft': 'from-green-500 to-brown-600',
  'fortnite': 'from-purple-500 to-blue-400',
  'valorant': 'from-red-500 to-black',
  'league of legends': 'from-blue-600 to-gold',
  'lol': 'from-blue-600 to-gold',
  'overwatch': 'from-orange-500 to-blue-500',
  'apex': 'from-red-600 to-orange-500',
  'destiny': 'from-blue-500 to-purple-600',
  'halo': 'from-green-600 to-blue-700',
  'battlefield': 'from-blue-800 to-orange-600',
  'far cry': 'from-orange-600 to-red-700',
  'tomb raider': 'from-brown-600 to-gray-700',
  'uncharted': 'from-yellow-600 to-blue-600',
  'the last of us': 'from-green-700 to-gray-800',
  'tlou': 'from-green-700 to-gray-800',
  'horizon': 'from-blue-500 to-orange-600',
  'ghost of tsushima': 'from-red-600 to-yellow-500',
  'mortal kombat': 'from-yellow-500 to-red-700',
  'street fighter': 'from-blue-600 to-red-600',
  'tekken': 'from-purple-600 to-red-600',
  'dragon ball': 'from-orange-500 to-blue-500',
  'naruto': 'from-orange-500 to-blue-600',
  'pokemon': 'from-red-500 to-yellow-400',
  'zelda': 'from-green-500 to-blue-500',
  'mario': 'from-red-500 to-blue-500',
  'sonic': 'from-blue-500 to-cyan-400',
  'final fantasy': 'from-purple-600 to-blue-700',
  'metal gear': 'from-gray-700 to-green-700',
  'silent hill': 'from-gray-600 to-red-800',
  'default': 'from-blue-600 to-purple-600'
};

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

function fixEncoding(text) {
  if (!text) return text;
  
  const replacements = {
    'Ã¡': 'á', 'Ã©': 'é', 'Ã­': 'í', 'Ã³': 'ó', 'Ãº': 'ú',
    'Ã': 'à', 'Ã¨': 'è', 'Ã¬': 'ì', 'Ã²': 'ò', 'Ã¹': 'ù',
    'Ã£': 'ã', 'Ãµ': 'õ', 'Ã§': 'ç',
    'Ã': 'Á', 'Ã‰': 'É', 'Ã': 'Í', 'Ã"': 'Ó', 'Ãš': 'Ú',
    'Ãƒ': 'Ã', 'Ã•': 'Õ', 'Ã‡': 'Ç',
    'Â°': '°', 'âº': 'º', 'Âª': 'ª'
  };
  
  let fixed = text;
  for (const [wrong, correct] of Object.entries(replacements)) {
    fixed = fixed.replace(new RegExp(wrong, 'g'), correct);
  }
  
  return fixed;
}

function getGradientForGame(title) {
  const lowerTitle = title.toLowerCase();
  
  for (const [keyword, gradient] of Object.entries(GAME_GRADIENTS)) {
    if (lowerTitle.includes(keyword)) {
      return gradient;
    }
  }
  
  return GAME_GRADIENTS.default;
}

function extractCredentials(description) {
  const fixedDesc = fixEncoding(description);
  
  const credentials = {
    login: '',
    password: '',
    familyCode: '',
    platform: ''
  };

  // Detectar plataforma
  const platformPatterns = [
    { pattern: /Steam|STEAM/i, name: 'Steam' },
    { pattern: /Battlenet|Battle\.net/i, name: 'Battle.net' },
    { pattern: /Rockstar|Social Club/i, name: 'Rockstar' },
    { pattern: /Ubisoft|Uplay/i, name: 'Ubisoft' },
    { pattern: /Epic Games|EPIC/i, name: 'Epic Games' },
    { pattern: /EA|Origin/i, name: 'EA/Origin' },
    { pattern: /PlayStation|PSN|PS4|PS5/i, name: 'PlayStation' },
    { pattern: /Xbox/i, name: 'Xbox' }
  ];

  for (const { pattern, name } of platformPatterns) {
    if (pattern.test(fixedDesc)) {
      credentials.platform = name;
      break;
    }
  }

  // Padrões para Login/Email/Usuário
  const loginPatterns = [
    /\*\*Login:\*\*\s*(.+?)(?:\n|\r|$)/i,
    /\*\*Email:\*\*\s*(.+?)(?:\n|\r|$)/i,
    /\*\*Usuário:\*\*\s*(.+?)(?:\n|\r|$)/i,
    /\*\*Usuario:\*\*\s*(.+?)(?:\n|\r|$)/i,
    /usuario[\s:]+(.+?)(?:\n|\r|senha)/i,
    /user[\s:]+(.+?)(?:\n|\r|password)/i,
    /login[\s:]+(.+?)(?:\n|\r|senha)/i,
    /email[\s:]+([^\s\n]+@[^\s\n]+)/i,
  ];

  // Padrões para Senha/Password
  const passwordPatterns = [
    /\*\*Senha:\*\*\s*(.+?)(?:\n|\r|$)/i,
    /\*\*Password:\*\*\s*(.+?)(?:\n|\r|$)/i,
    /senha[\s:]+(.+?)(?:\n|\r|$)/i,
    /password[\s:]+(.+?)(?:\n|\r|$)/i,
    /pass[\s:]+(.+?)(?:\n|\r|$)/i,
  ];

  // Padrões para Código Familiar
  const familyCodePatterns = [
    /\*\*Código Familiar:\*\*\s*(.+?)(?:\n|\r|$)/i,
    /\*\*Codigo Familiar:\*\*\s*(.+?)(?:\n|\r|$)/i,
    /código familiar[\s:]+(.+?)(?:\n|\r|$)/i,
    /codigo familiar[\s:]+(.+?)(?:\n|\r|$)/i,
    /family code[\s:]+(.+?)(?:\n|\r|$)/i,
  ];

  // Tentar extrair login
  for (const pattern of loginPatterns) {
    const match = fixedDesc.match(pattern);
    if (match) {
      credentials.login = match[1].trim();
      break;
    }
  }

  // Tentar extrair senha
  for (const pattern of passwordPatterns) {
    const match = fixedDesc.match(pattern);
    if (match) {
      credentials.password = match[1].trim();
      break;
    }
  }

  // Tentar extrair código familiar
  for (const pattern of familyCodePatterns) {
    const match = fixedDesc.match(pattern);
    if (match) {
      credentials.familyCode = match[1].trim();
      break;
    }
  }

  return credentials;
}

function escapeSQLString(str) {
  if (!str) return '';
  return str.replace(/'/g, "''").replace(/\\/g, '\\\\');
}

// ========================================
// PROCESSAMENTO PRINCIPAL
// ========================================

console.log('🎮 Iniciando geração de SQL...\n');

// Ler o JSON do Trello
const trelloData = JSON.parse(fs.readFileSync(TRELLO_JSON_PATH, 'utf-8'));

// Filtrar apenas listas de jogos
const gameLists = trelloData.lists.filter(list => 
  GAME_LIST_NAMES.includes(list.name)
);

const gameListIds = gameLists.map(list => list.id);

// Filtrar cards das listas de jogos
const gameCards = trelloData.cards.filter(card => 
  gameListIds.includes(card.idList) && !card.closed
);

console.log(`📊 Total de jogos encontrados: ${gameCards.length}`);
console.log(`📋 Listas processadas: ${gameLists.map(l => l.name).join(', ')}\n`);

// Gerar SQL
let sqlContent = `-- ========================================
-- 🎮 IMPORTAÇÃO DE JOGOS - GameFlix Catalog
-- ========================================
-- Total de jogos: ${gameCards.length}
-- Gerado em: ${new Date().toISOString()}
-- ========================================

`;

let successCount = 0;

gameCards.forEach((card, index) => {
  try {
    const title = fixEncoding(card.name);
    const description = fixEncoding(card.desc || '');
    const gradient = getGradientForGame(title);
    const credentials = extractCredentials(description);
    
    // Determinar tipo
    const listName = gameLists.find(l => l.id === card.idList)?.name || '';
    let gameType = 'OFFLINE';
    if (listName === 'Games Online') gameType = 'ONLINE';
    if (listName === 'GamePacks') gameType = 'PACK';
    
    // Gerar slug
    const slug = title.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    // Construir INSERT
    sqlContent += `-- Jogo ${index + 1}: ${title}\n`;
    sqlContent += `INSERT INTO public.games (\n`;
    sqlContent += `  title, slug, description, cover_url, gradient_class,\n`;
    sqlContent += `  game_type, platform, login, password, family_code,\n`;
    sqlContent += `  is_available, featured, created_at, updated_at\n`;
    sqlContent += `) VALUES (\n`;
    sqlContent += `  '${escapeSQLString(title)}',\n`;
    sqlContent += `  '${escapeSQLString(slug)}',\n`;
    sqlContent += `  '${escapeSQLString(description)}',\n`;
    sqlContent += `  '/covers/${escapeSQLString(slug)}.jpg',\n`;
    sqlContent += `  '${escapeSQLString(gradient)}',\n`;
    sqlContent += `  '${gameType}',\n`;
    sqlContent += `  ${credentials.platform ? `'${escapeSQLString(credentials.platform)}'` : 'NULL'},\n`;
    sqlContent += `  ${credentials.login ? `'${escapeSQLString(credentials.login)}'` : 'NULL'},\n`;
    sqlContent += `  ${credentials.password ? `'${escapeSQLString(credentials.password)}'` : 'NULL'},\n`;
    sqlContent += `  ${credentials.familyCode ? `'${escapeSQLString(credentials.familyCode)}'` : 'NULL'},\n`;
    sqlContent += `  true,\n`;
    sqlContent += `  false,\n`;
    sqlContent += `  NOW(),\n`;
    sqlContent += `  NOW()\n`;
    sqlContent += `);\n\n`;
    
    successCount++;
  } catch (error) {
    console.error(`❌ Erro ao processar jogo: ${card.name}`, error.message);
  }
});

sqlContent += `-- ========================================
-- ✅ Importação concluída!
-- Total de jogos inseridos: ${successCount}
-- ========================================
`;

// Salvar arquivo SQL
fs.writeFileSync(OUTPUT_SQL_PATH, sqlContent, 'utf-8');

console.log(`✅ Arquivo SQL gerado com sucesso!`);
console.log(`📁 Localização: ${OUTPUT_SQL_PATH}`);
console.log(`🎮 Total de jogos: ${successCount}/${gameCards.length}`);
console.log(`\n🚀 Próximos passos:`);
console.log(`1. Abra o Supabase Dashboard → SQL Editor`);
console.log(`2. Copie e cole o conteúdo de: insert-jogos-completo.sql`);
console.log(`3. Execute o SQL`);
console.log(`4. Pronto! Todos os jogos estarão importados! 🎉`);