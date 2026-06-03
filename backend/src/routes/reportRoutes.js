const express              = require('express');
const router               = express.Router();
const reportController     = require('../controllers/reportController');
const { verificarToken }   = require('../middlewares/auth');
const { reportLimiter }    = require('../middlewares/rateLimiter');

router.post('/report', reportLimiter, verificarToken, reportController.reportar);

module.exports = router;
