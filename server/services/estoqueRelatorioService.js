const { query } = require("../db");

async function relatorioPosicao({ clinicId, busca, categoria, situacao }) {
  const params = [clinicId || 1];
  let idx = 2;
  const conditions = [];

  if (busca) {
    conditions.push(`(p.nome ILIKE $${idx} OR p.codigo ILIKE $${idx})`);
    params.push(`%${busca}%`);
    idx++;
  }
  if (categoria) {
    conditions.push(`p.categoria = $${idx}`);
    params.push(categoria);
    idx++;
  }
  if (situacao) {
    conditions.push(`p.situacao = $${idx}`);
    params.push(situacao);
    idx++;
  }

  const where = conditions.length > 0 ? "AND " + conditions.join(" AND ") : "";

  const sql = `
    SELECT
      p.id, p.codigo, p.nome, p.categoria, p.embalagem,
      p.saldo_atual, p.saldo_minimo, p.saldo_ideal, p.situacao,
      (SELECT MAX(e.data_entrada) FROM estoque_entradas e WHERE e.produto_id = p.id AND e.deleted_at IS NULL) AS ultima_entrada
    FROM estoque_produtos p
    WHERE p.clinic_id = $1 AND p.deleted_at IS NULL AND p.is_ativo = true ${where}
    ORDER BY p.nome ASC
  `;

  const { rows } = await query(sql, params);
  return rows.map((r) => ({
    ...r,
    ultima_entrada: r.ultima_entrada ? r.ultima_entrada.toISOString().split("T")[0] : null,
  }));
}

async function relatorioBaixo({ clinicId, situacao, categoria }) {
  const params = [clinicId || 1];
  let idx = 2;
  const conditions = [];

  if (situacao && situacao !== "ambos") {
    conditions.push(`p.situacao = $${idx}`);
    params.push(situacao);
    idx++;
  } else if (!situacao || situacao === "ambos") {
    conditions.push(`p.situacao IN ('baixo', 'esgotado')`);
  }
  if (categoria) {
    conditions.push(`p.categoria = $${idx}`);
    params.push(categoria);
    idx++;
  }

  const where = conditions.length > 0 ? "AND " + conditions.join(" AND ") : "";

  const sql = `
    SELECT
      p.id, p.codigo, p.nome, p.saldo_atual, p.saldo_minimo, p.saldo_ideal,
      p.fornecedor, p.situacao,
      (SELECT MAX(e.data_entrada) FROM estoque_entradas e WHERE e.produto_id = p.id AND e.deleted_at IS NULL) AS ultima_entrada
    FROM estoque_produtos p
    WHERE p.clinic_id = $1 AND p.deleted_at IS NULL AND p.is_ativo = true ${where}
    ORDER BY p.saldo_atual ASC, p.nome ASC
  `;

  const { rows } = await query(sql, params);
  return rows.map((r) => ({
    ...r,
    qtde_repor: Math.max(0, (r.saldo_ideal || 0) - r.saldo_atual),
    ultima_entrada: r.ultima_entrada ? r.ultima_entrada.toISOString().split("T")[0] : null,
    dias_sem_mov: r.ultima_entrada
      ? Math.floor((Date.now() - new Date(r.ultima_entrada).getTime()) / (1000 * 60 * 60 * 24))
      : null,
  }));
}

async function relatorioVencimento({ clinicId, dias, categoria }) {
  const params = [clinicId || 1];
  let idx = 2;
  const conditions = ["p.vencimento IS NOT NULL"];

  if (dias && dias !== "todos") {
    conditions.push(`p.vencimento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '${Number(dias)} days'`);
  }
  if (categoria) {
    conditions.push(`p.categoria = $${idx}`);
    params.push(categoria);
    idx++;
  }

  const where = conditions.length > 0 ? "AND " + conditions.join(" AND ") : "";

  const sql = `
    SELECT
      p.id, p.codigo, p.nome, p.lote, p.vencimento, p.saldo_atual, p.situacao
    FROM estoque_produtos p
    WHERE p.clinic_id = $1 AND p.deleted_at IS NULL AND p.is_ativo = true ${where}
    ORDER BY p.vencimento ASC
  `;

  const { rows } = await query(sql, params);
  return rows.map((r) => ({
    ...r,
    dias_restantes: r.vencimento
      ? Math.floor((new Date(r.vencimento).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null,
  }));
}

module.exports = { relatorioPosicao, relatorioBaixo, relatorioVencimento };
