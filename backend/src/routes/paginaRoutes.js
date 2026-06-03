const express                           = require('express');
const router                            = express.Router();
const paginaController                  = require('../controllers/paginaController');
const { verificarToken, tokenOpcional } = require('../middlewares/auth');
const { analiseLimiter }                = require('../middlewares/rateLimiter');

router.post('/analisar-pagina', analiseLimiter, tokenOpcional,  paginaController.analisarPagina);
router.post('/analisar-imagem', analiseLimiter, verificarToken, paginaController.analisarImagem);

module.exports = router;
