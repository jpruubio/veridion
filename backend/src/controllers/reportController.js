const db                 = require('../models/db');
const { extrairDominio } = require('../services/technicalAnalysis');

const MOTIVOS_VALIDOS = ['fake_news', 'golpe', 'site_malicioso', 'conteudo_manipulativo', 'outro'];

// POST /report
// Body: { url, motivo, descricao? }
// Requer autenticação.
async function reportar(req, res) {
  const { url, motivo, descricao = null } = req.body;

  if (!url || !motivo) {
    return res.status(400).json({ erro: 'Os campos "url" e "motivo" são obrigatórios.' });
  }

  if (!MOTIVOS_VALIDOS.includes(motivo)) {
    return res.status(400).json({ erro: `Motivo inválido. Use: ${MOTIVOS_VALIDOS.join(', ')}.` });
  }

  const dominio = extrairDominio(url);
  if (!dominio) {
    return res.status(400).json({ erro: 'URL inválida.' });
  }

  try {
    await db.query(
      `INSERT INTO denuncias (usuario_id, dominio, motivo, descricao)
       VALUES ($1, $2, $3, $4)`,
      [req.usuario.id, dominio, motivo, descricao]
    );

    return res.status(201).json({ mensagem: 'Denúncia registrada. Obrigado pela contribuição!' });

  } catch (err) {
    console.error('[reportController] Erro:', err.message);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
}

module.exports = { reportar };
