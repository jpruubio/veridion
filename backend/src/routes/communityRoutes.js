const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const { verificarToken } = require('../middlewares/auth');

router.get('/community/top', communityController.obterRankings);
router.get('/community/site', communityController.obterDetalhesSite);
router.post('/community/responder', verificarToken, communityController.responderDenuncia);

module.exports = router;
