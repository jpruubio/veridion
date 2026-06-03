const rateLimit = require('express-rate-limit');

// 30 análises por minuto por IP
const analiseLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: 'Muitas requisições. Tente novamente em um minuto.' },
});

// 10 votos por minuto por IP
const voteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: 'Muitos votos em pouco tempo. Tente novamente em um minuto.' },
});

// 5 denúncias por hora por IP — ação deliberada, janela longa anti-spam
const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: 'Limite de denúncias atingido. Tente novamente em 1 hora.' },
});

// 10 tentativas de login/cadastro por 15 minutos por IP
// Janela maior para dificultar brute force mesmo com IPs rotacionados
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: 'Muitas tentativas. Aguarde 15 minutos e tente novamente.' },
  skipSuccessfulRequests: true, // só conta requisições que falharam (erro 4xx/5xx)
});

module.exports = { analiseLimiter, voteLimiter, reportLimiter, authLimiter };
