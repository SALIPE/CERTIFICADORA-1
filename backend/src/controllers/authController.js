const authService = require('../services/authService');

async function login(req, res, next) {
  try {
    const { email, senha } = req.body;
    const result = await authService.login({ email, senha });
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  login
};
