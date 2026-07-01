const { query, withTransaction } = require("../db");
const financeiroService = require("./financeiroService");

async function seedEstoque() {
  const { rows } = await query(
    "SELECT COUNT(*)::int AS n FROM estoque_produtos",
  );
  if (rows[0].n >= 10) return;
  // If old seed inserted fewer products, clean and re-seed
  if (rows[0].n > 0 && rows[0].n < 10) {
    await query("DELETE FROM estoque_saidas");
    await query("DELETE FROM estoque_entradas");
    await query("DELETE FROM estoque_produtos");
  }

  // Produtos
  const produtos = [
    {
      id: "a0000001-0000-4000-8000-000000000001",
      codigo: "MED001",
      nome: "Lidocaína 2%",
      descricao: "Anestésico local injetável",
      unidade: "ml",
      embalagem: "Frasco 20ml",
      lote: "L20260601",
      vencimento: "2027-06-01",
      categoria: "Medicamento",
      fornecedor: "DentalMed Ltda",
      saldo_atual: 15,
      saldo_minimo: 5,
      saldo_ideal: 20,
      situacao: "normal",
    },
    {
      id: "a0000001-0000-4000-8000-000000000002",
      codigo: "MED002",
      nome: "Amoxicilina 500mg",
      descricao: "Antibiótico oral",
      unidade: "un",
      embalagem: "Caixa com 21 comprimidos",
      lote: "AMX20260310",
      vencimento: "2027-03-10",
      categoria: "Medicamento",
      fornecedor: "FarmaBrasil",
      saldo_atual: 8,
      saldo_minimo: 5,
      saldo_ideal: 15,
      situacao: "normal",
    },
    {
      id: "a0000001-0000-4000-8000-000000000003",
      codigo: "MED003",
      nome: "Dipirona Sódica 1g/2ml",
      descricao: "Analgésico e antitérmico injetável",
      unidade: "un",
      embalagem: "Ampola 2ml",
      lote: "DP20260520",
      vencimento: "2027-05-20",
      categoria: "Medicamento",
      fornecedor: "PharmaLife",
      saldo_atual: 2,
      saldo_minimo: 5,
      saldo_ideal: 20,
      situacao: "baixo",
    },
    {
      id: "a0000001-0000-4000-8000-000000000004",
      codigo: "CIR001",
      nome: "Fio de Sutura Nylon 3-0",
      descricao: "Fio de sutura não absorvível monofilamento",
      unidade: "un",
      embalagem: "Envelope com 12 unidades",
      lote: "SUT20260315",
      vencimento: "2028-03-15",
      categoria: "Material Cirúrgico",
      fornecedor: "Suturas Brasil",
      saldo_atual: 3,
      saldo_minimo: 5,
      saldo_ideal: 15,
      situacao: "baixo",
    },
    {
      id: "a0000001-0000-4000-8000-000000000005",
      codigo: "CIR002",
      nome: "Luva Cirúrgica Estéril Tamanho M",
      descricao: "Luva de látex estéril descartável",
      unidade: "un",
      embalagem: "Caixa com 50 pares",
      lote: "LV20260401",
      vencimento: "2029-04-01",
      categoria: "Material Cirúrgico",
      fornecedor: "MedEquip",
      saldo_atual: 0,
      saldo_minimo: 3,
      saldo_ideal: 10,
      situacao: "esgotado",
    },
    {
      id: "a0000001-0000-4000-8000-000000000006",
      codigo: "CIR003",
      nome: "Seringa Descartável 5ml",
      descricao: "Seringa com agulha 25x7",
      unidade: "un",
      embalagem: "Caixa com 100 unidades",
      lote: null,
      vencimento: null,
      categoria: "Material Cirúrgico",
      fornecedor: "MedEquip",
      saldo_atual: 250,
      saldo_minimo: 100,
      saldo_ideal: 300,
      situacao: "normal",
    },
    {
      id: "a0000001-0000-4000-8000-000000000007",
      codigo: "MED004",
      nome: "Soro Fisiológico 0,9% 250ml",
      descricao: "Solução salina para infusão",
      unidade: "un",
      embalagem: "Bolsa 250ml",
      lote: "SF20260610",
      vencimento: "2028-06-10",
      categoria: "Medicamento",
      fornecedor: "PharmaLife",
      saldo_atual: 40,
      saldo_minimo: 20,
      saldo_ideal: 50,
      situacao: "normal",
    },
    {
      id: "a0000001-0000-4000-8000-000000000008",
      codigo: "LIM001",
      nome: "Álcool Etílico 70%",
      descricao: "Antisséptico para superfícies e mãos",
      unidade: "un",
      embalagem: "Galão 5 litros",
      lote: null,
      vencimento: null,
      categoria: "Material de Limpeza",
      fornecedor: "CleanMax",
      saldo_atual: 8,
      saldo_minimo: 3,
      saldo_ideal: 10,
      situacao: "normal",
    },
    {
      id: "a0000001-0000-4000-8000-000000000009",
      codigo: "LIM002",
      nome: "Desinfetante Hospitalar",
      descricao: "Desinfetante concentrado para pisos e superfícies",
      unidade: "un",
      embalagem: "Frasco 1 litro",
      lote: "DH20260115",
      vencimento: "2027-01-15",
      categoria: "Material de Limpeza",
      fornecedor: "CleanMax",
      saldo_atual: 1,
      saldo_minimo: 3,
      saldo_ideal: 8,
      situacao: "baixo",
    },
    {
      id: "a0000001-0000-4000-8000-000000000010",
      codigo: "ESC001",
      nome: "Papel A4 75g",
      descricao: "Resma de papel branco para impressão",
      unidade: "un",
      embalagem: "Pacote com 500 folhas",
      lote: null,
      vencimento: null,
      categoria: "Material de Escritório",
      fornecedor: "OfficeMax",
      saldo_atual: 12,
      saldo_minimo: 5,
      saldo_ideal: 20,
      situacao: "normal",
    },
  ];

  for (const p of produtos) {
    await query(
      `INSERT INTO estoque_produtos (id, clinic_id, codigo, nome, descricao, unidade, embalagem, lote, vencimento, categoria, fornecedor, saldo_atual, saldo_minimo, saldo_ideal, situacao, is_ativo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, COALESCE($15, 'normal'), true)`,
      [
        p.id,
        1,
        p.codigo || null,
        p.nome,
        p.descricao || null,
        p.unidade,
        p.embalagem || null,
        p.lote || null,
        p.vencimento || null,
        p.categoria || null,
        p.fornecedor || null,
        p.saldo_atual,
        p.saldo_minimo,
        p.saldo_ideal,
        p.situacao || "normal",
      ],
    );
  }

  console.log("Seed: estoque (10 produtos)");
}

async function listMovimentacoes({
  clinic_id,
  tipo,
  produto_id,
  data_inicio,
  data_fim,
}) {
  const params = [clinic_id || 1];
  let idx = 2;

  const conditions = [];
  if (produto_id) {
    conditions.push(`e.produto_id = $${idx++}`);
    params.push(produto_id);
  }
  if (data_inicio) {
    conditions.push(`e.data_mov >= $${idx++}`);
    params.push(data_inicio);
  }
  if (data_fim) {
    conditions.push(`e.data_mov <= $${idx++}`);
    params.push(data_fim);
  }

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

async function listProdutos({ clinicId, busca, categoria, situacao } = {}) {
  const params = [clinicId || 1];
  let idx = 2;
  const conditions = [];

  if (busca) {
    conditions.push(`(nome ILIKE $${idx} OR codigo ILIKE $${idx})`);
    params.push(`%${busca}%`);
    idx++;
  }
  if (categoria) {
    conditions.push(`categoria = $${idx}`);
    params.push(categoria);
    idx++;
  }
  if (situacao) {
    conditions.push(`situacao = $${idx}`);
    params.push(situacao);
    idx++;
  }

  const where = conditions.length > 0 ? "AND " + conditions.join(" AND ") : "";

  const { rows } = await query(
    `SELECT id, codigo, nome, descricao, embalagem, lote, vencimento, categoria, fornecedor,
            saldo_atual, saldo_minimo, saldo_ideal, situacao, unidade
     FROM estoque_produtos
     WHERE clinic_id = $1 AND deleted_at IS NULL AND is_ativo = true ${where}
     ORDER BY nome ASC`,
    params,
  );
  return rows;
}

async function listLotesByProduto(produtoId, clinicId) {
  const { rows } = await query(
    `SELECT
       e.lote,
       e.validade,
       e.quantidade - COALESCE(s.total_usado, 0) AS saldo
     FROM (
       SELECT lote, validade, SUM(quantidade) AS quantidade
       FROM estoque_entradas
       WHERE produto_id = $1 AND clinic_id = $2 AND lote IS NOT NULL AND deleted_at IS NULL
       GROUP BY lote, validade
     ) e
     LEFT JOIN (
       SELECT lote, SUM(quantidade) AS total_usado
       FROM estoque_saidas
       WHERE produto_id = $1 AND lote IS NOT NULL AND deleted_at IS NULL
       GROUP BY lote
     ) s ON s.lote = e.lote
     WHERE e.quantidade - COALESCE(s.total_usado, 0) > 0
     ORDER BY e.validade ASC NULLS LAST`,
    [produtoId, clinicId || 1],
  );
  return rows;
}

async function createEntrada(data) {
  const entrada = await query(
    `INSERT INTO estoque_entradas (clinic_id, produto_id, quantidade, data_entrada, fornecedor, valor, registrar_financeiro, observacao, lote, validade)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      data.clinic_id || 1,
      data.produto_id,
      data.quantidade,
      data.data_entrada || new Date().toISOString().slice(0, 10),
      data.fornecedor || null,
      data.valor || null,
      data.registrar_financeiro || false,
      data.fornecedor
        ? "Fornecedor: " + data.fornecedor
        : "Entrada registrada pelo sistema",
      data.lote || null,
      data.validade || null,
    ],
  );
  const entradaRow = entrada.rows[0];

  // Auto-create despesa if financeiro flag is set
  if (
    entradaRow.registrar_financeiro &&
    entradaRow.valor &&
    Number(entradaRow.valor) > 0
  ) {
    try {
      await financeiroService.criarDespesa({
        clinic_id: data.clinic_id || 1,
        estoque_entrada_id: entradaRow.id,
        descricao: `Entrada de estoque - ${data.fornecedor || "sem fornecedor"}`,
        valor: Number(entradaRow.valor),
        data: entradaRow.data_entrada,
        categoria: "estoque",
        fornecedor: data.fornecedor,
        is_manual: false,
      });
    } catch (err) {
      console.warn("Financeiro auto-create despesa warning:", err.message);
    }
  }

  return entradaRow;
}

async function createSaida(data) {
  // Validate sufficient balance
  const {
    rows: [produto],
  } = await query(
    `SELECT saldo_atual, nome AS produto_nome, unidade FROM estoque_produtos
     WHERE id = $1 AND clinic_id = $2 AND deleted_at IS NULL AND is_ativo = true`,
    [data.produto_id, data.clinic_id || 1],
  );
  if (!produto) throw new Error("Produto não encontrado");
  if (produto.saldo_atual < data.quantidade) {
    throw new Error("Saldo insuficiente");
  }

  const { rows } = await query(
    `INSERT INTO estoque_saidas (clinic_id, produto_id, paciente_id, quantidade, data_saida, valor, registrar_financeiro, observacao, lote, validade)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      data.clinic_id || 1,
      data.produto_id,
      data.paciente_id,
      data.quantidade,
      data.data_saida || new Date().toISOString().slice(0, 10),
      data.valor || null,
      data.registrar_financeiro || false,
      data.observacao || "Saída registrada pelo sistema",
      data.lote || null,
      data.validade || null,
    ],
  );
  const saidaRow = rows[0];

  // Auto-create receita if financeiro flag is set
  if (
    saidaRow.registrar_financeiro &&
    saidaRow.valor &&
    Number(saidaRow.valor) > 0
  ) {
    try {
      await financeiroService.criarReceita({
        clinic_id: data.clinic_id || 1,
        estoque_saida_id: saidaRow.id,
        paciente_id: data.paciente_id,
        descricao: `Saída de estoque - ${produto.produto_nome} (${data.quantidade} ${produto.unidade})`,
        valor: Number(saidaRow.valor),
        data: saidaRow.data_saida,
        categoria: "estoque",
        is_manual: false,
      });
    } catch (err) {
      console.warn("Financeiro auto-create receita warning:", err.message);
    }
  }

  return saidaRow;
}

async function createProduto(data) {
  // Check unique codigo within clinic
  if (data.codigo) {
    const { rows: existing } = await query(
      `SELECT id FROM estoque_produtos
       WHERE clinic_id = $1 AND codigo = $2 AND deleted_at IS NULL`,
      [data.clinic_id || 1, data.codigo],
    );
    if (existing.length > 0) {
      throw new Error("Código já existe");
    }
  }

  const saldoInicial = data.saldo_inicial || 0;
  const saldoMinimo = data.saldo_minimo || 1;

  if (data.criar_entrada_auto) {
    // Create product with saldo_atual=0 (entrada will be created later by the second modal)
    const { rows } = await query(
      `INSERT INTO estoque_produtos
         (clinic_id, codigo, nome, descricao, embalagem, categoria, fornecedor, lote, vencimento,
          saldo_atual, saldo_minimo, saldo_ideal, situacao, is_ativo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 0, $10, $11, 'esgotado', true)
       RETURNING *`,
      [
        data.clinic_id || 1,
        data.codigo || null,
        data.nome,
        data.descricao || null,
        data.embalagem,
        data.categoria,
        data.fornecedor || null,
        data.lote || null,
        data.vencimento || null,
        saldoMinimo,
        data.saldo_ideal || null,
      ],
    );
    return rows[0];
  }

  // Normal flow: calculate situacao and insert with saldo_atual = saldo_inicial
  let situacao;
  if (saldoInicial <= 0) {
    situacao = "esgotado";
  } else if (saldoInicial <= saldoMinimo) {
    situacao = "baixo";
  } else {
    situacao = "normal";
  }

  const { rows } = await query(
    `INSERT INTO estoque_produtos
       (clinic_id, codigo, nome, descricao, embalagem, categoria, fornecedor, lote, vencimento,
        saldo_atual, saldo_minimo, saldo_ideal, situacao, is_ativo)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true)
     RETURNING *`,
    [
      data.clinic_id || 1,
      data.codigo || null,
      data.nome,
      data.descricao || null,
      data.embalagem,
      data.categoria,
      data.fornecedor || null,
      data.lote || null,
      data.vencimento || null,
      saldoInicial,
      saldoMinimo,
      data.saldo_ideal || null,
      situacao,
    ],
  );
  return rows[0];
}

async function updateEntradaFinanceiro(id, data) {
  const { rows } = await query(
    `UPDATE estoque_entradas
     SET valor = $1, registrar_financeiro = $2
     WHERE id = $3 AND deleted_at IS NULL
     RETURNING *`,
    [data.valor || null, data.registrar_financeiro || false, id],
  );
  return rows[0];
}

module.exports = {
  seedEstoque,
  listMovimentacoes,
  listProdutos,
  listLotesByProduto,
  createEntrada,
  createSaida,
  createProduto,
  updateEntradaFinanceiro,
};
