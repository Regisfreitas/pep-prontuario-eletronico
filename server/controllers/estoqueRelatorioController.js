const {
  relatorioPosicao,
  relatorioBaixo,
  relatorioVencimento,
} = require("../services/estoqueRelatorioService");

async function posicaoHandler(req, res) {
  const { busca, categoria, situacao } = req.query;
  try {
    const data = await relatorioPosicao({
      clinicId: req.query.clinic_id || 1,
      busca,
      categoria,
      situacao,
    });
    res.json({ data });
  } catch (err) {
    console.error("Relatorio posicao error:", err.message);
    res.status(500).json({ error: err.message });
  }
}

async function baixoHandler(req, res) {
  const { situacao, categoria } = req.query;
  try {
    const data = await relatorioBaixo({
      clinicId: req.query.clinic_id || 1,
      situacao,
      categoria,
    });
    res.json({ data });
  } catch (err) {
    console.error("Relatorio baixo error:", err.message);
    res.status(500).json({ error: err.message });
  }
}

async function vencimentoHandler(req, res) {
  const { dias, categoria } = req.query;
  try {
    const data = await relatorioVencimento({
      clinicId: req.query.clinic_id || 1,
      dias,
      categoria,
    });
    res.json({ data });
  } catch (err) {
    console.error("Relatorio vencimento error:", err.message);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { posicaoHandler, baixoHandler, vencimentoHandler };
