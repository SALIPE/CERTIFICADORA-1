const bcrypt = require('bcryptjs');
const db = require('../config/database');
const env = require('../config/env');

function mapUser(row) {
  if (!row) return null;

  return {
    id: row.id,
    nome: row.nome,
    email: row.email,
    perfil: row.perfil,
    ativo: row.ativo,
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em
  };
}

async function findExistingEmail(email, ignoredId = null) {
  const params = [email];
  let query = 'SELECT id FROM usuario WHERE email = $1';

  if (ignoredId) {
    params.push(ignoredId);
    query += ' AND id <> $2';
  }

  const { rows } = await db.query(query, params);
  return rows[0];
}

async function createVoluntario({ nome, email, senha }) {

  return create({ nome, email, senha })
}

async function create({ nome, email, senha = '123', perfil = 'VOLUNTARIO', ativo = true }) {

  if (!nome || !email || !senha) {
    const error = new Error('Nome, e-mail e senha são obrigatórios.');
    error.statusCode = 400;
    throw error;
  }

  const existing = await findExistingEmail(email);
  if (existing) {
    const error = new Error('Já existe um usuário com este e-mail.');
    error.statusCode = 409;
    throw error;
  }

  const senhaHash = await bcrypt.hash(senha, env.security.saltRounds);

  const query = `
    INSERT INTO usuario (nome, email, senha_hash, perfil, ativo)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, nome, email, perfil, ativo, criado_em, atualizado_em
  `;

  const { rows } = await db.query(query, [nome, email, senhaHash, perfil, ativo]);
  return mapUser(rows[0]);
}

async function list() {
  const query = `
    SELECT id, nome, email, perfil, ativo, criado_em, atualizado_em
    FROM usuario
    ORDER BY criado_em DESC
  `;
  const { rows } = await db.query(query);
  return rows.map(mapUser);
}

async function findById(id) {
  const query = `
    SELECT id, nome, email, perfil, ativo, criado_em, atualizado_em
    FROM usuario
    WHERE id = $1
  `;
  const { rows } = await db.query(query, [id]);
  const user = mapUser(rows[0]);

  if (!user) {
    const error = new Error('Usuário não encontrado.');
    error.statusCode = 404;
    throw error;
  }

  return user;
}

async function update(id, { nome, email, perfil, ativo }) {
  await findById(id);

  if (email) {
    const existing = await findExistingEmail(email, id);
    if (existing) {
      const error = new Error('Já existe um usuário com este e-mail.');
      error.statusCode = 409;
      throw error;
    }
  }

  const query = `
    UPDATE usuario
    SET nome = COALESCE($2, nome),
        email = COALESCE($3, email),
        perfil = COALESCE($4, perfil),
        ativo = COALESCE($5, ativo)
    WHERE id = $1
    RETURNING id, nome, email, perfil, ativo, criado_em, atualizado_em
  `;

  const { rows } = await db.query(query, [id, nome, email, perfil, ativo]);
  return mapUser(rows[0]);
}

async function activate(id) {
  return update(id, { ativo: true });
}

async function deactivate(id) {
  return update(id, { ativo: false });
}

async function changePassword(id, novaSenha) {
  if (!novaSenha) {
    const error = new Error('Nova senha é obrigatória.');
    error.statusCode = 400;
    throw error;
  }

  await findById(id);

  const senhaHash = await bcrypt.hash(novaSenha, env.security.saltRounds);
  await db.query('UPDATE usuario SET senha_hash = $2 WHERE id = $1', [id, senhaHash]);

  return { message: 'Senha alterada com sucesso.' };
}

module.exports = {
  create,
  createVoluntario,
  list,
  findById,
  update,
  activate,
  deactivate,
  changePassword
};
