const db                = require('../models/db');
const { analisarTecnico, extrairDominio } = require('../services/technicalAnalysis');
const { analisarConteudo }                = require('../services/aiAnalysis');
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

    const votosResult = await db.query(
      `SELECT
         COUNT(*) FILTER (WHERE voto = 'confiavel') AS confiavel,
         COUNT(*) FILTER (WHERE voto = 'suspeito')  AS suspeito,
         COUNT(*) FILTER (WHERE voto = 'golpe')     AS golpe,
         COUNT(*)                                   AS total
       FROM votos WHERE dominio = $1`,
      [dominio]
    );

    const votos = votosResult.rows[0];
    const totalVotos = parseInt(votos.total);
    let scoreComunidade = 50;
    const fatoresComunidade = [];

    if (totalVotos > 0) {
      const confiavel = parseInt(votos.confiavel);
      const golpe     = parseInt(votos.golpe);
      const suspeito  = parseInt(votos.suspeito);
      scoreComunidade = Math.round((confiavel / totalVotos) * 100);

      if (confiavel > 0)
        fatoresComunidade.push({ fator: `Comunidade: ${confiavel} voto(s) confiável`, impacto: `+${Math.round((confiavel / totalVotos) * 35)}` });
      if (suspeito > 0)
        fatoresComunidade.push({ fator: `Comunidade: ${suspeito} voto(s) suspeito`, impacto: `-${Math.round((suspeito / totalVotos) * 20)}` });
      if (golpe > 0)
        fatoresComunidade.push({ fator: `Comunidade: ${golpe} relato(s) de golpe`, impacto: `-${Math.round((golpe / totalVotos) * 35)}` });
    } else {
      fatoresComunidade.push({ fator: 'Sem votos da comunidade ainda', impacto: '0' });
    }

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

module.exports = { analisar };
