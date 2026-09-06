const db                 = require('../models/db');
const { extrairDominio } = require('../services/technicalAnalysis');

const MOTIVOS_VALIDOS = ['fake_news', 'golpe', 'site_malicioso', 'conteudo_manipulativo', 'outro'];

// POST /report
// Body: { url, motivo, descricao? }
// Requer autenticação.
async function reportar(req, res) {
  const { url, motivo, estrelas = 5, comentario = null } = req.body;

  if (!url || !motivo) {
    return res.status(400).json({ erro: 'Os campos "url" e "motivo" são obrigatórios.' });
  }

  if (!MOTIVOS_VALIDOS.includes(motivo)) {
    return res.status(400).json({ erro: `Motivo inválido. Use: ${MOTIVOS_VALIDOS.join(', ')}.` });
  }

  const starsVal = parseInt(estrelas);
  if (isNaN(starsVal) || starsVal < 1 || starsVal > 5) {
    return res.status(400).json({ erro: 'O campo "estrelas" deve ser um número inteiro entre 1 e 5.' });
  }

  const dominio = extrairDominio(url);
  if (!dominio) {
    return res.status(400).json({ erro: 'URL inválida.' });
  }

  try {
    const userResult = await db.query('SELECT nome_completo FROM usuarios WHERE id = $1', [req.usuario.id]);
    const nome_usuario = userResult.rows[0]?.nome_completo || 'Anônimo';

    await db.query(
      `INSERT INTO denuncias (usuario_id, dominio, motivo, estrelas, comentario, nome_usuario, respondido)
       VALUES ($1, $2, $3, $4, $5, $6, FALSE)`,
      [req.usuario.id, dominio, motivo, starsVal, comentario, nome_usuario]
    );

    return res.status(201).json({ mensagem: 'Denúncia registrada. Obrigado pela contribuição!' });

  } catch (err) {
    console.error('[reportController] Erro:', err.message);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
}

module.exports = { reportar };
