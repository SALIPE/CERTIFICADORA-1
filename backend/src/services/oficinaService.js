const db = require('../config/database');

function mapOffice(row) {
  if (!row) return null;
  return {
    id: row.id,
    titulo: row.titulo,
    tema: row.tema,
    descricao: row.descricao,
    dataInicio: row.data_inicio,
    dataFim: row.data_fim,
    status: row.status,
    local: row.local,
    instrutor: row.instrutor,
    vagas: row.vagas,
    numeroVoluntarios: parseInt(row.num_voluntarios) || 0, // <-- LINHA NOVA AQUI
    numeroParticipantes: parseInt(row.num_participantes) || 0, // <-- LINHA NOVA AQUI
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
    criadoPor: row.criado_por
  };
}

async function create({ titulo, tema, descricao, dataInicio, dataFim, local, instrutor, vagas, status = 'ATIVA' }, criadoPor) {
  if (!titulo || !tema || !dataInicio || !dataFim) {
    const error = new Error(
      'Título, tema, data inicial e data final são obrigatórios.');
    error.statusCode = 400;
    throw error;
  }

  const query = `
    INSERT INTO oficina (
      titulo, tema, descricao, data_inicio, data_fim, local, instrutor, vagas, status, criado_por
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `;

  const { rows } = await db.query(query,
    [titulo, tema, descricao || null, dataInicio, dataFim, local || 'A definir', instrutor || 'Instrutor TEDI', vagas || 30, status, criadoPor]);
  return mapOffice(rows[0]);
}

async function list() {
  const query = `
    SELECT o.*, COUNT(uo.usuario_id) as num_voluntarios
    FROM oficina o
    LEFT JOIN usuario_oficina uo ON o.id = uo.oficina_id
    GROUP BY o.id
    ORDER BY o.criado_em DESC
  `;
  const { rows } = await db.query(query);
  return rows.map(mapOffice);
}

async function listOficinasVoluntarios(usuarioId) {
  const query = `
    SELECT o.*, COUNT(uo.usuario_id) as num_voluntarios
    FROM oficina o
      LEFT JOIN usuario_oficina uo ON o.id = uo.oficina_id
    WHERE NOT EXISTS (
      SELECT 1
      FROM usuario_oficina uof
      WHERE uof.oficina_id = o.id
        AND uof.usuario_id = $1
        AND uof.ativo = false
    )
    GROUP BY o.id
    ORDER BY o.criado_em DESC
  `;
  const { rows } = await db.query(query, [usuarioId]);
  return rows.map(mapOffice);
}

async function getInscricoesUsuario(usuarioId) {
  const query = `
    SELECT uo.oficina_id 
    FROM usuario_oficina uo
    INNER JOIN oficina o ON uo.oficina_id = o.id
    WHERE uo.usuario_id = $1 
      AND uo.ativo = true 
      AND o.status = 'ATIVA'
  `;
  const { rows } = await db.query(query, [usuarioId]);

  return rows.map(row => row.oficina_id);
}

async function getPresencasUsuario(usuarioId) {
  const query = `
    SELECT uo.oficina_id 
    FROM usuario_oficina uo
    INNER JOIN oficina o ON uo.oficina_id = o.id
    WHERE uo.usuario_id = $1 
      AND uo.presente = true
  `;
  const { rows } = await db.query(query, [usuarioId]);

  return rows.map(row => row.oficina_id);
}

async function findById(id) {
  const { rows } = await db.query('SELECT * FROM oficina WHERE id = $1', [id]);
  const office = mapOffice(rows[0]);

  if (!office) {
    const error = new Error('Oficina não encontrada.');
    error.statusCode = 404;
    throw error;
  }

  return office;
}

async function update(id, {
  titulo, tema, descricao, dataInicio, dataFim,
  status, local, instrutor, vagas, numeroParticipantes }) {

  await findById(id);

  const query = `
    UPDATE oficina
    SET titulo = COALESCE($2, titulo),
        tema = COALESCE($3, tema),
        descricao = COALESCE($4, descricao),
        data_inicio = COALESCE($5, data_inicio),
        data_fim = COALESCE($6, data_fim),
        status = COALESCE($7, status),
        local = COALESCE($8, local),
        instrutor = COALESCE($9, instrutor),
        vagas = COALESCE($10, vagas),
        num_participantes = COALESCE($11, num_participantes)
    WHERE id = $1
    RETURNING *
  `;

  const { rows } = await db.query(query,
    [id, titulo, tema, descricao, dataInicio, dataFim, status, local,
      instrutor, vagas, numeroParticipantes]);

  return mapOffice(rows[0]);
}

async function activate(id) {
  return update(id, { status: 'ATIVA' });
}

async function deactivate(id) {
  return update(id, { status: 'INATIVA' });
}

async function finish(id) {
  return update(id, { status: 'CONCLUIDA' });
}

async function listVolunteers(oficinaId) {
  await findById(oficinaId);

  const query = `
    SELECT
      uo.id,
      uo.usuario_id,
      u.nome,
      u.email,
      u.perfil,
      uo.presente,
      uo.ativo
    FROM usuario_oficina uo
    INNER JOIN usuario u ON u.id = uo.usuario_id
    WHERE uo.oficina_id = $1
  `;

  const { rows } = await db.query(query, [oficinaId]);
  return rows;
}

async function inscreverVoluntario(oficinaId, usuarioId) {
  await findById(oficinaId);

  const checkQuery = `SELECT id FROM usuario_oficina 
          WHERE oficina_id = $1 AND usuario_id = $2`;
  const checkResult = await db.query(checkQuery, [oficinaId, usuarioId]);

  if (checkResult.rows.length > 0) {
    const error = new Error('Usuário já está inscrito nesta oficina.');
    error.statusCode = 400;
    throw error;
  }

  const query = `
    INSERT INTO usuario_oficina (oficina_id, usuario_id, ativo)
    VALUES ($1, $2, true)
    RETURNING *
  `;

  const { rows } = await db.query(query, [oficinaId, usuarioId]);
  return rows[0];
}

async function desinscreverVoluntario(oficinaId, usuarioId) {
  const query = `DELETE FROM usuario_oficina
          WHERE oficina_id = $1 AND usuario_id = $2 RETURNING *`;
  const { rows } = await db.query(query, [oficinaId, usuarioId]);

  if (rows.length === 0) {
    const error = new Error('Inscrição não encontrada.');
    error.statusCode = 404;
    throw error;
  }
  return rows[0];
}

module.exports = {
  create,
  list,
  listOficinasVoluntarios,
  getPresencasUsuario,
  findById,
  update,
  activate,
  deactivate,
  finish,
  listVolunteers,
  inscreverVoluntario,
  getInscricoesUsuario,
  desinscreverVoluntario
};
