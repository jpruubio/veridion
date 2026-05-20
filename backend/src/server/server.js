// ============================================================
//  Veridion — src/server.js
//  Arquivo principal. Inicia o servidor Express.
// ============================================================

require('dotenv').config();
const express        = require('express');
const cors           = require('cors');
const helmet         = require('helmet');
const authRoutes     = require('../routes/authRoutes');
const analyzeRoutes  = require('../routes/analyzeRoutes');
const voteRoutes     = require('../routes/voteRoutes');
const reportRoutes   = require('../routes/reportRoutes');
const domainRoutes   = require('../routes/domainRoutes');
const paginaRoutes   = require('../routes/paginaRoutes');

const app  = express();
const PORT = process.env.PORT || 3000;

// ------------------------------------------------------------
//  Middlewares globais
// ------------------------------------------------------------

app.use(helmet());

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
}));

app.use(express.json());

// ------------------------------------------------------------
//  Rotas
// ------------------------------------------------------------

app.use('/', authRoutes);
app.use('/', analyzeRoutes);
app.use('/', voteRoutes);
app.use('/', reportRoutes);
app.use('/', domainRoutes);
app.use('/', paginaRoutes);

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