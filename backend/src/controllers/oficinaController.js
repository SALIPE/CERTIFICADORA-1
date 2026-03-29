const oficinaService = require('../services/oficinaService');

async function create(req, res, next) {
  try {
    const result = await oficinaService.create(req.body, req.user.id);
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

async function list(_req, res, next) {
  try {
    const result = await oficinaService.list();
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function findById(req, res, next) {
  try {
    const result = await oficinaService.findById(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function update(req, res, next) {
  try {
    const result = await oficinaService.update(req.params.id, req.body);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function activate(req, res, next) {
  try {
    const result = await oficinaService.activate(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function deactivate(req, res, next) {
  try {
    const result = await oficinaService.deactivate(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function finish(req, res, next) {
  try {
    const result = await oficinaService.finish(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function listVolunteers(req, res, next) {
  try {
    const result = await oficinaService.listVolunteers(req.params.id);
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
  finish,
  listVolunteers
};
