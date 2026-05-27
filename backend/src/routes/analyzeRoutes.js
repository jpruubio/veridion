const express             = require('express');
const router              = express.Router();
const analyzeController   = require('../controllers/analyzeController');
const { verificarToken }  = require('../middlewares/auth');
const { analiseLimiter }  = require('../middlewares/rateLimiter');

// Token é opcional: se presente, salva histórico; se ausente, só retorna score
function tokenOpcional(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return verificarToken(req, res, next);
  }
  next();
}

router.post('/analyze', analiseLimiter, tokenOpcional, analyzeController.analisar);
router.get('/analises', verificarToken, analyzeController.historico);

module.exports = router;
