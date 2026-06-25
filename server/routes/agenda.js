const express = require('express');
const {
  listAgenda,
  createConsulta,
  createBloqueio,
} = require('../controllers/agendaController');

const router = express.Router();

router.get('/', listAgenda);
router.post('/consulta', createConsulta);
router.post('/bloqueio', createBloqueio);

module.exports = router;
