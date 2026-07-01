const financeiroService = require("../services/financeiroService");

async function listarTransacoesHandler(req, res) {
  const { tipo, data_inicio, data_fim, categoria } = req.query;
  try {
    const data = await financeiroService.listarTransacoes({
      clinicId: req.query.clinic_id || 1,
      tipo, data_inicio, data_fim, categoria,
    });
    res.json({ data });
  } catch (err) {
    console.error("Financeiro transacoes error:", err.message);
    res.status(500).json({ error: err.message });
  }
}

async function listarDespesasHandler(req, res) {
  const { data_inicio, data_fim, categoria } = req.query;
  try {
    const data = await financeiroService.listarDespesas({
      clinicId: req.query.clinic_id || 1,
      data_inicio, data_fim, categoria,
    });
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function listarReceitasHandler(req, res) {
  const { data_inicio, data_fim, categoria, paciente_id } = req.query;
  try {
    const data = await financeiroService.listarReceitas({
      clinicId: req.query.clinic_id || 1,
      data_inicio, data_fim, categoria, paciente_id,
    });
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function criarDespesaManualHandler(req, res) {
  const { descricao, valor, data, categoria, fornecedor } = req.body;
  if (!descricao || !valor || valor <= 0) {
    return res.status(400).json({ error: "descricao e valor (positivo) sao obrigatorios" });
  }
  try {
    const despesa = await financeiroService.criarDespesa({
      clinic_id: req.body.clinic_id || 1,
      descricao,
      valor: Number(valor),
      data: data || new Date().toISOString().split("T")[0],
      categoria: categoria || "outros",
      fornecedor,
      is_manual: true,
    });
    res.status(201).json(despesa);
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
}

async function criarReceitaManualHandler(req, res) {
  const { descricao, valor, data, categoria, paciente_id } = req.body;
  if (!descricao || !valor || valor <= 0) {
    return res.status(400).json({ error: "descricao e valor (positivo) sao obrigatorios" });
  }
  try {
    const receita = await financeiroService.criarReceita({
      clinic_id: req.body.clinic_id || 1,
      descricao,
      valor: Number(valor),
      data: data || new Date().toISOString().split("T")[0],
      categoria: categoria || "outros",
      paciente_id,
      is_manual: true,
    });
    res.status(201).json(receita);
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
}

module.exports = {
  listarTransacoesHandler,
  listarDespesasHandler,
  listarReceitasHandler,
  criarDespesaManualHandler,
  criarReceitaManualHandler,
};
