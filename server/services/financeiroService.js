const { query } = require("../db");

// --- Despesas ---

async function criarDespesa(data) {
  const { rows } = await query(
    `INSERT INTO despesas (clinic_id, estoque_entrada_id, descricao, valor, data, categoria, fornecedor, is_manual)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      data.clinic_id || 1,
      data.estoque_entrada_id || null,
      data.descricao,
      data.valor,
      data.data || new Date().toISOString().split("T")[0],
      data.categoria || "estoque",
      data.fornecedor || null,
      data.is_manual || false,
    ],
  );
  return rows[0];
}

async function listarDespesas({ clinicId, data_inicio, data_fim, categoria }) {
  const params = [clinicId || 1];
  let idx = 2;
  const conditions = [];

  if (data_inicio) { conditions.push(`d.data >= $${idx++}`); params.push(data_inicio); }
  if (data_fim) { conditions.push(`d.data <= $${idx++}`); params.push(data_fim); }
  if (categoria) { conditions.push(`d.categoria = $${idx++}`); params.push(categoria); }

  const where = conditions.length > 0 ? "AND " + conditions.join(" AND ") : "";

  const { rows } = await query(
    `SELECT d.* FROM despesas d
     WHERE d.clinic_id = $1 AND d.deleted_at IS NULL ${where}
     ORDER BY d.data DESC, d.created_at DESC`,
    params,
  );
  return rows;
}

// --- Receitas ---

async function criarReceita(data) {
  const { rows } = await query(
    `INSERT INTO receitas (clinic_id, estoque_saida_id, paciente_id, descricao, valor, data, categoria, is_manual)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      data.clinic_id || 1,
      data.estoque_saida_id || null,
      data.paciente_id || null,
      data.descricao,
      data.valor,
      data.data || new Date().toISOString().split("T")[0],
      data.categoria || "estoque",
      data.is_manual || false,
    ],
  );
  return rows[0];
}

async function listarReceitas({ clinicId, data_inicio, data_fim, categoria, paciente_id }) {
  const params = [clinicId || 1];
  let idx = 2;
  const conditions = [];

  if (data_inicio) { conditions.push(`r.data >= $${idx++}`); params.push(data_inicio); }
  if (data_fim) { conditions.push(`r.data <= $${idx++}`); params.push(data_fim); }
  if (categoria) { conditions.push(`r.categoria = $${idx++}`); params.push(categoria); }
  if (paciente_id) { conditions.push(`r.paciente_id = $${idx++}`); params.push(paciente_id); }

  const where = conditions.length > 0 ? "AND " + conditions.join(" AND ") : "";

  const { rows } = await query(
    `SELECT r.* FROM receitas r
     WHERE r.clinic_id = $1 AND r.deleted_at IS NULL ${where}
     ORDER BY r.data DESC, r.created_at DESC`,
    params,
  );
  return rows;
}

// --- Transacoes Unificadas ---

async function listarTransacoes({ clinicId, tipo, data_inicio, data_fim, categoria }) {
  const params = [];
  let idx = 1;
  const conditions = [`t.clinic_id = $${idx++}`];
  params.push(clinicId || 1);

  if (data_inicio) { conditions.push(`t.data >= $${idx++}`); params.push(data_inicio); }
  if (data_fim) { conditions.push(`t.data <= $${idx++}`); params.push(data_fim); }
  if (categoria) { conditions.push(`t.categoria = $${idx++}`); params.push(categoria); }

  const where = conditions.join(" AND ");

  let sql;
  if (tipo === "despesa") {
    sql = `SELECT id, 'despesa' AS tipo, descricao, valor, data, categoria, is_manual FROM despesas WHERE ${where} AND deleted_at IS NULL ORDER BY data DESC, created_at DESC`;
  } else if (tipo === "receita") {
    sql = `SELECT id, 'receita' AS tipo, descricao, valor, data, categoria, is_manual FROM receitas WHERE ${where} AND deleted_at IS NULL ORDER BY data DESC, created_at DESC`;
  } else {
    sql = `
      SELECT id, 'despesa' AS tipo, descricao, valor, data, categoria, is_manual FROM despesas WHERE ${where} AND deleted_at IS NULL
      UNION ALL
      SELECT id, 'receita' AS tipo, descricao, valor, data, categoria, is_manual FROM receitas WHERE ${where} AND deleted_at IS NULL
      ORDER BY data DESC, id DESC
    `;
  }

  const { rows } = await query(sql, params);
  return rows.map((r) => ({
    ...r,
    origem: r.is_manual ? "Manual" : "Automático",
    valor: Number(r.valor),
  }));
}

module.exports = { criarDespesa, listarDespesas, criarReceita, listarReceitas, listarTransacoes };
