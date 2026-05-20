const express            = require('express');
const router             = express.Router();
const paginaController   = require('../controllers/paginaController');
const { verificarToken } = require('../middlewares/auth');
const { analiseLimiter } = require('../middlewares/rateLimiter');

function tokenOpcional(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return verificarToken(req, res, next);
  }
  next();
}

router.post('/analisar-pagina', analiseLimiter, tokenOpcional, paginaController.analisarPagina);

module.exports = router;
