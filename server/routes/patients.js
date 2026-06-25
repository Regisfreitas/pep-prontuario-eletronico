const express = require('express');
const {
  createPatientHandler,
  listPatientsHandler,
  getPatientHandler,
} = require('../controllers/patientsController');

const router = express.Router();

router.post('/', createPatientHandler);
router.get('/', listPatientsHandler);
router.get('/:id', getPatientHandler);

module.exports = router;
