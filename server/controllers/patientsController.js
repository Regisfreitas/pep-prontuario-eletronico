const { pgErrorMessage } = require('../db');
const {
  listPatients,
  getPatientById,
  createPatient,
} = require('../services/patientService');

async function createPatientHandler(req, res) {
  const { full_name, birth_date, email, phone, document } = req.body;

  if (!full_name || !birth_date) {
    return res.status(400).json({ error: 'full_name e birth_date são obrigatórios' });
  }

  try {
    const patient = await createPatient({ full_name, birth_date, email, phone, document });
    res.status(201).json(patient);
  } catch (err) {
    res.status(422).json({ error: pgErrorMessage(err) });
  }
}

async function listPatientsHandler(req, res) {
  try {
    const patients = await listPatients();
    res.json({ patients });
  } catch (err) {
    res.status(500).json({ error: pgErrorMessage(err) });
  }
}

async function getPatientHandler(req, res) {
  try {
    const patient = await getPatientById(req.params.id);
    if (!patient) {
      return res.status(404).json({ error: 'Paciente não encontrado' });
    }
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: pgErrorMessage(err) });
  }
}

module.exports = {
  createPatientHandler,
  listPatientsHandler,
  getPatientHandler,
};
