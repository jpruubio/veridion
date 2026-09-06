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
const communityRoutes = require('../routes/communityRoutes');
const imageReportRoutes = require('../routes/imageReportRoutes');
const userRoutes     = require('../routes/userRoutes');

const app  = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);

// ------------------------------------------------------------
//  Middlewares globais
// ------------------------------------------------------------

app.use(helmet());

app.use(cors());

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
app.use('/', communityRoutes);
app.use('/', imageReportRoutes);
app.use('/', userRoutes);

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