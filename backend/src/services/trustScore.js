const PESOS = { tecnico: 0.35, ia: 0.30, comunidade: 0.35 };

function calcularVeredicto(score) {
  if (score <= 30) return 'Perigo';
  if (score <= 60) return 'Suspeito';
  if (score <= 85) return 'Moderadamente confiável';
  return 'Confiável';
}

function calcularScore({ scoreTecnico, scoreIa, scoreComunidade }) {
  const final = Math.round(
    scoreTecnico   * PESOS.tecnico +
    scoreIa        * PESOS.ia     +
    scoreComunidade * PESOS.comunidade
  );
  return Math.max(0, Math.min(100, final));
}

function montar({ scoreTecnico, fatoresTecnicos, scoreIa, fatoresIa, scoreComunidade, fatoresComunidade }) {
  const score = calcularScore({ scoreTecnico, scoreIa, scoreComunidade });
  return {
    score,
    veredicto: calcularVeredicto(score),
    breakdown: [...fatoresTecnicos, ...fatoresIa, ...fatoresComunidade],
  };
}

module.exports = { montar };
