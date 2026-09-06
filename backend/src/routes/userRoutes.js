const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verificarToken } = require('../middlewares/auth');

router.get('/usuario/perfil', verificarToken, userController.obterPerfil);
router.post('/usuario/perfil', verificarToken, userController.atualizarPerfil);

module.exports = router;
