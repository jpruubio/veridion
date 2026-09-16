const db = require('../models/db');

const MOTIVOS_VALIDOS = ['imagem_fake', 'conteudo_inadequado', 'direitos_autorais', 'outro'];

// POST /report-image
// Body: { url_imagem, motivo }
// Requer autenticação.
async function reportarImagem(req, res) {
  const { url_imagem, motivo } = req.body;

  if (!url_imagem || !motivo) {
    return res.status(400).json({ erro: 'Os campos "url_imagem" e "motivo" são obrigatórios.' });
  }

  if (typeof url_imagem !== 'string' || !url_imagem.startsWith('http')) {
    return res.status(400).json({ erro: 'URL de imagem inválida.' });
  }

  if (!MOTIVOS_VALIDOS.includes(motivo)) {
    return res.status(400).json({ erro: `Motivo inválido. Use: ${MOTIVOS_VALIDOS.join(', ')}.` });
  }

  try {
    await db.query(
      `INSERT INTO denuncias_imagens (usuario_id, url_imagem, motivo)
       VALUES ($1, $2, $3)`,
      [req.usuario.id, url_imagem, motivo]
    );

    return res.status(201).json({ mensagem: 'Denúncia de imagem registrada com sucesso.' });
  } catch (err) {
    console.error('[imageReportController] Erro:', err.message);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
}

module.exports = { reportarImagem };
