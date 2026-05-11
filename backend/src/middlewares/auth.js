// ============================================================
//  Veridion — src/middlewares/auth.js
//  Middleware que protege rotas: verifica o token JWT.
//  Use em qualquer rota que exija login:
//    router.post('/analisar-pagina', verificarToken, analysisController.analisar)
// ============================================================

const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token não fornecido. Faça login.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payload; // { id, email } disponível nos controllers
    next();
  } catch (err) {
    return res.status(401).json({ erro: 'Token inválido ou expirado. Faça login novamente.' });
  }
}

module.exports = { verificarToken };