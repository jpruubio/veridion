// ============================================================
//  Veridion — src/controllers/authController.js
//  Lida com cadastro e login de usuários.
// ============================================================

const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const db     = require('../models/db');

const SALT_ROUNDS = 10;

// ------------------------------------------------------------
//  POST /cadastro
//  Body: { nome, email, senha }
// ------------------------------------------------------------
async function cadastrar(req, res) {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Preencha nome, email e senha.' });
  }

  if (senha.length < 6) {
    return res.status(400).json({ erro: 'A senha deve ter no mínimo 6 caracteres.' });
  }

  try {
    // Verifica se email já existe
    const existe = await db.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (existe.rows.length > 0) {
      return res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });
    }

    // Criptografa a senha
    const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);

    // Insere o usuário
    const result = await db.query(
      'INSERT INTO usuarios (nome, email, senha_hash) VALUES ($1, $2, $3) RETURNING id, nome, email',
      [nome, email, senhaHash]
    );

    const usuario = result.rows[0];

    // Gera o token JWT já no cadastro (usuário entra logado)
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

  try {
    // Busca o usuário pelo email
    const result = await db.query(
      'SELECT id, nome, email, senha_hash FROM usuarios WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
    }

    const usuario = result.rows[0];

    // Compara a senha enviada com o hash salvo
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaCorreta) {
      return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
    }

    // Gera o token JWT
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