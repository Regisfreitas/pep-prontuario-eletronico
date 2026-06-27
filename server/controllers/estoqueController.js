const { listMovimentacoes, listProdutos, createEntrada } = require("../services/estoqueService");

async function movimentacoesHandler(req, res) {
  const { clinic_id, tipo, produto_id, data_inicio, data_fim } = req.query;
  try {
    const data = await listMovimentacoes({ clinic_id, tipo, produto_id, data_inicio, data_fim });
    res.json({ movimentacoes: data });
  } catch (err) {
    console.error("Estoque movimentacoes error:", err.message);
    res.status(500).json({ error: err.message });
  }
}

async function produtosHandler(req, res) {
  try {
    const data = await listProdutos(req.query.clinic_id || 1);
    res.json({ produtos: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function criarEntradaHandler(req, res) {
  const { produto_id, quantidade, data_entrada, fornecedor, valor, registrar_financeiro } = req.body;
  if (!produto_id || !quantidade) {
    return res.status(400).json({ error: "produto_id e quantidade sao obrigatorios" });
  }
  if (quantidade <= 0) {
    return res.status(400).json({ error: "quantidade deve ser maior que zero" });
  }
  try {
    const entrada = await createEntrada({
      clinic_id: req.body.clinic_id || 1,
      produto_id, quantidade: Number(quantidade),
      data_entrada, fornecedor, valor, registrar_financeiro
    });
    res.status(201).json(entrada);
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
}

module.exports = { movimentacoesHandler, produtosHandler, criarEntradaHandler };
