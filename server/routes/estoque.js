const express = require("express");
const { movimentacoesHandler, produtosHandler, criarEntradaHandler } = require("../controllers/estoqueController");

const router = express.Router();

router.get("/movimentacoes", movimentacoesHandler);
router.get("/produtos", produtosHandler);
router.post("/entradas", criarEntradaHandler);

module.exports = router;
