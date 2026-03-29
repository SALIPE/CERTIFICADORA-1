const userService = require('../services/usuarioService');

async function create(req, res, next) {
  try {
    const result = await userService.create(req.body);
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

async function list(_req, res, next) {
  try {
    const result = await userService.list();
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function findById(req, res, next) {
  try {
    const result = await userService.findById(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function update(req, res, next) {
  try {
    const result = await userService.update(req.params.id, req.body);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function activate(req, res, next) {
  try {
    const result = await userService.activate(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function deactivate(req, res, next) {
  try {
    const result = await userService.deactivate(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function changePassword(req, res, next) {
  try {
    const result = await userService.changePassword(req.params.id, req.body.novaSenha);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  create,
  list,
  findById,
  update,
  activate,
  deactivate,
  changePassword
};
