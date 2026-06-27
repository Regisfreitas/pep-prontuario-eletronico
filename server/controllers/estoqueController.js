const {
  listMovimentacoes,
  listProdutos,
  listLotesByProduto,
  createEntrada,
  createSaida,
  createProduto,
  updateEntradaFinanceiro,
} = require("../services/estoqueService");

async function movimentacoesHandler(req, res) {
  const { clinic_id, tipo, produto_id, data_inicio, data_fim } = req.query;
  try {
    const data = await listMovimentacoes({
      clinic_id,
      tipo,
      produto_id,
      data_inicio,
      data_fim,
    });
    res.json({ movimentacoes: data });
  } catch (err) {
    console.error("Estoque movimentacoes error:", err.message);
    res.status(500).json({ error: err.message });
  }
}

async function produtosHandler(req, res) {
  const { busca, categoria, situacao } = req.query;
  try {
    const data = await listProdutos({
      clinicId: req.query.clinic_id || 1,
      busca,
      categoria,
      situacao,
    });
    res.json({ produtos: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function lotesHandler(req, res) {
  const { produto_id } = req.query;
  if (!produto_id) return res.json({ lotes: [] });
  try {
    const lotes = await listLotesByProduto(
      produto_id,
      req.query.clinic_id || 1,
    );
    res.json({ lotes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function criarEntradaHandler(req, res) {
  const {
    produto_id,
    quantidade,
    data_entrada,
    fornecedor,
    valor,
    registrar_financeiro,
    lote,
    validade,
  } = req.body;
  if (!produto_id || !quantidade) {
    return res
      .status(400)
      .json({ error: "produto_id e quantidade sao obrigatorios" });
  }
  if (quantidade <= 0) {
    return res
      .status(400)
      .json({ error: "quantidade deve ser maior que zero" });
  }
  try {
    const entrada = await createEntrada({
      clinic_id: req.body.clinic_id || 1,
      produto_id,
      quantidade: Number(quantidade),
      data_entrada,
      fornecedor,
      valor,
      registrar_financeiro,
      lote,
      validade,
    });
    res.status(201).json(entrada);
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
}

async function criarSaidaHandler(req, res) {
  const {
    produto_id,
    paciente_id,
    quantidade,
    data_saida,
    valor,
    registrar_financeiro,
    lote,
    validade,
  } = req.body;
  if (!produto_id || !quantidade) {
    return res
      .status(400)
      .json({ error: "produto_id e quantidade sao obrigatorios" });
  }
  if (quantidade <= 0) {
    return res
      .status(400)
      .json({ error: "quantidade deve ser maior que zero" });
  }
  try {
    const saida = await createSaida({
      clinic_id: req.body.clinic_id || 1,
      produto_id,
      paciente_id,
      quantidade: Number(quantidade),
      data_saida,
      valor,
      registrar_financeiro,
      lote,
      validade,
    });
    res.status(201).json(saida);
  } catch (err) {
    const status = err.message === "Saldo insuficiente" ? 400 : 422;
    res.status(status).json({ error: err.message });
  }
}

async function criarProdutoHandler(req, res) {
  const {
    codigo,
    nome,
    descricao,
    embalagem,
    categoria,
    fornecedor,
    lote,
    vencimento,
    saldo_inicial,
    saldo_minimo,
    saldo_ideal,
    criar_entrada_auto,
  } = req.body;
  if (!nome || !embalagem || !categoria) {
    return res
      .status(400)
      .json({ error: "nome, embalagem e categoria sao obrigatorios" });
  }
  if (saldo_minimo !== undefined && saldo_minimo < 0) {
    return res
      .status(400)
      .json({ error: "saldo_minimo deve ser maior ou igual a zero" });
  }
  try {
    const result = await createProduto({
      clinic_id: req.body.clinic_id || 1,
      codigo,
      nome,
      descricao,
      embalagem,
      categoria,
      fornecedor,
      lote,
      vencimento,
      saldo_inicial: saldo_inicial !== undefined ? Number(saldo_inicial) : 0,
      saldo_minimo: saldo_minimo !== undefined ? Number(saldo_minimo) : 1,
      saldo_ideal: saldo_ideal !== undefined ? Number(saldo_ideal) : null,
      criar_entrada_auto: !!criar_entrada_auto,
    });
    res.status(201).json(result);
  } catch (err) {
    const status = err.message === "Código já existe" ? 409 : 422;
    res.status(status).json({ error: err.message });
  }
}

async function atualizarEntradaFinanceiroHandler(req, res) {
  const { id } = req.params;
  const { valor, registrar_financeiro } = req.body;
  try {
    const entrada = await updateEntradaFinanceiro(id, {
      valor: valor !== undefined ? Number(valor) : null,
      registrar_financeiro: !!registrar_financeiro,
    });
    if (!entrada)
      return res.status(404).json({ error: "Entrada não encontrada" });
    res.json(entrada);
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
}

module.exports = {
  movimentacoesHandler,
  produtosHandler,
  lotesHandler,
  criarEntradaHandler,
  criarSaidaHandler,
  criarProdutoHandler,
  atualizarEntradaFinanceiroHandler,
};
