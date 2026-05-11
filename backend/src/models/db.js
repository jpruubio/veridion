// ============================================================
//  Veridion — src/models/db.js
//  Conexão com o PostgreSQL usando o pool do "pg".
//  Importe este arquivo em qualquer controller que precise
//  falar com o banco: const db = require('../models/db');
// ============================================================

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Testa a conexão ao iniciar
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Erro ao conectar ao PostgreSQL:', err.message);
  } else {
    console.log('✅ PostgreSQL conectado com sucesso!');
    release();
  }
});

module.exports = pool;