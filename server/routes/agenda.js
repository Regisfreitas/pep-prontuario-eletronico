const express = require("express");
const {
  listAgenda,
  createConsulta,
  createBloqueio,
} = require("../controllers/agendaController");

const router = express.Router();

const {
  listAgenda,
  createConsulta,
  createBloqueio,
  listarAgendasHandler,
  criarAgendaHandler,
  atualizarAgendaHandler,
  excluirAgendaHandler,
} = require("../controllers/agendaController");

router.get("/", listAgenda);
router.get("/lista", listarAgendasHandler);
router.post("/", criarAgendaHandler);
router.put("/:id", atualizarAgendaHandler);
router.delete("/:id", excluirAgendaHandler);
router.post("/consulta", createConsulta);
router.post("/bloqueio", createBloqueio);

module.exports = router;
