const { query } = require("../db");

async function seedEstoque() {
  const { rows } = await query("SELECT COUNT(*)::int AS n FROM estoque_produtos");
  if (rows[0].n > 0) return;

  // Produtos
  const produtos = [
    { id: "a0000001-0000-4000-8000-000000000001", nome: "Lidocaína 2%", descricao: "Anestésico local 2% sem vasoconstritor", unidade: "ml", saldo_atual: 50, saldo_minimo: 20, saldo_ideal: 100 },
    { id: "a0000001-0000-4000-8000-000000000002", nome: "Seringa 5ml", descricao: "Seringa descartável 5ml com agulha", unidade: "un", saldo_atual: 8, saldo_minimo: 30, saldo_ideal: 80, situacao: "baixo" },
    { id: "a0000001-0000-4000-8000-000000000003", nome: "Gaze Estéril", descricao: "Pacote com 10 gazes estéreis 7,5cm", unidade: "pc", saldo_atual: 0, saldo_minimo: 10, saldo_ideal: 50, situacao: "esgotado" },
  ];

  for (const p of produtos) {
    await query(
      `INSERT INTO estoque_produtos (id, clinic_id, nome, descricao, unidade, saldo_atual, saldo_minimo, saldo_ideal, situacao)
       VALUES ($1, 1, $2, $3, $4, $5, $6, $7, COALESCE($8, 'normal'))`,
      [p.id, p.nome, p.descricao || null, p.unidade, p.saldo_atual, p.saldo_minimo, p.saldo_ideal, p.situacao || "normal"]
    );
  }

  // Entradas
  const entradas = [
    { produto_id: produtos[0].id, quantidade: 30, data: "2026-06-20", obs: "Compra fornecedor ABC" },
    { produto_id: produtos[0].id, quantidade: 20, data: "2026-06-25", obs: "Reposição" },
    { produto_id: produtos[1].id, quantidade: 50, data: "2026-06-18", obs: "Pedido mensal" },
    { produto_id: produtos[1].id, quantidade: 20, data: "2026-06-22", obs: null },
    { produto_id: produtos[2].id, quantidade: 100, data: "2026-06-15", obs: "Compra inicial" },
  ];
  for (const e of entradas) {
    await query(
      `INSERT INTO estoque_entradas (clinic_id, produto_id, quantidade, data_entrada, observacao)
       VALUES (1, $1, $2, $3, $4)`,
      [e.produto_id, e.quantidade, e.data, e.obs]
    );
  }

  // Saídas
  const saidas = [
    { produto_id: produtos[0].id, quantidade: 5, data: "2026-06-21", obs: "Procedimento 001" },
    { produto_id: produtos[0].id, quantidade: 3, data: "2026-06-22", obs: "Procedimento 002" },
    { produto_id: produtos[0].id, quantidade: 2, data: "2026-06-26", obs: null },
    { produto_id: produtos[1].id, quantidade: 10, data: "2026-06-19", obs: "Uso diário" },
    { produto_id: produtos[1].id, quantidade: 8, data: "2026-06-20", obs: null },
    { produto_id: produtos[1].id, quantidade: 12, data: "2026-06-23", obs: "Procedimento 003" },
    { produto_id: produtos[1].id, quantidade: 15, data: "2026-06-24", obs: null },
    { produto_id: produtos[1].id, quantidade: 17, data: "2026-06-27", obs: "Procedimento 004" },
    { produto_id: produtos[2].id, quantidade: 30, data: "2026-06-16", obs: null },
    { produto_id: produtos[2].id, quantidade: 20, data: "2026-06-17", obs: "Procedimento 005" },
    { produto_id: produtos[2].id, quantidade: 50, data: "2026-06-20", obs: "Consumo excepcional" },
  ];
  for (const s of saidas) {
    await query(
      `INSERT INTO estoque_saidas (clinic_id, produto_id, quantidade, data_saida, observacao)
       VALUES (1, $1, $2, $3, $4)`,
      [s.produto_id, s.quantidade, s.data, s.obs]
    );
  }

  console.log("Seed: estoque (3 produtos, 5 entradas, 11 saídas)");
}

async function listMovimentacoes({ clinic_id, tipo, produto_id, data_inicio, data_fim }) {
  const params = [clinic_id || 1];
  let idx = 2;

  const conditions = [];
  if (produto_id) { conditions.push(`e.produto_id = $${idx++}`); params.push(produto_id); }
  if (data_inicio) { conditions.push(`e.data_mov >= $${idx++}`); params.push(data_inicio); }
  if (data_fim) { conditions.push(`e.data_mov <= $${idx++}`); params.push(data_fim); }

  let tipoFilter = "";
  if (tipo === "entrada") tipoFilter = "AND e.tipo = 'entrada'";
  if (tipo === "saida") tipoFilter = "AND e.tipo = 'saida'";

  const where = conditions.length > 0 ? "AND " + conditions.join(" AND ") : "";

  const sql = `
    SELECT
      e.id, e.tipo, p.nome AS produto_nome, e.quantidade,
      p.saldo_atual, p.situacao AS situacao_produto,
      e.data_mov, e.observacao, p.id AS produto_id
    FROM (
      SELECT id, produto_id, quantidade, data_entrada AS data_mov, observacao, 'entrada' AS tipo
      FROM estoque_entradas WHERE deleted_at IS NULL AND clinic_id = $1
      UNION ALL
      SELECT id, produto_id, quantidade, data_saida AS data_mov, observacao, 'saida' AS tipo
      FROM estoque_saidas WHERE deleted_at IS NULL AND clinic_id = $1
    ) e
    JOIN estoque_produtos p ON p.id = e.produto_id AND p.deleted_at IS NULL
    WHERE 1=1 ${tipoFilter} ${where}
    ORDER BY e.data_mov DESC, e.id DESC
    LIMIT 200
  `;

  const { rows } = await query(sql, params);
  return rows.map((r) => ({
    id: r.id,
    tipo: r.tipo,
    produto_id: r.produto_id,
    produto_nome: r.produto_nome,
    quantidade: r.quantidade,
    saldo_apos_movimentacao: r.saldo_atual,
    situacao_produto: r.situacao_produto,
    data_movimentacao: r.data_mov,
    observacao: r.observacao,
  }));
}

module.exports = { seedEstoque, listMovimentacoes };
