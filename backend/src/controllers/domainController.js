const db                 = require('../models/db');
const { extrairDominio } = require('../services/technicalAnalysis');

// GET /domain?url=https://exemplo.com
// Sem autenticação. Retorna votos e último score público do domínio.
async function consultarDominio(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ erro: 'O parâmetro "url" é obrigatório.' });
  }

  const dominio = extrairDominio(url);
  if (!dominio) {
    return res.status(400).json({ erro: 'URL inválida.' });
  }

  try {
    const [votosResult, analiseResult] = await Promise.all([
      db.query(
        `SELECT
           COUNT(*) FILTER (WHERE voto = 'confiavel') AS confiavel,
           COUNT(*) FILTER (WHERE voto = 'suspeito')  AS suspeito,
           COUNT(*) FILTER (WHERE voto = 'golpe')     AS golpe,
           COUNT(*)                                   AS total
         FROM votos WHERE dominio = $1`,
        [dominio]
      ),
      db.query(
        `SELECT score, veredicto, analisado_em
         FROM analises
         WHERE url LIKE $1
         ORDER BY analisado_em DESC
         LIMIT 1`,
        [`%${dominio}%`]
      ),
    ]);

    const v = votosResult.rows[0];
    const ultimoScore = analiseResult.rows[0] || null;

    return res.json({
      dominio,
      votos: {
        confiavel: parseInt(v.confiavel),
        suspeito:  parseInt(v.suspeito),
        golpe:     parseInt(v.golpe),
        total:     parseInt(v.total),
      },
      ultimoScore,
    });

  } catch (err) {
    console.error('[domainController] Erro:', err.message);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
}

module.exports = { consultarDominio };
