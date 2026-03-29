function notFoundHandler(_req, res) {
  res.status(404).json({ message: 'Rota não encontrada.' });
}

function errorHandler(error, _req, res, _next) {
  console.error(error);

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Erro interno do servidor.';

  res.status(statusCode).json({
    message,
    details: error.details || null
  });
}

module.exports = {
  notFoundHandler,
  errorHandler
};
