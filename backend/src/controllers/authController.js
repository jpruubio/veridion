const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const db     = require('../models/db');

const SALT_ROUNDS = 10;

// Limites alinhados com o schema do banco e com o limite interno do bcrypt (72 bytes)
const LIMITES = { nome: 100, email: 150, senha: 72 };

const RE_EMAIL  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RE_SENHA  = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

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

module.exports = { cadastrar, login };
