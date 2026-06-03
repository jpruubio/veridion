const db = require('../models/db');

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

module.exports = { historico };
