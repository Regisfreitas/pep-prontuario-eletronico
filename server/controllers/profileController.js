const {
  getStates,
  getSpecialties,
  getProfile,
  updateProfile,
} = require("../services/profileService");
const { getDoctorById } = require("../services/doctorService");

async function listStates(_req, res) {
  try {
    const states = await getStates();
    res.json({ states });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function listSpecialties(_req, res) {
  try {
    const specialties = await getSpecialties();
    res.json({ specialties });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function showProfile(req, res) {
  const doctorId = req.query.doctor_id || 1;
  try {
    const profile = await getProfile(doctorId);
    if (!profile) {
      return res.status(404).json({ error: "Médico não encontrado" });
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function patchProfile(req, res) {
  const doctorId = req.body.doctor_id || 1;

  const doctor = await getDoctorById(doctorId);
  if (!doctor) {
    return res.status(404).json({ error: "Médico não encontrado" });
  }

  // Validações obrigatórias (exigência Memed / RDC 1000/25)
  const cpf = req.body.cpf !== undefined ? req.body.cpf : doctor.cpf;
  const birthDate =
    req.body.birth_date !== undefined ? req.body.birth_date : doctor.birth_date;
  const crm = req.body.crm !== undefined ? req.body.crm : doctor.crm;

  if (!cpf) {
    return res.status(400).json({ error: "CPF é obrigatório" });
  }
  if (!birthDate) {
    return res
      .status(400)
      .json({ error: "Data de nascimento é obrigatória" });
  }
  if (!crm) {
    return res
      .status(400)
      .json({ error: "Número do Conselho é obrigatório" });
  }

  try {
    const profile = await updateProfile(doctorId, req.body);
    res.json(profile);
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
}

module.exports = { listStates, listSpecialties, showProfile, patchProfile };
