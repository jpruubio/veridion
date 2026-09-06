const express = require('express');
const router = express.Router();
const imageReportController = require('../controllers/imageReportController');
const { verificarToken } = require('../middlewares/auth');

router.post('/report-image', verificarToken, imageReportController.reportarImagem);

module.exports = router;
