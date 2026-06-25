const { pgErrorMessage } = require("../db");
const { saveKommoCredentials } = require("../services/crmService");
const { getOrCreateMemedToken } = require("../services/doctorService");
const {
  getPrescriptions,
  getReceitaDigital,
  getPrescriptionPdf,
  createProtocolo,
  createProtocoloParceiros,
  updateOpcoesReceituario,
  uploadTemplate,
  getCidades,
  getEspecialidades,
} = require("../services/memedService");

// ---------------------------------------------------------------------------
// Kommo
// ---------------------------------------------------------------------------

async function connectKommo(req, res) {
  const { api_key, subdomain } = req.body;
  if (!api_key || !subdomain) {
    return res
      .status(400)
      .json({ error: "api_key e subdomain são obrigatórios" });
  }
  try {
    const settings = await saveKommoCredentials({ api_key, subdomain });
    res.status(201).json({
      ok: true,
      provider: settings.provider_name,
      subdomain: settings.subdomain,
      connected: settings.connected,
    });
  } catch (err) {
    res.status(422).json({ error: pgErrorMessage(err) });
  }
}

// ---------------------------------------------------------------------------
// Memed — Token do Médico
// ---------------------------------------------------------------------------

async function memedToken(req, res) {
  const doctorId = req.query.doctor_id || req.body?.doctor_id;
  if (!doctorId) {
    return res.status(400).json({ error: "doctor_id é obrigatório" });
  }
  try {
    const result = await getOrCreateMemedToken(doctorId);
    res.json({ memed_token: result.memed_token, memed_id: result.memed_id });
  } catch (err) {
    console.error("Memed token error:", err.message);
    res.status(422).json({ error: err.message });
  }
}

// ---------------------------------------------------------------------------
// Memed — Prescrições do Médico
// ---------------------------------------------------------------------------

async function memedPrescriptions(req, res) {
  const { doctorId } = req.params;
  if (!doctorId) {
    return res.status(400).json({ error: "doctorId é obrigatório" });
  }
  try {
    const { memed_token, memed_id } = await getOrCreateMemedToken(doctorId);
    const data = await getPrescriptions(memed_id);
    res.json({ memed_id, ...data });
  } catch (err) {
    console.error("Memed prescriptions error:", err.message);
    res.status(422).json({ error: err.message });
  }
}

async function memedReceitaDigital(req, res) {
  const { doctorId, prescriptionId } = req.params;
  if (!doctorId || !prescriptionId) {
    return res
      .status(400)
      .json({ error: "doctorId e prescriptionId são obrigatórios" });
  }
  try {
    const { memed_id } = await getOrCreateMemedToken(doctorId);
    const data = await getReceitaDigital(memed_id, prescriptionId);
    res.json({
      ...data,
      warning:
        "O link da receita e o código de desbloqueio são fixos — armazene-os com segurança.",
    });
  } catch (err) {
    console.error("Memed receita error:", err.message);
    res.status(422).json({ error: err.message });
  }
}

async function memedPrescriptionPdf(req, res) {
  const { doctorId, prescriptionId } = req.params;
  if (!doctorId || !prescriptionId) {
    return res
      .status(400)
      .json({ error: "doctorId e prescriptionId são obrigatórios" });
  }
  try {
    const { memed_id } = await getOrCreateMemedToken(doctorId);
    const data = await getPrescriptionPdf(memed_id, prescriptionId);
    res.json(data);
  } catch (err) {
    console.error("Memed PDF error:", err.message);
    res.status(422).json({ error: err.message });
  }
}

// ---------------------------------------------------------------------------
// Memed — Protocolos
// ---------------------------------------------------------------------------

async function memedCreateProtocolo(req, res) {
  const { doctorId, ...data } = req.body;
  if (!doctorId) {
    return res.status(400).json({ error: "doctorId é obrigatório" });
  }
  try {
    const { memed_id } = await getOrCreateMemedToken(doctorId);
    const result = await createProtocolo(memed_id, data);
    res.status(201).json(result);
  } catch (err) {
    console.error("Memed protocolo error:", err.message);
    res.status(422).json({ error: err.message });
  }
}

async function memedCreateProtocoloParceiros(req, res) {
  try {
    const result = await createProtocoloParceiros(req.body);
    res.status(201).json(result);
  } catch (err) {
    console.error("Memed protocolo parceiros error:", err.message);
    res.status(422).json({ error: err.message });
  }
}

// ---------------------------------------------------------------------------
// Memed — Opções de Receituário
// ---------------------------------------------------------------------------

async function memedUpdateOpcoesReceituario(req, res) {
  const { doctorId } = req.params;
  if (!doctorId) {
    return res.status(400).json({ error: "doctorId é obrigatório" });
  }
  try {
    const { memed_id } = await getOrCreateMemedToken(doctorId);
    const result = await updateOpcoesReceituario(memed_id, req.body);
    res.json(result);
  } catch (err) {
    console.error("Memed opcoes-receituario error:", err.message);
    res.status(422).json({ error: err.message });
  }
}

async function memedUploadTemplate(req, res) {
  const { doctorId } = req.params;
  const { template } = req.body;
  if (!doctorId || !template) {
    return res
      .status(400)
      .json({ error: "doctorId e template (base64) são obrigatórios" });
  }
  try {
    const { memed_id } = await getOrCreateMemedToken(doctorId);
    const result = await uploadTemplate(memed_id, template);
    res.json(result);
  } catch (err) {
    console.error("Memed upload-template error:", err.message);
    res.status(422).json({ error: err.message });
  }
}

// ---------------------------------------------------------------------------
// Memed — Dados Auxiliares (Cache)
// ---------------------------------------------------------------------------

async function memedCidades(_req, res) {
  try {
    const data = await getCidades();
    res.json({ cidades: data });
  } catch (err) {
    console.error("Memed cidades error:", err.message);
    res.status(422).json({ error: err.message });
  }
}

async function memedEspecialidades(_req, res) {
  try {
    const data = await getEspecialidades();
    res.json({ especialidades: data });
  } catch (err) {
    console.error("Memed especialidades error:", err.message);
    res.status(422).json({ error: err.message });
  }
}

// ---------------------------------------------------------------------------

module.exports = {
  connectKommo,
  memedToken,
  memedPrescriptions,
  memedReceitaDigital,
  memedPrescriptionPdf,
  memedCreateProtocolo,
  memedCreateProtocoloParceiros,
  memedUpdateOpcoesReceituario,
  memedUploadTemplate,
  memedCidades,
  memedEspecialidades,
};
