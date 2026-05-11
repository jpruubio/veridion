// ============================================================
//  Veridion — src/routes/authRoutes.js
// ============================================================

const express        = require('express');
const router         = express.Router();
const authController = require('../controllers/authController');

// POST /cadastro → cria novo usuário
router.post('/cadastro', authController.cadastrar);

// POST /login → autentica e retorna token JWT
router.post('/login', authController.login);

module.exports = router;