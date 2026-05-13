const rateLimit = require('express-rate-limit');

const analiseLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: 'Muitas requisições. Tente novamente em um minuto.' },
});

const voteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: 'Muitos votos em pouco tempo. Tente novamente em um minuto.' },
});

module.exports = { analiseLimiter, voteLimiter };
