const usuarioOficinaService = require('../services/usuarioOficinaService');

async function create(req, res, next) {
  try {
    const result = await usuarioOficinaService.create(req.body);
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

async function list(_req, res, next) {
  try {
    const result = await usuarioOficinaService.list();
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function findById(req, res, next) {
  try {
    const result = await usuarioOficinaService.findById(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function listByUser(req, res, next) {
  try {
    const result = await usuarioOficinaService.listByUser(req.params.usuarioId, req.user);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function listByOffice(req, res, next) {
  try {
    const result = await usuarioOficinaService.listByOffice(req.params.oficinaId);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function update(req, res, next) {
  try {
    const result = await usuarioOficinaService.update(req.params.id, req.body);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function resgistrarPresenca(req, res, next) {
  try {
    const result = await usuarioOficinaService.resgistrarPresenca(req.params.id, req.body.horasCumpridas);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function resgistrarFalta(req, res, next) {
  try {
    const result = await usuarioOficinaService.resgistrarFalta(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function reactivate(req, res, next) {
  try {
    const result = await usuarioOficinaService.reactivate(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function desvincular(req, res, next) {
  try {
    const result = await usuarioOficinaService.desvincular(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  create,
  list,
  findById,
  listByUser,
  listByOffice,
  update,
  resgistrarPresenca,
  resgistrarFalta,
  reactivate,
  desvincular
};
