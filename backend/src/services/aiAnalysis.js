const { GoogleGenerativeAI } = require('@google/generative-ai');

// Instanciado uma vez no carregamento do módulo — dotenv já está ativo via server.js
const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

function extrairJSON(text) {
  const start = text.indexOf('{');
  const end   = text.lastIndexOf('}');
  if (start === -1 || end <= start) throw new Error(`JSON não encontrado na resposta: ${text}`);
  return text.slice(start, end + 1);
}

// ------------------------------------------------------------
//  Prompt de análise de conteúdo de página
// ------------------------------------------------------------

const SYSTEM_PROMPT = `Você é um especialista em verificação de conteúdo e segurança digital. Avalie a credibilidade de páginas web para uma extensão de segurança de navegador.

ESCALA DE SCORE (0–100):
- 0–20  : Golpe ou desinformação grave — phishing, esquema financeiro, fake news com fatos inventados
- 21–40 : Suspeito — clickbait extremo, urgência artificial, afirmações fortes sem nenhuma fonte
- 41–60 : Neutro ou inconclusivo — conteúdo técnico, escasso, página de login, dashboard, portal
- 61–80 : Provavelmente confiável — linguagem objetiva e coerente, sem sinais evidentes de manipulação
- 81–100 : Alta credibilidade — fontes explícitas verificáveis, jornalismo sólido, autoria transparente

SINAIS A AVALIAR:
- Linguagem emocional ou alarmista versus objetiva e descritiva
- Presença ou ausência de fontes em afirmações factuais relevantes
- Urgência artificial ("AGORA!", "só hoje", "não perca", "clique agora")
- Inconsistências internas ou incoerências no conteúdo
- Transparência de autoria, data e veículo de publicação
- Pedidos incomuns de dados pessoais, senhas ou pagamento

NAO PENALIZE:
- Conteúdo naturalmente escasso: login, 404, dashboard, portal, e-commerce sem afirmações
- Ausência de fontes em conteúdo não factual (institucional, técnico, transacional)
- Conteúdo em idioma diferente do português

REGRAS:
- Scores abaixo de 20 ou acima de 85 exigem evidência explícita no texto analisado
- Cada fator deve nomear um sinal concreto observado no conteúdo — não avaliações genéricas
- Inclua entre 2 e 4 fatores
- "impacto": número inteiro com sinal obrigatório, como string (ex: "+15", "-22", "0")

Responda SOMENTE com JSON válido, sem markdown e sem texto adicional:
{"score":NUMBER,"fatores":[{"fator":"STRING","impacto":"SIGNED_INT"}]}`;

// ------------------------------------------------------------
//  Análise de conteúdo textual da página
// ------------------------------------------------------------

async function analisarConteudo({ titulo, conteudo, dominio = '' }) {
  if (!titulo && !conteudo) {
    return { score: 50, fatores: [{ fator: 'Sem conteúdo para analisar', impacto: '0' }] };
  }

  if (!genAI) {
    return { score: 50, fatores: [{ fator: 'Análise de IA não configurada', impacto: '0' }] };
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const prompt = [
      dominio ? `Domínio: ${dominio}` : null,
      `Título: ${(titulo || '(sem título)').slice(0, 200)}`,
      '',
      'Conteúdo:',
      (conteudo || '(sem conteúdo)').slice(0, 3000),
    ].filter(line => line !== null).join('\n');

    const result = await model.generateContent(prompt);
    const parsed = JSON.parse(extrairJSON(result.response.text()));

    const score   = Math.max(0, Math.min(100, parseInt(parsed.score)));
    const fatores = Array.isArray(parsed.fatores) ? parsed.fatores : [];

    return { score, fatores };

  } catch (err) {
    console.error('[aiAnalysis] Erro na análise de conteúdo:', err.message);
    return { score: 50, fatores: [{ fator: 'Análise de IA temporariamente indisponível', impacto: '0' }] };
  }
}

// ------------------------------------------------------------
//  Detecção de imagens geradas por IA
// ------------------------------------------------------------

async function analisarImagens(imagens) {
  const fallback = { imagem_ia: false, imagem_confianca: 0 };

  if (!imagens || imagens.length === 0) return fallback;
  if (!genAI) return fallback;

  const imageUrl = imagens.find(url => typeof url === 'string' && url.startsWith('http'));
  if (!imageUrl) return fallback;

  try {
    const controller = new AbortController();
    const timeout    = setTimeout(() => controller.abort(), 5000);
    const imgResponse = await fetch(imageUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (!imgResponse.ok) return fallback;

    const buffer   = await imgResponse.arrayBuffer();
    const base64   = Buffer.from(buffer).toString('base64');
    const mimeType = (imgResponse.headers.get('content-type') || 'image/jpeg').split(';')[0];

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json', temperature: 0.1 },
    });

    const result = await model.generateContent([
      { inlineData: { data: base64, mimeType } },
      `Determine se esta imagem foi gerada por inteligência artificial.
Observe: irregularidades em mãos e dedos, olhos ou dentes inconsistentes, fundo incoerente, texto ilegível, texturas ou iluminação artificiais, padrões repetidos ou simétricos anormais.
Responda SOMENTE com JSON válido: {"gerada_por_ia":BOOLEAN,"confianca":INTEGER_0_100}`,
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
