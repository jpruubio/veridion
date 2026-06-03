const db = require('../models/db');

// Valor de confiança por tipo de voto (0–100).
// golpe = 0: nenhuma confiança. suspeito = 25: baixa confiança. confiavel = 100: plena confiança.
const CONFIANCA_VOTO = { confiavel: 100, suspeito: 25, golpe: 0 };

async function calcularComunidade(dominio) {
  const result = await db.query(
    `SELECT
       COUNT(*) FILTER (WHERE voto = 'confiavel') AS confiavel,
       COUNT(*) FILTER (WHERE voto = 'suspeito')  AS suspeito,
       COUNT(*) FILTER (WHERE voto = 'golpe')     AS golpe,
       COUNT(*)                                   AS total
     FROM votos WHERE dominio = $1`,
    [dominio]
  );

  const votos     = result.rows[0];
  const totalVotos = parseInt(votos.total);

  if (totalVotos === 0) {
    return {
      scoreComunidade:  50,
      fatoresComunidade: [{ fator: 'Sem votos da comunidade ainda', impacto: '0' }],
      temVotos: false,
    };
  }

  const confiavel = parseInt(votos.confiavel);
  const suspeito  = parseInt(votos.suspeito);
  const golpe     = parseInt(votos.golpe);

  // Média ponderada: cada voto contribui com seu valor de confiança
  const scoreComunidade = Math.round(
    (confiavel * CONFIANCA_VOTO.confiavel +
     suspeito  * CONFIANCA_VOTO.suspeito  +
     golpe     * CONFIANCA_VOTO.golpe) / totalVotos
  );

  const fatoresComunidade = [];

  if (confiavel > 0)
    fatoresComunidade.push({
      fator:   `Comunidade: ${confiavel} voto(s) confiável`,
      impacto: `+${Math.round((confiavel / totalVotos) * 30)}`,
    });
  if (suspeito > 0)
    fatoresComunidade.push({
      fator:   `Comunidade: ${suspeito} voto(s) suspeito`,
      impacto: `-${Math.round((suspeito / totalVotos) * 15)}`,
    });
  if (golpe > 0)
    fatoresComunidade.push({
      fator:   `Comunidade: ${golpe} relato(s) de golpe`,
      impacto: `-${Math.round((golpe / totalVotos) * 30)}`,
    });

  return { scoreComunidade, fatoresComunidade, temVotos: true };
}

module.exports = { calcularComunidade };
