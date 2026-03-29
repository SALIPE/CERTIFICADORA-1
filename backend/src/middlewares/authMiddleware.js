const jwt = require('jsonwebtoken');
const env = require('../config/env');

function ensureAuthenticated(req, _res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    const error = new Error('Token não informado.');
    error.statusCode = 401;
    return next(error);
  }

  const [, token] = authHeader.split(' ');

  try {
    const decoded = jwt.verify(token, env.jwt.secret);
    req.user = decoded;
    return next();
  } catch (_error) {
    const error = new Error('Token inválido ou expirado.');
    error.statusCode = 401;
    return next(error);
  }
}

function authorize(...allowedRoles) {
  return (req, _res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.perfil)) {
      const error = new Error('Acesso negado para este perfil.');
      error.statusCode = 403;
      return next(error);
    }

    return next();
  };
}

module.exports = {
  ensureAuthenticated,
  authorize
};
