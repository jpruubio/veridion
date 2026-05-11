// ============================================================
//  Veridion — src/server.js
//  Arquivo principal. Inicia o servidor Express.
// ============================================================

require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const authRoutes = require('../routes/authRoutes');

const app  = express();
const PORT = process.env.PORT || 3000;

// ------------------------------------------------------------
//  Middlewares globais
// ------------------------------------------------------------

// Libera requisições da extensão Chrome (origem diferente)
app.use(cors({
  origin: '*', // Em produção, troque por sua URL real
  methods: ['GET', 'POST'],
}));

// Interpreta o corpo das requisições como JSON
app.use(express.json());

// ------------------------------------------------------------
//  Rotas
// ------------------------------------------------------------

app.use('/', authRoutes);

// Rota de saúde — útil para testar se o servidor está vivo
app.get('/ping', (req, res) => {
  res.json({ status: 'ok', mensagem: 'Servidor Veridion funcionando!' });
});

// ------------------------------------------------------------
//  Inicia o servidor
// ------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});