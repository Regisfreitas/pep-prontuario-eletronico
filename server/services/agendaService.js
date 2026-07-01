const { query } = require("../db");

async function listarAgendas({ clinicId, tipo, is_ativo } = {}) {
  const params = [clinicId || 1];
  let idx = 2;
  const conditions = [];

  if (tipo) { conditions.push(`a.tipo = $${idx++}`); params.push(tipo); }
  if (is_ativo !== undefined) {
    conditions.push(`a.is_ativo = $${idx++}`);
    params.push(is_ativo === "true" || is_ativo === true);
  }

  const where = conditions.length > 0 ? "AND " + conditions.join(" AND ") : "";

  const { rows } = await query(
    `SELECT a.*,
      (SELECT COUNT(*) FROM agenda WHERE agenda_id = a.id AND deleted_at IS NULL) AS total_compromissos
     FROM agendas a
     WHERE a.clinic_id = $1 AND a.deleted_at IS NULL ${where}
     ORDER BY a.created_at ASC`,
    params,
  );
  return rows;
}

async function criarAgenda(data) {
  const { rows } = await query(
    `INSERT INTO agendas (clinic_id, nome, descricao, cor, tipo)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [data.clinic_id || 1, data.nome, data.descricao || null, data.cor || "#3B82F6", data.tipo || null],
  );
  return rows[0];
}

async function atualizarAgenda(id, data) {
  const fields = [];
  const params = [];
  let idx = 1;

  if (data.nome !== undefined) { fields.push(`nome = $${idx++}`); params.push(data.nome); }
  if (data.descricao !== undefined) { fields.push(`descricao = $${idx++}`); params.push(data.descricao); }
  if (data.cor !== undefined) { fields.push(`cor = $${idx++}`); params.push(data.cor); }
  if (data.tipo !== undefined) { fields.push(`tipo = $${idx++}`); params.push(data.tipo); }
  if (data.is_ativo !== undefined) { fields.push(`is_ativo = $${idx++}`); params.push(data.is_ativo); }

  if (fields.length === 0) return null;

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  params.push(id);

  const { rows } = await query(
    `UPDATE agendas SET ${fields.join(", ")} WHERE id = $${idx} AND deleted_at IS NULL RETURNING *`,
    params,
  );
  return rows[0];
}

async function excluirAgenda(id) {
  // Soft delete: mark as deleted and set is_ativo = false
  const { rows } = await query(
    `UPDATE agendas SET deleted_at = CURRENT_TIMESTAMP, is_ativo = false, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND deleted_at IS NULL RETURNING *`,
    [id],
  );
  // Unlink appointments from this agenda
  if (rows[0]) {
    await query(`UPDATE agenda SET agenda_id = NULL WHERE agenda_id = $1`, [id]);
  }
  return rows[0];
}

module.exports = { listarAgendas, criarAgenda, atualizarAgenda, excluirAgenda };
