const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const env = require('../config/env');

async function login({ email, senha }) {
  if (!email || !senha) {
    const error = new Error('E-mail e senha são obrigatórios.');
    error.statusCode = 400;
    throw error;
  }
  const query = `
    SELECT id, nome, email, senha_hash, perfil, ativo
    FROM usuario
    WHERE email = $1
  `;
  const { rows } = await db.query(query, [email]);
  const user = rows[0];

  if (!user || !user.ativo) {
    const error = new Error('Usuário não encontrado ou inativo.');
    error.statusCode = 401;
    throw error;
  }

  const passwordMatches = await bcrypt.compare(senha, user.senha_hash);

  if (!passwordMatches) {
    const error = new Error('Credenciais inválidas.');
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, perfil: user.perfil },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn }
  );

  return {
    token,
    usuario: {
      id: user.id,
      nome: user.nome,
      email: user.email,
      perfil: user.perfil,
      ativo: user.ativo
    }
  };
}

module.exports = {
  login
};
