const db = require('../models/db');
const { extrairDominio } = require('../services/technicalAnalysis');

// GET /community/top
// Retorna os rankings da comunidade e estatísticas da semana (MOCKADOS para o MVP/Sprint)
async function obterRankings(req, res) {
  try {
    // Dados mockados premium para a apresentação
    const maisConfiaveis = [
      { dominio: 'nike.com.br', score: 88 },
      { dominio: 'g1.globo.com', score: 92 },
      { dominio: 'google.com', score: 95 },
      { dominio: 'gov.br', score: 98 },
      { dominio: 'wikipedia.org', score: 90 }
    ];

    const maisDenunciados = [
      { dominio: 'promocao-iphone-insta.xyz', denuncias_count: 42 },
      { dominio: 'mercado-liwre.html', denuncias_count: 38 },
      { dominio: 'investimento-pix-facil.net', denuncias_count: 27 },
      { dominio: 'suporte-banco-atualizado.org', denuncias_count: 19 },
      { dominio: 'sorteio-oficial-fgts.club', denuncias_count: 15 }
    ];

    const maisAcessados = [
      { dominio: 'google.com', acessos_count: 1052 },
      { dominio: 'nike.com.br', acessos_count: 843 },
      { dominio: 'g1.globo.com', acessos_count: 711 },
      { dominio: 'mercado-liwre.html', acessos_count: 529 },
      { dominio: 'youtube.com', acessos_count: 490 },
      { dominio: 'gov.br', acessos_count: 412 },
      { dominio: 'promocao-iphone-insta.xyz', acessos_count: 392 },
      { dominio: 'wikipedia.org', acessos_count: 315 },
      { dominio: 'instagram.com', acessos_count: 288 },
      { dominio: 'netflix.com', acessos_count: 204 }
    ];

    const totalSemana = 142;

    return res.json({
      maisConfiaveis,
      maisDenunciados: maisDenunciados.map(r => ({
        dominio: r.dominio,
        denuncias: parseInt(r.denuncias_count)
      })),
      maisAcessados: maisAcessados.map(r => ({
        dominio: r.dominio,
        acessos: parseInt(r.acessos_count)
      })),
      totalSemana
    });
  } catch (err) {
    console.error('[communityController] Erro rankings:', err.message);
    return res.status(500).json({ erro: 'Erro ao carregar rankings da comunidade.' });
  }
}

// GET /community/site?dominio=exemplo.com
// Retorna informações de segurança, votos e denúncias de um site específico
async function obterDetalhesSite(req, res) {
  const { dominio } = req.query;

  if (!dominio) {
    return res.status(400).json({ erro: 'O parâmetro "dominio" é obrigatório.' });
  }

  const dominioLimpo = dominio.trim().toLowerCase();

  // MOCK ESPECIAL PARA NIKE.COM e NIKE.COM.BR (Apresentação Sprint 24/06)
  if (dominioLimpo === 'nike.com.br' || dominioLimpo === 'nike.com') {
    return res.json({
      dominio: dominioLimpo,
      votos: {
        confiavel: 240,
        suspeito: 8,
        golpe: 2,
        total: 250
      },
      ultimoScore: {
        score: 88,
        veredicto: 'Confiável',
        criado_em: new Date().toISOString()
      },
      denuncias: [
        {
          id: 9991,
          usuario_id: null,
          motivo: 'outro',
          estrelas: 4,
          comentario: 'Comprei um tênis e demorou 2 dias a mais para entregar, mas o produto é excelente e original.',
          nome_usuario: 'Carlos Souza',
          resposta_empresa: 'Olá Carlos! Lamentamos pelo atraso logístico pontual no envio de sua remessa. Agradecemos a preferência e ficamos felizes que gostou do tênis!',
          respondido: true,
          criado_em: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // ontem
        },
        {
          id: 9992,
          usuario_id: null,
          motivo: 'site_malicioso',
          estrelas: 1,
          comentario: 'Achei um anúncio no Instagram oferecendo tênis por R$ 50 usando a marca da Nike, quase caí! Mas percebi que o site real é este aqui nike.com.br. Cuidado com golpes!',
          nome_usuario: 'Mariana Lima',
          resposta_empresa: 'Olá Mariana, agradecemos o seu alerta! A Nike oficial não realiza vendas fora de seus canais oficiais e do site nike.com.br. Denuncie os perfis falsos nas redes sociais.',
          respondido: true,
          criado_em: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 dias atrás
        },
        {
          id: 9993,
          usuario_id: null,
          motivo: 'outro',
          estrelas: 3,
          comentario: 'O suporte por telefone é um pouco demorado para atender, mas consegui resolver minha dúvida.',
          nome_usuario: 'Pedro Oliveira',
          resposta_empresa: null,
          respondido: false,
          criado_em: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 dias atrás
        }
      ]
    });
  }

  // BUSCA REAL NO BANCO DE DADOS (Fallback para outros sites)
  try {
    const [votosRes, analiseRes, denunciasRes] = await Promise.all([
      // Contagem de votos
      db.query(
        `SELECT
           COUNT(*) FILTER (WHERE voto = 'confiavel') AS confiavel,
           COUNT(*) FILTER (WHERE voto = 'suspeito')  AS suspeito,
           COUNT(*) FILTER (WHERE voto = 'golpe')     AS golpe,
           COUNT(*)                                   AS total
         FROM votos WHERE dominio = $1`,
        [dominioLimpo]
      ),
      // Último score de análise
      db.query(
        `SELECT score, veredicto, analisado_em AS criado_em
         FROM analises
         WHERE url = $1
         ORDER BY analisado_em DESC
         LIMIT 1`,
        [dominioLimpo]
      ),
      // Lista de denúncias
      db.query(
        `SELECT d.id, d.usuario_id, d.motivo, d.estrelas, d.comentario, 
                COALESCE(u.nome_completo, 'Anônimo') AS nome_usuario, 
                d.resposta_empresa, d.respondido, d.criado_em 
         FROM denuncias d
         LEFT JOIN usuarios u ON d.usuario_id = u.id
         WHERE d.dominio = $1 
         ORDER BY d.criado_em DESC`,
        [dominioLimpo]
      )
    ]);

    const v = votosRes.rows[0];
    const ultimoScore = analiseRes.rows[0] || null;

    return res.json({
      dominio: dominioLimpo,
      votos: {
        confiavel: parseInt(v.confiavel || 0),
        suspeito:  parseInt(v.suspeito || 0),
        golpe:     parseInt(v.golpe || 0),
        total:     parseInt(v.total || 0)
      },
      ultimoScore,
      denuncias: denunciasRes.rows
    });
  } catch (err) {
    console.error('[communityController] Erro detalhes site:', err.message);
    return res.status(500).json({ erro: 'Erro ao consultar detalhes do site.' });
  }
}

// POST /community/responder
// Permite que uma empresa responda a uma denúncia
async function responderDenuncia(req, res) {
  const { denuncia_id, resposta } = req.body;

  if (!denuncia_id || !resposta) {
    return res.status(400).json({ erro: 'Os campos "denuncia_id" e "resposta" são obrigatórios.' });
  }

  try {
    const result = await db.query(
      `UPDATE denuncias 
       SET resposta_empresa = $1, respondido = TRUE 
       WHERE id = $2 
       RETURNING id, dominio, respondido`,
      [resposta, denuncia_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Denúncia não encontrada.' });
    }

    return res.json({
      mensagem: 'Resposta registrada com sucesso!',
      denuncia: result.rows[0]
    });
  } catch (err) {
    console.error('[communityController] Erro responder:', err.message);
    return res.status(500).json({ erro: 'Erro ao registrar resposta.' });
  }
}

module.exports = {
  obterRankings,
  obterDetalhesSite,
  responderDenuncia
};
