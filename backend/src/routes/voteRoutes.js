const express            = require('express');
const router             = express.Router();
const voteController     = require('../controllers/voteController');
const { verificarToken } = require('../middlewares/auth');
const { voteLimiter }    = require('../middlewares/rateLimiter');

router.post('/vote', voteLimiter, verificarToken, voteController.votar);

module.exports = router;
