const oficinaService = require('../services/oficinaService');

// No oficinaController.js
async function create(req, res, next) {
  try {
    // Verifique se estes campos novos estão aqui dentro das chavetas:
    const { titulo, tema, descricao, dataInicio, dataFim, local, instrutor, vagas } = req.body;
    const criadoPor = req.user.id;

    const oficina = await oficinaService.create({
      titulo, tema, descricao, dataInicio, dataFim, local, instrutor, vagas
    }, criadoPor);

    res.status(201).json(oficina);
  } catch (error) {
    next(error);
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
    const { id } = req.params;
    const { titulo, tema, descricao, dataInicio, dataFim, status, local, instrutor, vagas } = req.body;

    const oficina = await oficinaService.update(id, {
      titulo, tema, descricao, dataInicio, dataFim, status, local, instrutor, vagas
    });

    res.json(oficina);
  } catch (error) {
    next(error);
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

async function enroll(req, res, next) {
  try {
    const { id } = req.params; // ID da oficina
    const usuarioId = req.user.id; // Pegamos o ID do usuário que está logado pelo token

    const result = await oficinaService.enrollVolunteer(id, usuarioId);
    return res.status(201).json(result);
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
  listVolunteers,
  enroll
};
