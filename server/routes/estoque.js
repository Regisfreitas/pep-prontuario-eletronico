const express = require("express");
const {
  movimentacoesHandler,
  produtosHandler,
  lotesHandler,
  criarEntradaHandler,
  criarSaidaHandler,
  criarProdutoHandler,
  atualizarEntradaFinanceiroHandler,
} = require("../controllers/estoqueController");

const router = express.Router();

router.get("/movimentacoes", movimentacoesHandler);
router.get("/produtos", produtosHandler);
router.post("/entradas", criarEntradaHandler);
router.get("/lotes", lotesHandler);
router.post("/saidas", criarSaidaHandler);
router.post("/produtos", criarProdutoHandler);
router.patch("/entradas/:id/financeiro", atualizarEntradaFinanceiroHandler);

module.exports = router;
