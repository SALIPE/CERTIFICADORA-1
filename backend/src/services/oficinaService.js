const db = require('../config/database');

function mapOffice(row) {
  if (!row) return null;

  return {
    id: row.id,
    titulo: row.titulo,
    tema: row.tema,
    descricao: row.descricao,
    dataInicio: row.data_inicio, // Estava row.inicio
    dataFim: row.data_fim,       // Estava row.fim
    status: row.status,
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
    criadoPor: row.criado_por
    // A linha numeroParticipantes: row.num_participantes foi apagada
  };
}

async function create({ titulo, tema, descricao,
  dataInicio, dataFim,
  status = 'ATIVA' }, criadoPor) {
  if (!titulo || !tema || !dataInicio || !dataFim) {
    const error = new Error(
      'Título, tema, data inicial e data final são obrigatórios.');
    error.statusCode = 400;
    throw error;
  }

  const query = `
    INSERT INTO oficina (
      titulo, tema, descricao, data_inicio, data_fim, status, criado_por
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;

  const { rows } = await db.query(query,
    [titulo, tema, descricao || null,
      dataInicio, dataFim, status, criadoPor]);
  return mapOffice(rows[0]);
}

async function list() {
  const { rows } = await db.query(
    'SELECT * FROM oficina ORDER BY criado_em DESC');
  return rows.map(mapOffice);
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

async function update(id, { titulo, tema, descricao,
  dataInicio, dataFim, status, numeroParticipantes }) {
  await findById(id);

  const query = `
    UPDATE oficina
    SET titulo = COALESCE($2, titulo),
        tema = COALESCE($3, tema),
        descricao = COALESCE($4, descricao),
        data_inicio = COALESCE($5, data_inicio),
        data_fim = COALESCE($6, data_fim),
        status = COALESCE($7, status)
    WHERE id = $1
    RETURNING *
  `;

  const { rows } = await db.query(query,
    [id, titulo, tema, descricao,
      dataInicio, dataFim, status]);
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
      uo.total_presencas,
      uo.total_faltas,
      uo.percentual_frequencia,
      uo.horas_cumpridas,
      uo.ativo
    FROM usuario_oficina uo
    INNER JOIN usuario u ON u.id = uo.usuario_id
    WHERE uo.oficina_id = $1
    ORDER BY u.nome ASC
  `;

  const { rows } = await db.query(query, [oficinaId]);
  return rows;
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
