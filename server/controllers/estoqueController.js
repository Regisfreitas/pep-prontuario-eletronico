const { listMovimentacoes } = require("../services/estoqueService");

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

module.exports = { movimentacoesHandler };
