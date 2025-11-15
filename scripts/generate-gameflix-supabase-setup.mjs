import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const TRELLO_JSON_PATH = path.join(ROOT_DIR, 'trelo-bMxrji3D - gamingflix-backup.json');
const BASE_SETUP_SQL_PATH = path.join(ROOT_DIR, 'setup-completo-supabase.sql');
const OUTPUT_SQL_PATH = path.join(ROOT_DIR, 'supabase', 'gameflix-full-setup.sql');

const GAME_LIST_NAMES = new Set(['Games Offline', 'Games Online', 'GamePacks']);

const GAME_GRADIENTS = new Map([
  ['call of duty', 'from-orange-500 to-red-600'],
  ['cod', 'from-orange-500 to-red-600'],
  ['resident evil', 'from-red-600 to-black'],
  ['re4', 'from-red-600 to-black'],
  ['fifa', 'from-green-500 to-blue-600'],
  ['fc', 'from-green-500 to-blue-600'],
  ['gta', 'from-purple-600 to-pink-600'],
  ['grand theft auto', 'from-purple-600 to-pink-600'],
  ['red dead', 'from-red-700 to-orange-600'],
  ['rdr', 'from-red-700 to-orange-600'],
  ['assassin', 'from-blue-600 to-gray-800'],
  ['spider-man', 'from-red-600 to-blue-600'],
  ['spiderman', 'from-red-600 to-blue-600'],
  ['god of war', 'from-red-600 to-gray-900'],
  ['hogwarts', 'from-purple-600 to-yellow-600'],
  ['harry potter', 'from-purple-600 to-yellow-600'],
  ['elden ring', 'from-yellow-600 to-gray-800'],
  ['dark souls', 'from-gray-700 to-black'],
  ['cyberpunk', 'from-yellow-400 to-pink-600'],
  ['the witcher', 'from-gray-700 to-red-800'],
  ['fallout', 'from-green-600 to-yellow-500'],
  ['skyrim', 'from-blue-400 to-gray-700'],
  ['minecraft', 'from-green-500 to-brown-600'],
  ['fortnite', 'from-purple-500 to-blue-400'],
  ['valorant', 'from-red-500 to-black'],
  ['league of legends', 'from-blue-600 to-gold'],
  ['lol', 'from-blue-600 to-gold'],
  ['overwatch', 'from-orange-500 to-blue-500'],
  ['apex', 'from-red-600 to-orange-500'],
  ['destiny', 'from-blue-500 to-purple-600'],
  ['halo', 'from-green-600 to-blue-700'],
  ['battlefield', 'from-blue-800 to-orange-600'],
  ['far cry', 'from-orange-600 to-red-700'],
  ['tomb raider', 'from-brown-600 to-gray-700'],
  ['uncharted', 'from-yellow-600 to-blue-600'],
  ['the last of us', 'from-green-700 to-gray-800'],
  ['tlou', 'from-green-700 to-gray-800'],
  ['horizon', 'from-blue-500 to-orange-600'],
  ['ghost of tsushima', 'from-red-600 to-yellow-500'],
  ['mortal kombat', 'from-yellow-500 to-red-700'],
  ['street fighter', 'from-blue-600 to-red-600'],
  ['tekken', 'from-purple-600 to-red-600'],
  ['dragon ball', 'from-orange-500 to-blue-500'],
  ['naruto', 'from-orange-500 to-blue-600'],
  ['pokemon', 'from-red-500 to-yellow-400'],
  ['zelda', 'from-green-500 to-blue-500'],
  ['mario', 'from-red-500 to-blue-500'],
  ['sonic', 'from-blue-500 to-cyan-400'],
  ['final fantasy', 'from-purple-600 to-blue-700'],
  ['metal gear', 'from-gray-700 to-green-700'],
  ['silent hill', 'from-gray-600 to-red-800'],
]);

const DEFAULT_GRADIENT = 'from-blue-600 to-purple-600';
const DEFAULT_TUTORIAL = [
  'Acesse a plataforma com as credenciais fornecidas.',
  'Baixe o jogo dentro da biblioteca.',
  'Inicie o jogo e aproveite.',
];

function slugify(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getGradientForGame(title) {
  const lower = title.toLowerCase();
  for (const [keyword, gradient] of GAME_GRADIENTS.entries()) {
    if (lower.includes(keyword)) {
      return gradient;
    }
  }
  return DEFAULT_GRADIENT;
}

function extractCredentials(description) {
  const text = description || '';
  const credentials = {
    login: '',
    password: '',
    familyCode: '',
    platform: '',
  };

  const platformPatterns = [
    { pattern: /Steam/i, name: 'Steam' },
    { pattern: /Battlenet|Battle\.net/i, name: 'Battle.net' },
    { pattern: /Rockstar|Social Club/i, name: 'Rockstar' },
    { pattern: /Ubisoft|Uplay/i, name: 'Ubisoft' },
    { pattern: /Epic Games|EPIC/i, name: 'Epic Games' },
    { pattern: /\bEA\b|Origin/i, name: 'EA/Origin' },
    { pattern: /PlayStation|PSN|PS4|PS5/i, name: 'PlayStation' },
    { pattern: /Xbox/i, name: 'Xbox' },
  ];

  for (const { pattern, name } of platformPatterns) {
    if (pattern.test(text)) {
      credentials.platform = name;
      break;
    }
  }

  const loginPatterns = [
    /\*\*Login:\*\*\s*(.+?)(?:\n|\r|$)/i,
    /\*\*Email:\*\*\s*(.+?)(?:\n|\r|$)/i,
    /\*\*Usu[áa]rio:\*\*\s*(.+?)(?:\n|\r|$)/i,
    /usuario[\s:]+(.+?)(?:\n|\r|senha)/i,
    /user[\s:]+(.+?)(?:\n|\r|password)/i,
    /login[\s:]+(.+?)(?:\n|\r|senha)/i,
    /email[\s:]+([^\s\n]+@[^\s\n]+)/i,
  ];

  for (const pattern of loginPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      credentials.login = match[1].trim().replace(/\s+/g, ' ');
      break;
    }
  }

  const passwordPatterns = [
    /\*\*Senha:\*\*\s*(.+?)(?:\n|\r|$)/i,
    /\*\*Password:\*\*\s*(.+?)(?:\n|\r|$)/i,
    /senha[\s:]+(.+?)(?:\n|\r|\s{2,}|$)/i,
    /password[\s:]+(.+?)(?:\n|\r|\s{2,}|$)/i,
  ];

  for (const pattern of passwordPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      credentials.password = match[1].trim().split(/\s{2,}/)[0];
      break;
    }
  }

  const familyCodePatterns = [
    /\*\*C[oó]digo do Modo Fam[íi]lia:\*\*\s*(.+?)(?:\n|\r|$)/i,
    /c[oó]digo\s+(?:do\s+)?(?:modo\s+)?fam[íi]lia[\s:]+(\d+)/i,
    /codigo\s+(?:do\s+)?(?:modo\s+)?familia[\s:]+(\d+)/i,
    /family\s+code[\s:]+(\d+)/i,
    /modo\s+fam[íi]lia[\s:]+(\d+)/i,
  ];

  for (const pattern of familyCodePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      credentials.familyCode = match[1].trim();
      break;
    }
  }

  return credentials;
}

function extractTutorialSteps(description) {
  const text = description || '';
  const tutorial = [];

  const match = text.match(/\*\*Passo a Passo\*\*([\s\S]*)/i);
  if (match && match[1]) {
    const section = match[1]
      .split(/\n{2,}/)[0]
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    section.forEach((line) => {
      const cleaned = line
        .replace(/^\d+\s*[-–.)]\s*/, '')
        .replace(/^[-*•]\s*/, '')
        .replace(/\*\*/g, '')
        .trim();

      if (cleaned.length > 3) {
        tutorial.push(cleaned);
      }
    });
  }

  if (tutorial.length === 0) {
    return DEFAULT_TUTORIAL;
  }

  return tutorial;
}

function getCoverUrl(title) {
  const coversDir = path.join(ROOT_DIR, 'public', 'covers');
  const slug = slugify(title);
  const extensions = ['.jpg', '.jpeg', '.png', '.webp'];

  for (const ext of extensions) {
    const candidate = path.join(coversDir, `${slug}${ext}`);
    if (fs.existsSync(candidate)) {
      return `/covers/${slug}${ext}`;
    }
  }

  return `/covers/${slug}.jpg`;
}

function escapeSqlLiteral(value) {
  return value.replace(/'/g, "''");
}

function buildInsertStatement(game, index) {
  const tutorialJson = JSON.stringify(game.tutorial);
  const escapedTutorial = tutorialJson.replace(/'/g, "''");

  return [
    `-- Game ${index}: ${game.title}`,
    'INSERT INTO public.games (title, cover_url, description, gradient, login, password, family_code, tutorial)',
    'VALUES (',
    `  '${escapeSqlLiteral(game.title)}',`,
    `  '${escapeSqlLiteral(game.cover_url)}',`,
    `  '${escapeSqlLiteral(game.description)}',`,
    `  '${escapeSqlLiteral(game.gradient)}',`,
    `  '${escapeSqlLiteral(game.login)}',`,
    `  '${escapeSqlLiteral(game.password)}',`,
    '  NULL,',
    `  '${escapedTutorial}'::jsonb`,
    ');',
  ].join('\n');
}

function buildDescription(title, listName, platform, rawDescription) {
  if (!rawDescription || rawDescription.trim().length < 40) {
    return `${title} - Disponivel para jogar na GameFlix.`;
  }

  const base = `Jogo disponivel em: ${listName}`;
  const platformInfo = platform ? ` | Plataforma: ${platform}` : '';

  return `${base}${platformInfo}`;
}

function processCard(card, listName) {
  const title = card.name.trim();
  if (!title) {
    return null;
  }

  const { login, password, familyCode, platform } = extractCredentials(card.desc || '');
  const tutorial = extractTutorialSteps(card.desc || '');
  const gradient = getGradientForGame(title);
  const coverUrl = getCoverUrl(title);
  const description = buildDescription(title, listName, platform, card.desc || '');

  return {
    title,
    cover_url: coverUrl,
    description,
    gradient,
    login: login || 'Consultar suporte',
    password: password || 'Consultar suporte',
    family_code: familyCode ? familyCode : null,
    tutorial,
  };
}

function main() {
  if (!fs.existsSync(TRELLO_JSON_PATH)) {
    throw new Error(`Trello export not found at ${TRELLO_JSON_PATH}`);
  }

  if (!fs.existsSync(BASE_SETUP_SQL_PATH)) {
    throw new Error(`Base Supabase setup not found at ${BASE_SETUP_SQL_PATH}`);
  }

  const trelloData = JSON.parse(fs.readFileSync(TRELLO_JSON_PATH, 'utf8'));
  const listMap = new Map(trelloData.lists.map((list) => [list.id, list.name]));

  const gameCards = trelloData.cards.filter((card) => {
    const listName = listMap.get(card.idList);
    return listName && GAME_LIST_NAMES.has(listName) && !card.closed;
  });

  const games = gameCards
    .map((card) => processCard(card, listMap.get(card.idList)))
    .filter((game) => game !== null);

  const insertStatements = games
    .map((game, index) => buildInsertStatement({ ...game, tutorial: game.tutorial }, index + 1))
    .join('\n\n');

  const baseSetupSql = fs.readFileSync(BASE_SETUP_SQL_PATH, 'utf8').trim();

  const metadataComment = [
    '-- ========================================',
    '-- 9. IMPORTACAO DOS JOGOS PADRAO (DERIVADOS DO TRELLO)',
    `-- Total de jogos importados: ${games.length}`,
    `-- Gerado em: ${new Date().toISOString()}`,
    '-- ========================================',
    '',
    '-- Limpar dependencias e a tabela de jogos antes de inserir os dados padrao',
    'TRUNCATE TABLE public.user_game_selections, public.games RESTART IDENTITY;',
    '',
  ].join('\n');

  const finalSql = `${baseSetupSql}\n\n${metadataComment}${insertStatements}\n`;

  fs.writeFileSync(OUTPUT_SQL_PATH, finalSql, 'utf8');

  console.log(`Supabase setup with data generated at: ${OUTPUT_SQL_PATH}`);
  console.log(`Total games processed: ${games.length}`);
}

main();
