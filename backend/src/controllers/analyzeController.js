const db                = require('../models/db');
const { analisarTecnico, extrairDominio } = require('../services/technicalAnalysis');
const { analisarConteudo }                = require('../services/aiAnalysis');
const { calcularComunidade }              = require('../services/communityAnalysis');
const trustScore                          = require('../services/trustScore');

// POST /analyze
// Body: { url, titulo, conteudo }
// Header Authorization: Bearer <token> (opcional — se presente, salva histórico)
async function analisar(req, res) {
  const { url, titulo = '', conteudo = '' } = req.body;

  if (!url) {
    return res.status(400).json({ erro: 'O campo "url" é obrigatório.' });
  }

  try {
    const dominio = extrairDominio(url);
    if (!dominio) {
      return res.status(400).json({ erro: 'URL inválida.' });
    }

    const [resultadoTecnico, resultadoIa] = await Promise.all([
      analisarTecnico(url),
      analisarConteudo({ titulo, conteudo }),
    ]);

    const { scoreComunidade, fatoresComunidade } = await calcularComunidade(dominio);

    const resultado = trustScore.montar({
      scoreTecnico:       resultadoTecnico.score,
      fatoresTecnicos:    resultadoTecnico.fatores,
      scoreIa:            resultadoIa.score,
      fatoresIa:          resultadoIa.fatores,
      scoreComunidade,
      fatoresComunidade,
    });

    if (req.usuario) {
      await db.query(
        `INSERT INTO analises (usuario_id, url, titulo, score, veredicto, detalhe, analisado_em)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [
          req.usuario.id,
          url,
          titulo || null,
          resultado.score,
          resultado.veredicto,
          JSON.stringify(resultado.breakdown),
        ]
      );
    }

    return res.json({ dominio, ...resultado });

  } catch (err) {
    console.error('[analyzeController] Erro:', err.message);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
}

// GET /analises
// Requer autenticação. Retorna as últimas 50 análises do usuário.
async function historico(req, res) {
  try {
    const result = await db.query(
      `SELECT id, url, titulo, score, veredicto, analisado_em
       FROM analises
       WHERE usuario_id = $1
       ORDER BY analisado_em DESC
       LIMIT 50`,
      [req.usuario.id]
    );
    return res.json({ analises: result.rows });
  } catch (err) {
    console.error('[analyzeController] Erro ao buscar histórico:', err.message);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
}

module.exports = { analisar, historico };
