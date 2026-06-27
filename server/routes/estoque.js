const express = require("express");
const { movimentacoesHandler } = require("../controllers/estoqueController");

const router = express.Router();

router.get("/movimentacoes", movimentacoesHandler);

module.exports = router;
