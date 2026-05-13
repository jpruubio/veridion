const express            = require('express');
const router             = express.Router();
const domainController   = require('../controllers/domainController');

router.get('/domain', domainController.consultarDominio);

module.exports = router;
