const express            = require('express');
const router             = express.Router();
const reportController   = require('../controllers/reportController');
const { verificarToken } = require('../middlewares/auth');

router.post('/report', verificarToken, reportController.reportar);

module.exports = router;
