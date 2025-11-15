import { createClient } from '@supabase/supabase-js';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MONGO_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017';
const MONGO_DB_NAME = process.env.MONGODB_DB_NAME || 'gameflix';

const EXPORT_DIR = './supabase-export';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const TABLES = [
  'games',
  'profiles',
  'subscription_plans',
  'subscriptions',
  'user_game_selections',
  'user_roles'
];

async function exportTableToJSON(tableName) {
  console.log(`\n📥 Exportando tabela: ${tableName}...`);
  
  let allData = [];
  let page = 0;
  const pageSize = 1000;
  
  while (true) {
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact' })
      .range(page * pageSize, (page + 1) * pageSize - 1);
    
    if (error) {
      console.error(`❌ Erro ao exportar ${tableName}:`, error.message);
      break;
    }
    
    if (data && data.length > 0) {
      allData = allData.concat(data);
      console.log(`   ✓ Página ${page + 1}: ${data.length} registros`);
    }
    
    if (!data || data.length < pageSize) {
      break;
    }
    
    page++;
  }
  
  if (allData.length > 0) {
    const filePath = path.join(EXPORT_DIR, `${tableName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(allData, null, 2));
    console.log(`✅ Exportado ${allData.length} registros para ${filePath}`);
  } else {
    console.log(`⚠️  Nenhum registro encontrado em ${tableName}`);
  }
  
  return allData;
}

async function exportAllTables() {
  console.log('🚀 Iniciando exportação do Supabase...\n');
  console.log(`URL: ${SUPABASE_URL}`);
  console.log(`Diretório de exportação: ${EXPORT_DIR}\n`);
  
  if (!fs.existsSync(EXPORT_DIR)) {
    fs.mkdirSync(EXPORT_DIR, { recursive: true });
  }
  
  const exportedData = {};
  
  for (const tableName of TABLES) {
    exportedData[tableName] = await exportTableToJSON(tableName);
  }
  
  const summaryPath = path.join(EXPORT_DIR, '_export_summary.json');
  const summary = {
    exportDate: new Date().toISOString(),
    supabaseUrl: SUPABASE_URL,
    tables: Object.keys(exportedData).map(table => ({
      name: table,
      records: exportedData[table].length
    }))
  };
  
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  
  console.log('\n✅ Exportação concluída!');
  console.log(`📊 Resumo salvo em: ${summaryPath}`);
  
  return exportedData;
}

async function importToMongoDB(exportedData) {
  console.log('\n🚀 Iniciando importação para MongoDB...\n');
  console.log(`URL: ${MONGO_URL}`);
  console.log(`Database: ${MONGO_DB_NAME}\n`);
  
  const client = new MongoClient(MONGO_URL);
  
  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB\n');
    
    const db = client.db(MONGO_DB_NAME);
    
    for (const tableName of TABLES) {
      const data = exportedData[tableName];
      
      if (!data || data.length === 0) {
        console.log(`⚠️  Pulando ${tableName} (sem dados)`);
        continue;
      }
      
      console.log(`📥 Importando ${tableName}...`);
      
      const collection = db.collection(tableName);
      
      await collection.deleteMany({});
      console.log(`   ✓ Coleção ${tableName} limpa`);
      
      const result = await collection.insertMany(data);
      console.log(`✅ Importados ${result.insertedCount} documentos em ${tableName}`);
    }
    
    console.log('\n✅ Importação para MongoDB concluída!');
    
    console.log('\n📊 Resumo das coleções:');
    for (const tableName of TABLES) {
      const collection = db.collection(tableName);
      const count = await collection.countDocuments();
      console.log(`   - ${tableName}: ${count} documentos`);
    }
    
  } catch (error) {
    console.error('❌ Erro ao importar para MongoDB:', error);
    throw error;
  } finally {
    await client.close();
    console.log('\n🔌 Conexão com MongoDB fechada');
  }
}

async function main() {
  try {
    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║   MIGRAÇÃO: SUPABASE CLOUD → MONGODB LOCAL          ║');
    console.log('╚══════════════════════════════════════════════════════╝\n');
    
    const exportedData = await exportAllTables();
    
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question('\n❓ Deseja importar os dados para o MongoDB agora? (s/n): ', async (answer) => {
      if (answer.toLowerCase() === 's' || answer.toLowerCase() === 'sim') {
        await importToMongoDB(exportedData);
      } else {
        console.log('\n⏸️  Importação cancelada. Os arquivos JSON foram salvos em:', EXPORT_DIR);
        console.log('   Você pode importá-los manualmente depois executando:');
        console.log('   node export-supabase-to-mongodb.js --import-only');
      }
      rl.close();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('\n❌ Erro durante a migração:', error);
    process.exit(1);
  }
}

async function importOnlyFromFiles() {
  console.log('🚀 Importando dados dos arquivos JSON...\n');
  
  const exportedData = {};
  
  for (const tableName of TABLES) {
    const filePath = path.join(EXPORT_DIR, `${tableName}.json`);
    
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      exportedData[tableName] = JSON.parse(fileContent);
      console.log(`✓ Arquivo carregado: ${tableName}.json (${exportedData[tableName].length} registros)`);
    } else {
      console.log(`⚠️  Arquivo não encontrado: ${filePath}`);
      exportedData[tableName] = [];
    }
  }
  
  await importToMongoDB(exportedData);
}

if (process.argv.includes('--import-only')) {
  importOnlyFromFiles();
} else {
  main();
}
