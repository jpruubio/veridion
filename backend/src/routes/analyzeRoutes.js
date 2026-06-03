const express            = require('express');
const router             = express.Router();
const analyzeController  = require('../controllers/analyzeController');
const { verificarToken } = require('../middlewares/auth');

router.get('/analises', verificarToken, analyzeController.historico);

module.exports = router;
