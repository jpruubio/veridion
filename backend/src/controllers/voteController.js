const db                = require('../models/db');
const { extrairDominio } = require('../services/technicalAnalysis');

const VOTOS_VALIDOS = ['confiavel', 'suspeito', 'golpe'];

// POST /vote
// Body: { url, voto }
// Requer autenticação. Anti-spam: 1 voto por usuário por domínio (UPSERT).
// Depende de: UNIQUE (usuario_id, dominio) na tabela votos.
async function votar(req, res) {
  const { url, voto } = req.body;

  if (!url || !voto) {
    return res.status(400).json({ erro: 'Os campos "url" e "voto" são obrigatórios.' });
  }

  if (!VOTOS_VALIDOS.includes(voto)) {
    return res.status(400).json({ erro: `Voto inválido. Use: ${VOTOS_VALIDOS.join(', ')}.` });
  }

  const dominio = extrairDominio(url);
  if (!dominio) {
    return res.status(400).json({ erro: 'URL inválida.' });
  }

  try {
    await db.query(
      `INSERT INTO votos (usuario_id, dominio, voto)
       VALUES ($1, $2, $3)
       ON CONFLICT (usuario_id, dominio)
       DO UPDATE SET voto = EXCLUDED.voto, criado_em = NOW()`,
      [req.usuario.id, dominio, voto]
    );

    const contagem = await db.query(
      `SELECT
         COUNT(*) FILTER (WHERE voto = 'confiavel') AS confiavel,
         COUNT(*) FILTER (WHERE voto = 'suspeito')  AS suspeito,
         COUNT(*) FILTER (WHERE voto = 'golpe')     AS golpe
       FROM votos WHERE dominio = $1`,
      [dominio]
    );

    const { confiavel, suspeito, golpe } = contagem.rows[0];

    return res.status(201).json({
      mensagem: 'Voto registrado!',
      dominio,
      contagem: {
        confiavel: parseInt(confiavel),
        suspeito:  parseInt(suspeito),
        golpe:     parseInt(golpe),
      },
    });

  } catch (err) {
    console.error('[voteController] Erro:', err.message);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
}

module.exports = { votar };
