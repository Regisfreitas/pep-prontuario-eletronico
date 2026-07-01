const express = require("express");
const {
  listarTransacoesHandler,
  listarDespesasHandler,
  listarReceitasHandler,
  criarDespesaManualHandler,
  criarReceitaManualHandler,
} = require("../controllers/financeiroController");

const router = express.Router();

router.get("/transacoes", listarTransacoesHandler);
router.get("/despesas", listarDespesasHandler);
router.get("/receitas", listarReceitasHandler);
router.post("/despesas", criarDespesaManualHandler);
router.post("/receitas", criarReceitaManualHandler);

module.exports = router;
