const { GoogleGenerativeAI } = require('@google/generative-ai');

const SYSTEM_PROMPT = `Você é um especialista em verificação de fatos e segurança digital.
Analise o título e o conteúdo de uma página web e avalie sua confiabilidade.

Considere os seguintes critérios:
- Qualidade da escrita (erros, linguagem sensacionalista ou alarmista)
- Presença de desinformação, afirmações extraordinárias sem evidência ou fontes
- Tom manipulativo (medo excessivo, urgência artificial, clickbait)
- Coerência, objetividade e credibilidade geral do conteúdo

Responda EXCLUSIVAMENTE com um JSON válido no seguinte formato:
{
  "score": <inteiro de 0 a 100>,
  "fatores": [
    { "fator": "<descrição curta do fator>", "impacto": "<+N ou -N ou 0>" }
  ]
}

Regras:
- score 0–30: conteúdo perigoso ou claramente falso
- score 31–60: suspeito ou de baixa qualidade
- score 61–85: razoável, mas com ressalvas
- score 86–100: confiável e bem fundamentado
- Liste entre 2 e 4 fatores relevantes
- Impacto deve ser um número inteiro com sinal (ex: +15, -20, 0)`;

async function analisarConteudo({ titulo, conteudo }) {
  if (!titulo && !conteudo) {
    return {
      score: 50,
      fatores: [{ fator: 'Sem conteúdo para analisar', impacto: '0' }],
    };
  }

  if (!process.env.GEMINI_API_KEY) {
    return {
      score: 50,
      fatores: [{ fator: 'Análise de IA não configurada', impacto: '0' }],
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const prompt = `Título: ${titulo || '(sem título)'}

Conteúdo:
${conteudo || '(sem conteúdo)'}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(text);

    const score = Math.max(0, Math.min(100, parseInt(parsed.score)));
    const fatores = Array.isArray(parsed.fatores) ? parsed.fatores : [];

    return { score, fatores };

  } catch (err) {
    console.error('[aiAnalysis] Erro na chamada Gemini:', err.message);
    return {
      score: 50,
      fatores: [{ fator: 'Análise de IA temporariamente indisponível', impacto: '0' }],
    };
  }
}

module.exports = { analisarConteudo };
