
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Erro ao conectar ao Supabase:', err.message);
    process.exit(1); // Para o servidor se o banco não conectar
  }
  console.log('✅ Supabase conectado com sucesso!');
  release();
});

module.exports = pool;