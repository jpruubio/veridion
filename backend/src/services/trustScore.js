const PESOS = { tecnico: 0.25, ia: 0.45, comunidade: 0.30 };

function calcularVeredicto(score) {
  if (score <= 30) return 'Perigo';
  if (score <= 60) return 'Suspeito';
  if (score <= 85) return 'Moderadamente confiável';
  return 'Confiável';
}

function calcularScore({ scoreTecnico, scoreIa, scoreComunidade, temVotosComunidade }) {
  if (!temVotosComunidade) {
    // Sem votos: redistribui o peso da comunidade proporcionalmente entre técnico e IA
    const pesoAtivo = PESOS.tecnico + PESOS.ia;
    const final = Math.round(
      scoreTecnico * (PESOS.tecnico / pesoAtivo) +
      scoreIa      * (PESOS.ia      / pesoAtivo)
    );
    return Math.max(0, Math.min(100, final));
  }
  const final = Math.round(
    scoreTecnico    * PESOS.tecnico    +
    scoreIa         * PESOS.ia         +
    scoreComunidade * PESOS.comunidade
  );
  return Math.max(0, Math.min(100, final));
}

function montar({ scoreTecnico, fatoresTecnicos, scoreIa, fatoresIa, scoreComunidade, fatoresComunidade, temVotosComunidade }) {
  const score = calcularScore({ scoreTecnico, scoreIa, scoreComunidade, temVotosComunidade });
  return {
    score,
    veredicto: calcularVeredicto(score),
    breakdown: [...fatoresTecnicos, ...fatoresIa, ...fatoresComunidade],
  };
}

module.exports = { montar };
