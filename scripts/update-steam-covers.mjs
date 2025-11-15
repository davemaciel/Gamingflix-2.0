// scripts/update-steam-covers.mjs
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Defina VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env antes de rodar o script.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const STEAM_SEARCH_ENDPOINT = 'https://steamcommunity.com/actions/SearchApps/';
const STEAM_APP_DETAILS_ENDPOINT = 'https://store.steampowered.com/api/appdetails';

async function fetchSteamAppId(gameTitle) {
  const response = await fetch(`${STEAM_SEARCH_ENDPOINT}${encodeURIComponent(gameTitle)}`);
  if (!response.ok) throw new Error(`Falha ao pesquisar "${gameTitle}" na Steam`);
  const results = await response.json();

  if (!Array.isArray(results) || results.length === 0) return null;
  // Pega o primeiro resultado (ajuste se precisar de lógica mais avançada)
  return results[0].appid;
}

async function resolveBestCover(appId) {
  const cdnBase = `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}`;
  const candidates = [
    `${cdnBase}/library_600x900.jpg`, // imagem 600x900 (quase quadrada)
    `${cdnBase}/library_hero.jpg`,    // hero art
    `${cdnBase}/header.jpg`           // header padrão
  ];

  for (const url of candidates) {
    const head = await fetch(url, { method: 'HEAD' });
    if (head.ok) return url;
  }
  return null;
}

async function updateGameCover(game) {
  try {
    const appId = await fetchSteamAppId(game.title);
    if (!appId) {
      console.warn(⚠️  Não encontrei app id para "${game.title}".`);
      return { updated: false };
    }

    const coverUrl = await resolveBestCover(appId);
    if (!coverUrl) {
      console.warn(`⚠️  Não encontrei capa para "${game.title}" (app ${appId}).`);
      return { updated: false };
    }

    if (coverUrl === game.cover_url) {
      console.log(`ℹ️  "${game.title}" já está com a capa correta.`);
      return { updated: false };
    }

    const { error } = await supabase
      .from('games')
      .update({ cover_url: coverUrl })
      .eq('id', game.id);

    if (error) throw error;

    console.log(`✅ "${game.title}" -> ${coverUrl}`);
    return { updated: true };
  } catch (err) {
    console.error(`❌ Erro ao atualizar "${game.title}":`, err.message);
    return { updated: false, error: err };
  }
}

async function main() {
  console.log('🔍 Buscando jogos no Supabase...');
  const { data: games, error } = await supabase
    .from('games')
    .select('id, title, cover_url');

  if (error) {
    console.error('Erro ao listar jogos:', error.message);
    process.exit(1);
  }

  let updatedCount = 0;
  for (const game of games) {
    const result = await updateGameCover(game);
    if (result.updated) updatedCount++;
  }

  console.log('\n📦 Processo concluído!');
  console.log(`Jogos atualizados: ${updatedCount}/${games.length}`);
}

main().catch((err) => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
