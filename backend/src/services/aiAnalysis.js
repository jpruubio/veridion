const { GoogleGenerativeAI } = require('@google/generative-ai');

function extrairJSON(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end <= start) throw new Error(`JSON não encontrado na resposta: ${text}`);
  return text.slice(start, end + 1);
}

const SYSTEM_PROMPT = `Você avalia a confiabilidade de conteúdo web e responde SOMENTE com JSON, sem texto adicional.

Retorne exatamente neste formato:
{"score":72,"fatores":[{"fator":"Escrita objetiva e bem estruturada","impacto":"+12"},{"fator":"Ausência de fontes citadas","impacto":"-8"}]}

Regras:
- score: inteiro 0–100 (0=falso/perigoso, 100=totalmente confiável)
- fatores: 2 a 4 itens avaliando qualidade textual, desinformação, tom manipulativo e coerência
- impacto: inteiro com sinal, ex: +15, -20, 0`;

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
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const prompt = `Título: ${(titulo || '(sem título)').slice(0, 200)}

Conteúdo:
${(conteudo || '(sem conteúdo)').slice(0, 3000)}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(extrairJSON(text));

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

async function analisarImagens(imagens) {
  const fallback = { imagem_ia: false, imagem_confianca: 0 };

  if (!imagens || imagens.length === 0) return fallback;
  if (!process.env.GEMINI_API_KEY) return fallback;

  const imageUrl = imagens.find(url => typeof url === 'string' && url.startsWith('http'));
  if (!imageUrl) return fallback;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const imgResponse = await fetch(imageUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (!imgResponse.ok) return fallback;

    const buffer = await imgResponse.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const mimeType = (imgResponse.headers.get('content-type') || 'image/jpeg').split(';')[0];

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json', temperature: 0.1 },
    });

    const result = await model.generateContent([
      { inlineData: { data: base64, mimeType } },
      'Esta imagem foi gerada por IA? Responda SOMENTE com JSON, sem texto adicional. Exemplo: {"gerada_por_ia":true,"confianca":85}',
    ]);

    const parsed = JSON.parse(extrairJSON(result.response.text()));
    return {
      imagem_ia:        Boolean(parsed.gerada_por_ia),
      imagem_confianca: Math.max(0, Math.min(100, parseInt(parsed.confianca) || 0)),
    };

  } catch (err) {
    console.error('[aiAnalysis] Erro na análise de imagem:', err.message);
    return fallback;
  }
}

module.exports = { analisarConteudo, analisarImagens };
