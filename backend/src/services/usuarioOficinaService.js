const db = require('../config/database');

function mapRelation(row) {
  if (!row) return null;

  return {
    id: row.id,
    usuarioId: row.usuario_id,
    oficinaId: row.oficina_id,
    totalPresencas: row.total_presencas,
    totalFaltas: row.total_faltas,
    percentualFrequencia: Number(row.percentual_frequencia),
    horasCumpridas: Number(row.horas_cumpridas),
    ativo: row.ativo,
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em
  };
}

async function ensureRelationExists(id) {
  const { rows } = await db.query('SELECT * FROM usuario_oficina WHERE id = $1', [id]);
  const relation = mapRelation(rows[0]);

  if (!relation) {
    const error = new Error('Vínculo não encontrado.');
    error.statusCode = 404;
    throw error;
  }

  return relation;
}

async function create({ usuarioId, oficinaId }) {
  if (!usuarioId || !oficinaId) {
    const error = new Error('Usuário e oficina são obrigatórios para o vínculo.');
    error.statusCode = 400;
    throw error;
  }

  const verifyUser = await db.query('SELECT id, perfil, ativo FROM usuario WHERE id = $1', [usuarioId]);
  const user = verifyUser.rows[0];
  if (!user) {
    const error = new Error('Usuário não encontrado.');
    error.statusCode = 404;
    throw error;
  }

  if (user.perfil !== 'VOLUNTARIO') {
    const error = new Error('Apenas usuários com perfil VOLUNTARIO podem ser vinculados à oficina.');
    error.statusCode = 400;
    throw error;
  }

  if (!user.ativo) {
    const error = new Error('Usuário inativo não pode ser vinculado.');
    error.statusCode = 400;
    throw error;
  }

  const verifyOffice = await db.query('SELECT id, status FROM oficina WHERE id = $1', [oficinaId]);
  const office = verifyOffice.rows[0];
  if (!office) {
    const error = new Error('Oficina não encontrada.');
    error.statusCode = 404;
    throw error;
  }

  if (office.status !== 'ATIVA') {
    const error = new Error('Somente oficinas ativas podem receber novos voluntários.');
    error.statusCode = 400;
    throw error;
  }

  const existing = await db.query(
    'SELECT id, ativo FROM usuario_oficina WHERE usuario_id = $1 AND oficina_id = $2',
    [usuarioId, oficinaId]
  );

  if (existing.rows[0] && existing.rows[0].ativo) {
    const error = new Error('Este voluntário já está vinculado à oficina.');
    error.statusCode = 409;
    throw error;
  }

  if (existing.rows[0] && !existing.rows[0].ativo) {
    const { rows } = await db.query(
      `UPDATE usuario_oficina
       SET ativo = true,
           total_presencas = 0,
           total_faltas = 0,
           percentual_frequencia = 0,
           horas_cumpridas = 0
       WHERE id = $1
       RETURNING *`,
      [existing.rows[0].id]
    );
    return mapRelation(rows[0]);
  }

  const { rows } = await db.query(
    `INSERT INTO usuario_oficina (usuario_id, oficina_id)
     VALUES ($1, $2)
     RETURNING *`,
    [usuarioId, oficinaId]
  );

  return mapRelation(rows[0]);
}

async function list() {
  const { rows } = await db.query('SELECT * FROM usuario_oficina ORDER BY criado_em DESC');
  return rows.map(mapRelation);
}

async function findById(id) {
  return ensureRelationExists(id);
}

async function listByUser(usuarioId, requester) {
  if (requester.perfil === 'VOLUNTARIO' && requester.id !== usuarioId) {
    const error = new Error('Você só pode visualizar seus próprios vínculos.');
    error.statusCode = 403;
    throw error;
  }

  const { rows } = await db.query(
    `SELECT uo.*, o.titulo, o.tema, o.status AS oficina_status
     FROM usuario_oficina uo
     INNER JOIN oficina o ON o.id = uo.oficina_id
     WHERE uo.usuario_id = $1
     ORDER BY uo.criado_em DESC`,
    [usuarioId]
  );

  return rows;
}

async function listByOffice(oficinaId) {
  const { rows } = await db.query(
    `SELECT uo.*, u.nome, u.email
     FROM usuario_oficina uo
     INNER JOIN usuario u ON u.id = uo.usuario_id
     WHERE uo.oficina_id = $1
     ORDER BY u.nome ASC`,
    [oficinaId]
  );

  return rows;
}

async function recalculateMetrics(id) {
  const relation = await ensureRelationExists(id);
  const totalAulas = relation.totalPresencas + relation.totalFaltas;
  const percentualFrequencia = totalAulas > 0 ? (relation.totalPresencas / totalAulas) * 100 : 0;

  const { rows } = await db.query(
    `UPDATE usuario_oficina
     SET percentual_frequencia = $2
     WHERE id = $1
     RETURNING *`,
    [id, percentualFrequencia.toFixed(2)]
  );

  return mapRelation(rows[0]);
}

async function update(id, { ativo, horasCumpridas }) {
  await ensureRelationExists(id);

  const { rows } = await db.query(
    `UPDATE usuario_oficina
     SET ativo = COALESCE($2, ativo),
         horas_cumpridas = COALESCE($3, horas_cumpridas)
     WHERE id = $1
     RETURNING *`,
    [id, ativo, horasCumpridas]
  );

  return mapRelation(rows[0]);
}

async function registerPresence(id, horasCumpridas = 0) {
  await ensureRelationExists(id);

  await db.query(
    `UPDATE usuario_oficina
     SET total_presencas = total_presencas + 1,
         horas_cumpridas = horas_cumpridas + $2
     WHERE id = $1`,
    [id, horasCumpridas]
  );

  return recalculateMetrics(id);
}

async function registerAbsence(id) {
  await ensureRelationExists(id);

  await db.query(
    `UPDATE usuario_oficina
     SET total_faltas = total_faltas + 1
     WHERE id = $1`,
    [id]
  );

  return recalculateMetrics(id);
}

async function reactivate(id) {
  return update(id, { ativo: true });
}

async function unlink(id) {
  return update(id, { ativo: false });
}

module.exports = {
  create,
  list,
  findById,
  listByUser,
  listByOffice,
  update,
  registerPresence,
  registerAbsence,
  reactivate,
  unlink
};
