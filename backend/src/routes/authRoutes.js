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

module.exports = router;