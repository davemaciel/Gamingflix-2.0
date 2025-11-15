/**
 * 🎮 Script de Importação de JOGOS do Trello para Supabase
 * GameFlix Catalog
 * 
 * Este script processa o JSON exportado do Trello e importa APENAS OS JOGOS
 * (ignora dados de clientes e outras listas)
 * 
 * Listas processadas:
 * - Games Offline
 * - Games Online  
 * - GamePacks
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente
config();

// ========================================
// CONFIGURAÇÃO
// ========================================

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_KEY = SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL) {
  console.error('❌ Erro: Variáveis de ambiente não configuradas!');
  console.error('Defina VITE_SUPABASE_URL no arquivo .env');
  process.exit(1);
}

if (!SUPABASE_KEY) {
  console.error('❌ Erro: Variáveis de ambiente não configuradas!');
  console.error('Defina SUPABASE_SERVICE_ROLE_KEY (recomendado) ou VITE_SUPABASE_PUBLISHABLE_KEY no arquivo .env');
  process.exit(1);
}

if (SUPABASE_SERVICE_ROLE_KEY) {
  console.log('🔐 Usando SUPABASE_SERVICE_ROLE_KEY para a importação (apenas em ambiente seguro).');
} else {
  console.log('⚠️ Sem SUPABASE_SERVICE_ROLE_KEY detectada. Usando VITE_SUPABASE_PUBLISHABLE_KEY, sujeito às políticas RLS.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const TRELLO_JSON_PATH = path.join(__dirname, 'trelo-bMxrji3D - gamingflix-backup.json');

// Listas que contêm JOGOS (ignorar listas de clientes)
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

/**
 * Corrige caracteres UTF-8 mal codificados (CÃ³digo -> Código)
 */
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

/**
 * Determina o gradiente baseado no título do jogo
 */
function getGradientForGame(title) {
  const lowerTitle = title.toLowerCase();
  
  for (const [keyword, gradient] of Object.entries(GAME_GRADIENTS)) {
    if (lowerTitle.includes(keyword)) {
      return gradient;
    }
  }
  
  return GAME_GRADIENTS.default;
}

/**
 * Extrai credenciais do texto de descrição (com correção de encoding)
 */
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

  // Padrões para Senha
  const passwordPatterns = [
    /\*\*Senha:\*\*\s*(.+?)(?:\n|\r|$)/i,
    /\*\*Password:\*\*\s*(.+?)(?:\n|\r|$)/i,
    /senha[\s:]+(.+?)(?:\n|\r|\s{2,}|$)/i,
    /password[\s:]+(.+?)(?:\n|\r|\s{2,}|$)/i,
  ];

  // Padrões para Código Família
  const familyCodePatterns = [
    /\*\*Código do Modo Família:\*\*\s*(.+?)(?:\n|\r|$)/i,
    /código\s+(?:do\s+)?(?:modo\s+)?família[\s:]+(\d+)/i,
    /codigo\s+(?:do\s+)?(?:modo\s+)?familia[\s:]+(\d+)/i,
    /family\s+code[\s:]+(\d+)/i,
    /modo\s+família[\s:]+(\d+)/i,
  ];

  // Extrair Login
  for (const pattern of loginPatterns) {
    const match = fixedDesc.match(pattern);
    if (match && match[1]) {
      credentials.login = match[1].trim().replace(/\s+/g, ' ');
      break;
    }
  }

  // Extrair Senha
  for (const pattern of passwordPatterns) {
    const match = fixedDesc.match(pattern);
    if (match && match[1]) {
      credentials.password = match[1].trim().split(/\s{2,}/)[0];
      break;
    }
  }

  // Extrair Código Família
  for (const pattern of familyCodePatterns) {
    const match = fixedDesc.match(pattern);
    if (match && match[1]) {
      credentials.familyCode = match[1].trim();
      break;
    }
  }

  return credentials;
}

/**
 * Extrai os passos do tutorial da descrição (com correção de encoding)
 */
function extractTutorial(description) {
  const fixedDesc = fixEncoding(description);
  const tutorial = [];
  
  // Procurar por "Passo a Passo" ou variações
  const tutorialMatch = fixedDesc.match(/\*\*Passo a Passo[\s\S]*?\*\*\s*([\s\S]*?)(?:\n\n---|\*\*#|$)/i);
  
  if (tutorialMatch && tutorialMatch[1]) {
    // Dividir por numeração (1º, 2º, etc ou 1-, 2-, etc)
    const steps = tutorialMatch[1].split(/(?:\d+[ºº°]?\s*[-–]\s*)/);
    
    steps.forEach((step, index) => {
      if (index === 0 && !step.trim()) return; // Pular o primeiro se vazio
      
      const cleanStep = fixEncoding(step)
        .trim()
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/\*\*/g, '')
        .substring(0, 300); // Limitar tamanho
      
      if (cleanStep && cleanStep.length > 3) {
        const stepNumber = tutorial.length + 1;
        tutorial.push({
          step: stepNumber,
          title: cleanStep.length > 80 ? `Passo ${stepNumber}` : cleanStep.split('.')[0],
          description: cleanStep
        });
      }
    });
  }

  // Se não encontrou tutorial, criar genérico
  if (tutorial.length === 0) {
    tutorial.push({
      step: 1,
      title: 'Acesse a plataforma',
      description: 'Use as credenciais fornecidas para fazer login na plataforma do jogo.'
    });
    tutorial.push({
      step: 2,
      title: 'Baixe e instale o jogo',
      description: 'Realize o download do jogo através da biblioteca e aguarde a instalação.'
    });
    tutorial.push({
      step: 3,
      title: 'Inicie o jogo',
      description: 'Após a instalação, abra o jogo e divirta-se!'
    });
  }

  return tutorial;
}

/**
 * Gera URL de capa do jogo (placeholder ou real se existir)
 */
function getCoverUrl(gameName) {
  // Procurar por capas existentes na pasta public/covers
  const coversPath = path.join(__dirname, 'public', 'covers');
  
  const normalizedName = gameName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  const possibleExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  
  for (const ext of possibleExtensions) {
    const coverFile = `${normalizedName}${ext}`;
    const fullPath = path.join(coversPath, coverFile);
    
    if (fs.existsSync(fullPath)) {
      return `/covers/${coverFile}`;
    }
  }
  
  // Se não encontrou, retornar placeholder
  return '/placeholder.svg';
}

/**
 * Processa um card do Trello e transforma em objeto de jogo
 */
function processGameCard(card, listName) {
  const { login, password, familyCode, platform } = extractCredentials(card.desc || '');
  
  const tutorial = extractTutorial(card.desc || '');
  const gradient = getGradientForGame(card.name);
  const coverUrl = getCoverUrl(card.name);
  
  // Criar descrição mais rica
  let description = `Jogo disponível em: ${listName}`;
  if (platform) {
    description += ` | Plataforma: ${platform}`;
  }
  
  // Se não tem descrição no card, usar uma genérica
  if (!card.desc || card.desc.length < 50) {
    description = `${card.name} - Disponível para jogar através da nossa plataforma.`;
  }

  return {
    title: fixEncoding(card.name),
    cover_url: coverUrl,
    description: fixEncoding(description),
    gradient: gradient,
    login: login || 'Consultar suporte',
    password: password || 'Consultar suporte',
    family_code: familyCode || null,
    tutorial: tutorial
  };
}

// ========================================
// FUNÇÃO PRINCIPAL DE IMPORTAÇÃO
// ========================================

async function importTrelloData() {
  console.log('🚀 Iniciando importação de dados do Trello...\n');

  // 1. Ler arquivo JSON
  console.log('📖 Lendo arquivo JSON do Trello...');
  if (!fs.existsSync(TRELLO_JSON_PATH)) {
    console.error(`❌ Erro: Arquivo não encontrado: ${TRELLO_JSON_PATH}`);
    process.exit(1);
  }

  const trelloData = JSON.parse(fs.readFileSync(TRELLO_JSON_PATH, 'utf8'));
  console.log(`✅ Arquivo lido com sucesso!`);
  console.log(`   - Board: ${trelloData.name}`);
  console.log(`   - Listas: ${trelloData.lists.length}`);
  console.log(`   - Cards: ${trelloData.cards.length}\n`);

  // 2. Criar mapa de listas
  const listsMap = {};
  trelloData.lists.forEach(list => {
    listsMap[list.id] = list.name;
  });

  // 3. Filtrar APENAS listas de jogos (ignorar clientes)
  const gameLists = trelloData.lists.filter(list => 
    GAME_LIST_NAMES.some(name => list.name.includes(name))
  );

  console.log(`🎮 Listas de JOGOS identificadas: ${gameLists.length}`);
  gameLists.forEach(list => {
    const count = trelloData.cards.filter(c => c.idList === list.id).length;
    console.log(`   ✅ ${list.name} (${count} jogos)`);
  });
  console.log('');

  // 4. Processar APENAS cards de jogos
  console.log('⚙️ Processando jogos...\n');
  const gamesCards = trelloData.cards.filter(card => 
    gameLists.some(list => list.id === card.idList)
  );
  
  const gamesToInsert = [];

  gamesCards.forEach((card, index) => {
    const listName = listsMap[card.idList];
    const game = processGameCard(card, listName);
    
    gamesToInsert.push(game);
    console.log(`   ${index + 1}. ✅ ${game.title}`);
    if (game.login !== 'Consultar suporte') {
      console.log(`      🔑 Login: ${game.login.substring(0, 20)}...`);
    }
  });

  console.log(`\n📊 Resumo:`);
  console.log(`   🎮 Total de jogos processados: ${gamesToInsert.length}`);
  console.log(`   📋 Listas: ${gameLists.length}`);
  console.log('');

  // 5. Confirmar e inserir
  console.log('💾 Inserindo jogos no banco de dados Supabase...');
  console.log(`   🌐 URL: ${SUPABASE_URL}`);
  console.log(`   📦 Total: ${gamesToInsert.length} jogos\n`);

  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (let i = 0; i < gamesToInsert.length; i++) {
    const game = gamesToInsert[i];
    
    try {
      // Converter tutorial para JSON string antes de inserir
      const gameData = {
        ...game,
        tutorial: JSON.stringify(game.tutorial)
      };
      
      const { data, error } = await supabase
        .from('games')
        .insert(gameData)
        .select();

      if (error) {
        console.error(`   ❌ [${i + 1}/${gamesToInsert.length}] "${game.title}": ${error.message}`);
        errors.push({ title: game.title, error: error.message });
        errorCount++;
      } else {
        console.log(`   ✅ [${i + 1}/${gamesToInsert.length}] "${game.title}"`);
        successCount++;
      }
    } catch (err) {
      console.error(`   ❌ [${i + 1}/${gamesToInsert.length}] "${game.title}": ${err.message}`);
      errors.push({ title: game.title, error: err.message });
      errorCount++;
    }
  }

  // 6. Resumo final
  console.log('\n' + '='.repeat(70));
  console.log('🎉 IMPORTAÇÃO CONCLUÍDA!\n');
  console.log(`📊 Resultados:`);
  console.log(`   ✅ Sucesso: ${successCount} jogos`);
  console.log(`   ❌ Erros: ${errorCount} jogos`);
  console.log(`   📈 Taxa de sucesso: ${((successCount / gamesToInsert.length) * 100).toFixed(1)}%`);
  console.log('='.repeat(70) + '\n');

  // Mostrar erros se houver
  if (errors.length > 0) {
    console.log('⚠️ ERROS DETALHADOS:\n');
    errors.forEach((err, i) => {
      console.log(`${i + 1}. ${err.title}`);
      console.log(`   Erro: ${err.error}\n`);
    });
  }

  // 7. Criar log de importação
  const logData = {
    timestamp: new Date().toISOString(),
    supabaseUrl: SUPABASE_URL,
    totalGames: gamesToInsert.length,
    inserted: successCount,
    failed: errorCount,
    successRate: ((successCount / gamesToInsert.length) * 100).toFixed(2) + '%',
    errors: errors,
    games: gamesToInsert.map(g => ({
      title: g.title,
      login: g.login,
      hasPassword: !!g.password,
      hasFamilyCode: !!g.family_code,
      gradient: g.gradient,
      tutorialSteps: Array.isArray(g.tutorial) ? g.tutorial.length : 0
    }))
  };

  const logPath = path.join(__dirname, 'import-log.json');
  fs.writeFileSync(logPath, JSON.stringify(logData, null, 2), 'utf8');
  console.log(`📝 Log completo salvo em: import-log.json\n`);
  
  if (successCount === gamesToInsert.length) {
    console.log('🎮 Todos os jogos foram importados com sucesso!');
    console.log('✨ Seu catálogo está pronto para uso!\n');
  } else {
    console.log(`⚠️ ${errorCount} jogos não foram importados. Verifique o log para detalhes.\n`);
  }
}

// ========================================
// EXECUTAR
// ========================================

importTrelloData().catch(error => {
  console.error('\n❌ Erro fatal durante a importação:');
  console.error(error);
  process.exit(1);
});
