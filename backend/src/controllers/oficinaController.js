const oficinaService = require('../services/oficinaService');

// No oficinaController.js
async function create(req, res, next) {
  try {
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

async function unenroll(req, res) {
  try {
    const { id } = req.params; // ID da oficina
    const usuarioId = req.user.id; // ID do usuário logado vindo do token
    
    await oficinaService.unenrollVolunteer(id, usuarioId);
    
    res.status(200).json({ message: 'Inscrição cancelada com sucesso.' });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
}

async function listarMinhasInscricoes(req, res) {
  try {
    // O ID do usuário deve vir do seu middleware de autenticação (JWT)
    const usuarioId = req.user.id; 
    const inscricoes = await oficinaService.getInscricoesUsuario(usuarioId);
    res.status(200).json(inscricoes);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar inscrições." });
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
  enroll,
  listarMinhasInscricoes,
  unenroll
};
