const { Pool } = require('pg');
require('dotenv').config();

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL não configurada. Verifique o arquivo .env.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Erros em clientes ociosos do pool não devem derrubar o processo —
// o pool se recupera sozinho na próxima requisição.
pool.on('error', (err) => {
  console.error('[db] Erro no pool de conexões:', err.message);
});

module.exports = pool;
