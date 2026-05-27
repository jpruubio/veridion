const db = require('../models/db');

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

  const votos = result.rows[0];
  const totalVotos = parseInt(votos.total);
  let scoreComunidade = 50;
  const fatoresComunidade = [];

  if (totalVotos > 0) {
    const confiavel = parseInt(votos.confiavel);
    const suspeito  = parseInt(votos.suspeito);
    const golpe     = parseInt(votos.golpe);
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

  return { scoreComunidade, fatoresComunidade };
}

module.exports = { calcularComunidade };
