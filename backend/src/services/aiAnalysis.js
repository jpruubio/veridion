// Stub: pronto para receber integração com API de IA (OpenAI, Gemini, etc.)
// Para integrar: substitua o corpo de analisarConteudo pela chamada real.
async function analisarConteudo({ titulo, conteudo }) {
  return {
    score: 50,
    fatores: [{ fator: 'Análise de IA indisponível', impacto: '0' }],
  };
}

module.exports = { analisarConteudo };
