const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const crypto  = require('crypto');
const db      = require('../models/db');
const { Resend } = require('resend');
const resend  = new Resend(process.env.RESEND_API_KEY);

const SALT_ROUNDS = 10;

// Limites alinhados com o schema do banco e com o limite interno do bcrypt (72 bytes)
const LIMITES = { nome: 100, email: 150, senha: 72 };

const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RE_SENHA = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

// ------------------------------------------------------------
//  POST /cadastro
//  Body: { nome, email, senha }
// ------------------------------------------------------------
async function cadastrar(req, res) {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Preencha nome, email e senha.' });
  }

  if (typeof nome !== 'string' || nome.length > LIMITES.nome) {
    return res.status(400).json({ erro: `Nome deve ter no máximo ${LIMITES.nome} caracteres.` });
  }

  if (typeof email !== 'string' || email.length > LIMITES.email) {
    return res.status(400).json({ erro: `E-mail deve ter no máximo ${LIMITES.email} caracteres.` });
  }

  if (typeof senha !== 'string' || senha.length > LIMITES.senha) {
    return res.status(400).json({ erro: `A senha deve ter no máximo ${LIMITES.senha} caracteres.` });
  }

  if (!RE_EMAIL.test(email)) {
    return res.status(400).json({ erro: 'Digite um e-mail válido.' });
  }

  if (!RE_SENHA.test(senha)) {
    return res.status(400).json({
      erro: 'A senha deve ter no mínimo 8 caracteres, incluindo letra maiúscula, minúscula, número e caractere especial.',
    });
  }

  try {
    const existe = await db.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (existe.rows.length > 0) {
      return res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });
    }

    const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);

    const result = await db.query(
      'INSERT INTO usuarios (nome, email, senha_hash) VALUES ($1, $2, $3) RETURNING id, nome, email',
      [nome, email, senhaHash]
    );

    const usuario = result.rows[0];

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return res.status(201).json({
      mensagem: 'Cadastro realizado com sucesso!',
      token,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
    });

  } catch (err) {
    console.error('[authController] Erro no cadastro:', err.message);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
}

// ------------------------------------------------------------
//  POST /login
//  Body: { email, senha }
// ------------------------------------------------------------
async function login(req, res) {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'Preencha e-mail e senha.' });
  }

  if (typeof email !== 'string' || email.length > LIMITES.email) {
    return res.status(400).json({ erro: `E-mail deve ter no máximo ${LIMITES.email} caracteres.` });
  }

  // Bloqueia senhas acima do limite do bcrypt antes de chamar bcrypt.compare()
  if (typeof senha !== 'string' || senha.length > LIMITES.senha) {
    return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
  }

  try {
    const result = await db.query(
      'SELECT id, nome, email, senha_hash FROM usuarios WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
    }

    const usuario = result.rows[0];

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaCorreta) {
      return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      mensagem: 'Login realizado com sucesso!',
      token,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
    });

  } catch (err) {
    console.error('[authController] Erro no login:', err.message);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
}

// ------------------------------------------------------------
//  POST /esqueci-senha
//  Body: { email }
//  Gera um token de redefinição válido por 1 hora.
//  Retorna sempre 200 para não revelar se o e-mail existe.
// ------------------------------------------------------------
async function esqueceuSenha(req, res) {
  const { email } = req.body;

  if (!email || typeof email !== 'string' || !RE_EMAIL.test(email)) {
    return res.status(400).json({ erro: 'Informe um e-mail válido.' });
  }

  try {
    const result = await db.query(
      'SELECT id FROM usuarios WHERE email = $1',
      [email]
    );

    // Resposta genérica — não revela se o e-mail existe (anti-enumeração)
    if (result.rows.length === 0) {
      return res.status(200).json({
        mensagem: 'Se este e-mail estiver cadastrado, você receberá o token em breve.',
      });
    }

    const usuario = result.rows[0];

    // Invalida tokens anteriores ainda pendentes deste usuário
    await db.query(
      'UPDATE reset_tokens SET usado = TRUE WHERE usuario_id = $1 AND usado = FALSE',
      [usuario.id]
    );

    // Gera token criptograficamente seguro (32 bytes hex = 64 chars)
    const token  = crypto.randomBytes(32).toString('hex');
    const expira = new Date(Date.now() + 60 * 60 * 1000); // +1 hora

    await db.query(
      'INSERT INTO reset_tokens (usuario_id, token, expira_em) VALUES ($1, $2, $3)',
      [usuario.id, token, expira]
    );

    await resend.emails.send({
      from: 'Veridion <onboarding@resend.dev>',
      to: email,
      subject: 'Redefinição de senha — Veridion',
      html: `<div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f4f5ff;border-radius:16px;"><h2 style="color:#171658;">Redefinição de senha</h2><p style="color:#6b6b9a;">Use o código abaixo para redefinir sua senha. Válido por <strong>1 hora</strong>.</p><div style="background:#fff;border-radius:10px;padding:20px;text-align:center;font-size:14px;font-weight:600;color:#3533cb;word-break:break-all;">${token}</div><p style="color:#6b6b9a;font-size:12px;margin-top:24px;">Se você não solicitou, ignore este e-mail.</p></div>`
    });

    return res.status(200).json({
      mensagem: 'Se este e-mail estiver cadastrado, você receberá o código em breve.',
    });

  } catch (err) {
    console.error('[authController] Erro em esqueceuSenha:', err.message);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
}

// ------------------------------------------------------------
//  POST /redefinir-senha
//  Body: { token, novaSenha }
//  Valida o token e salva o hash da nova senha.
// ------------------------------------------------------------
async function redefinirSenha(req, res) {
  const { token, novaSenha } = req.body;

  if (!token || typeof token !== 'string') {
    return res.status(400).json({ erro: 'Token inválido.' });
  }

  if (!novaSenha || typeof novaSenha !== 'string') {
    return res.status(400).json({ erro: 'Informe a nova senha.' });
  }

  if (novaSenha.length > LIMITES.senha) {
    return res.status(400).json({ erro: `A senha deve ter no máximo ${LIMITES.senha} caracteres.` });
  }

  if (!RE_SENHA.test(novaSenha)) {
    return res.status(400).json({
      erro: 'A senha deve ter no mínimo 8 caracteres, incluindo letra maiúscula, minúscula, número e caractere especial.',
    });
  }

  try {
    const result = await db.query(
      `SELECT rt.id, rt.usuario_id, rt.expira_em
       FROM reset_tokens rt
       WHERE rt.token = $1
         AND rt.usado  = FALSE
         AND rt.expira_em > NOW()`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ erro: 'Token inválido ou expirado.' });
    }

    const { id: tokenId, usuario_id } = result.rows[0];

    const senhaHash = await bcrypt.hash(novaSenha, SALT_ROUNDS);

    // Atualiza senha e marca token como usado em transação
    await db.query('BEGIN');
    try {
      await db.query(
        'UPDATE usuarios SET senha_hash = $1 WHERE id = $2',
        [senhaHash, usuario_id]
      );
      await db.query(
        'UPDATE reset_tokens SET usado = TRUE WHERE id = $1',
        [tokenId]
      );
      await db.query('COMMIT');
    } catch (txErr) {
      await db.query('ROLLBACK');
      throw txErr;
    }

    return res.status(200).json({ mensagem: 'Senha redefinida com sucesso!' });

  } catch (err) {
    console.error('[authController] Erro em redefinirSenha:', err.message);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
}

module.exports = { cadastrar, login, esqueceuSenha, redefinirSenha };
