const fs = require("fs");
const f = "server/controllers/estoqueController.js";
let c = fs.readFileSync(f, "utf8");
c = c.replace("const { listMovimentacoes } = require(\"../services/estoqueService\");",
  "const { listMovimentacoes, listProdutos, createEntrada } = require(\"../services/estoqueService\");");
c = c.replace("module.exports = { movimentacoesHandler };",
  "async function produtosHandler(req, res) {\n  try {\n    const data = await listProdutos(req.query.clinic_id || 1);\n    res.json({ produtos: data });\n  } catch (err) {\n    res.status(500).json({ error: err.message });\n  }\n}\n\nasync function criarEntradaHandler(req, res) {\n  const { produto_id, quantidade, data_entrada, fornecedor, valor, registrar_financeiro } = req.body;\n  if (!produto_id || !quantidade) {\n    return res.status(400).json({ error: \"produto_id e quantidade sao obrigatorios\" });\n  }\n  if (quantidade <= 0) {\n    return res.status(400).json({ error: \"quantidade deve ser maior que zero\" });\n  }\n  try {\n    const entrada = await createEntrada({\n      clinic_id: req.body.clinic_id || 1,\n      produto_id, quantidade: Number(quantidade),\n      data_entrada, fornecedor, valor, registrar_financeiro\n    });\n    res.status(201).json(entrada);\n  } catch (err) {\n    res.status(422).json({ error: err.message });\n  }\n}\n\nmodule.exports = { movimentacoesHandler, produtosHandler, criarEntradaHandler };");
fs.writeFileSync(f, c);
console.log("OK");

