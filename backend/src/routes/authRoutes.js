// ============================================================
//  Veridion — src/routes/authRoutes.js
// ============================================================

const express        = require('express');
const router         = express.Router();
const authController = require('../controllers/authController');
const { authLimiter } = require('../middlewares/rateLimiter');

// POST /cadastro → cria novo usuário
router.post('/cadastro', authLimiter, authController.cadastrar);

// POST /login → autentica e retorna token JWT
router.post('/login', authLimiter, authController.login);

// POST /esqueci-senha → gera token de redefinição
router.post('/esqueci-senha', authLimiter, authController.esqueceuSenha);

// POST /redefinir-senha → valida token e salva nova senha
router.post('/redefinir-senha', authLimiter, authController.redefinirSenha);

module.exports = router;
