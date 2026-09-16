const db = require('../models/db');

// GET /usuario/perfil
// Requer autenticação. Retorna os dados do perfil, histórico de análises e denúncias do próprio usuário.
async function obterPerfil(req, res) {
  try {
    const [userRes, analisesRes, denunciasRes, votosRes] = await Promise.all([
      db.query(
        'SELECT id, nome_completo, email, avatar_url, criado_em FROM usuarios WHERE id = $1',
        [req.usuario.id]
      ),
      db.query(
        `SELECT id, url AS dominio, score, veredicto, analisado_em AS criado_em
         FROM analises
         WHERE usuario_id = $1
         ORDER BY analisado_em DESC
         LIMIT 50`,
        [req.usuario.id]
      ),
      db.query(
        `SELECT id, dominio, motivo, estrelas, comentario, resposta_empresa, respondido, criado_em 
         FROM denuncias 
         WHERE usuario_id = $1 
         ORDER BY criado_em DESC 
         LIMIT 50`,
        [req.usuario.id]
      ),
      db.query(
        `SELECT id, dominio, voto, comentario, criado_em 
         FROM votos 
         WHERE usuario_id = $1 
         ORDER BY criado_em DESC 
         LIMIT 50`,
        [req.usuario.id]
      )
    ]);

    if (userRes.rows.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    return res.json({
      usuario: userRes.rows[0],
      analises: analisesRes.rows,
      denuncias: denunciasRes.rows,
      votos: votosRes.rows
    });
  } catch (err) {
    console.error('[userController] Erro obterPerfil:', err.message);
    return res.status(500).json({ erro: 'Erro ao carregar perfil do usuário.' });
  }
}

// POST /usuario/perfil
// Requer autenticação. Atualiza nome_completo e avatar_url.
async function atualizarPerfil(req, res) {
  const { nome_completo, avatar_url } = req.body;

  if (!nome_completo) {
    return res.status(400).json({ erro: 'O campo "nome_completo" é obrigatório.' });
  }

  try {
    const result = await db.query(
      `UPDATE usuarios 
       SET nome_completo = $1, avatar_url = $2 
       WHERE id = $3 
       RETURNING id, nome_completo, email, avatar_url`,
      [nome_completo, avatar_url || null, req.usuario.id]
    );

    return res.json({
      mensagem: 'Perfil atualizado com sucesso!',
      usuario: result.rows[0]
    });
  } catch (err) {
    console.error('[userController] Erro atualizarPerfil:', err.message);
    return res.status(500).json({ erro: 'Erro ao atualizar dados do perfil.' });
  }
}

module.exports = {
  obterPerfil,
  atualizarPerfil
};
