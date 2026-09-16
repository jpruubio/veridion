const db                = require('../models/db');
const { analisarTecnico, extrairDominio } = require('../services/technicalAnalysis');
const { analisarConteudo, analisarImagens } = require('../services/aiAnalysis');
const { calcularComunidade }               = require('../services/communityAnalysis');
const trustScore                           = require('../services/trustScore');

// POST /analisar-pagina
// Body: { url, titulo, texto, imagens }  — formato enviado pela extensão
// Header Authorization: Bearer <token> (opcional — se presente, salva histórico)
async function analisarPagina(req, res) {
  const { url, titulo = '', texto = '', imagens = [] } = req.body;

  if (!url) {
    return res.status(400).json({ erro: 'O campo "url" é obrigatório.' });
  }

  try {
    const dominio = extrairDominio(url);
    if (!dominio) {
      return res.status(400).json({ erro: 'URL inválida.' });
    }

    const [resultadoTecnico, resultadoIa, comunidade] = await Promise.all([
      analisarTecnico(url),
      analisarConteudo({ titulo, conteudo: texto, dominio }),
      calcularComunidade(dominio),
    ]);

    const { scoreComunidade, fatoresComunidade, temVotos } = comunidade;

    const resultado = trustScore.montar({
      scoreTecnico:       resultadoTecnico.score,
      fatoresTecnicos:    resultadoTecnico.fatores,
      scoreIa:            resultadoIa.score,
      fatoresIa:          resultadoIa.fatores,
      scoreComunidade,
      fatoresComunidade,
      temVotosComunidade: temVotos,
    });

    // Converte breakdown[] para string legível (formato esperado pela extensão).
    // Persistido igual ao que é devolvido na resposta, para que consultas
    // futuras (/domain, /community/site, /analises) leiam o mesmo texto.
    const detalhe = resultado.breakdown
      .map(f => `${f.fator} (${f.impacto})`)
      .join(' • ');

    if (req.usuario) {
      await db.query(
        `INSERT INTO analises (usuario_id, url, score, veredicto, detalhe)
         VALUES ($1, $2, $3, $4, $5)`,
        [req.usuario.id, dominio, resultado.score, resultado.veredicto, detalhe]
      );
    }

    return res.json({
      score:     resultado.score,
      veredicto: resultado.veredicto,
      detalhe,
    });

  } catch (err) {
    console.error('[paginaController] Erro:', err.message);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
}

// POST /analisar-imagem
// Body: { url_imagem }
// Chamado pelo botão direito na extensão.
async function analisarImagem(req, res) {
  const { url_imagem } = req.body;

  if (!url_imagem) {
    return res.status(400).json({ erro: 'O campo "url_imagem" é obrigatório.' });
  }

  if (!url_imagem.startsWith('http')) {
    return res.status(400).json({ erro: 'URL de imagem inválida.' });
  }

  try {
    const resultado = await analisarImagens([url_imagem]);

    let veredicto;
    if (!resultado.imagem_ia) {
      veredicto = 'Nenhuma IA detectada nesta imagem';
    } else if (resultado.imagem_confianca >= 80) {
      veredicto = `Imagem gerada por IA (${resultado.imagem_confianca}% de confiança)`;
    } else {
      veredicto = `Possivelmente gerada por IA (${resultado.imagem_confianca}% de confiança)`;
    }

    return res.json({
      imagem_ia:        resultado.imagem_ia,
      imagem_confianca: resultado.imagem_confianca,
      veredicto,
    });

  } catch (err) {
    console.error('[paginaController] Erro ao analisar imagem:', err.message);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
}

module.exports = { analisarPagina, analisarImagem };
