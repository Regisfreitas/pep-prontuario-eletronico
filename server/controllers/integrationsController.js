const { pgErrorMessage } = require("../db");
const { saveKommoCredentials } = require("../services/crmService");
const { getOrCreateMemedToken } = require("../services/doctorService");
const {
  getPrescriptions,
  getPrescriptionById,
  deletePrescription,
  getReceitaDigital,
  getPrescriptionPdf,
  createProtocolo,
  createProtocoloParceiros,
  listProtocolos,
  listProtocolosParceiros,
  deleteProtocolo,
  deleteProtocoloParceiros,
  getOpcoesReceituario,
  updateOpcoesReceituario,
  uploadTemplate,
  getCidades,
  getEspecialidades,
  getIngredients,
} = require("../services/memedService");

// ---------------------------------------------------------------------------
// Kommo
// ---------------------------------------------------------------------------

async function connectKommo(req, res) {
  const { api_key, subdomain } = req.body;
  if (!api_key || !subdomain)
    return res
      .status(400)
      .json({ error: "api_key e subdomain são obrigatórios" });
  try {
    const settings = await saveKommoCredentials({ api_key, subdomain });
    res
      .status(201)
      .json({
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
// Helper to get token + handle errors
// ---------------------------------------------------------------------------

async function withMemedToken(doctorId, fn) {
  const { memed_token } = await getOrCreateMemedToken(doctorId);
  return fn(memed_token);
}

// ---------------------------------------------------------------------------
// Memed — Token do Médico
// ---------------------------------------------------------------------------

async function memedToken(req, res) {
  const doctorId = req.query.doctor_id || req.body?.doctor_id;
  if (!doctorId)
    return res.status(400).json({ error: "doctor_id é obrigatório" });
  try {
    const result = await getOrCreateMemedToken(doctorId);
    res.json({ memed_token: result.memed_token, memed_id: result.memed_id });
  } catch (err) {
    console.error("Memed token error:", err.message);
    res.status(422).json({ error: err.message });
  }
}

// ---------------------------------------------------------------------------
// Memed — Prescrições
// ---------------------------------------------------------------------------

async function memedPrescriptions(req, res) {
  const { doctorId } = req.params;
  try {
    const data = await withMemedToken(doctorId, (t) => getPrescriptions(t));
    res.json(data);
  } catch (err) {
    console.error("Memed prescriptions error:", err.message);
    res.status(422).json({ error: err.message });
  }
}

async function memedPrescriptionById(req, res) {
  const { doctorId, prescriptionId } = req.params;
  try {
    const data = await withMemedToken(doctorId, (t) =>
      getPrescriptionById(prescriptionId, t),
    );
    res.json(data);
  } catch (err) {
    console.error("Memed prescription by id error:", err.message);
    res.status(422).json({ error: err.message });
  }
}

async function memedDeletePrescription(req, res) {
  const { doctorId, prescriptionId } = req.params;
  try {
    await withMemedToken(doctorId, (t) =>
      deletePrescription(prescriptionId, t),
    );
    res.json({ ok: true, prescriptionId });
  } catch (err) {
    console.error("Memed delete prescription error:", err.message);
    res.status(422).json({ error: err.message });
  }
}

async function memedReceitaDigital(req, res) {
  const { doctorId, prescriptionId } = req.params;
  try {
    const data = await withMemedToken(doctorId, (t) =>
      getReceitaDigital(prescriptionId, t),
    );
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
  try {
    const data = await withMemedToken(doctorId, (t) =>
      getPrescriptionPdf(prescriptionId, t),
    );
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
  if (!doctorId)
    return res.status(400).json({ error: "doctorId é obrigatório" });
  try {
    const result = await withMemedToken(doctorId, (t) =>
      createProtocolo(t, data),
    );
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

async function memedListProtocolos(req, res) {
  const { doctorId } = req.params;
  try {
    const data = await withMemedToken(doctorId, (t) => listProtocolos(t));
    res.json(data);
  } catch (err) {
    console.error("Memed list protocolos error:", err.message);
    res.status(422).json({ error: err.message });
  }
}

async function memedListProtocolosParceiros(_req, res) {
  try {
    const data = await listProtocolosParceiros();
    res.json(data);
  } catch (err) {
    console.error("Memed list protocolos parceiros error:", err.message);
    res.status(422).json({ error: err.message });
  }
}

async function memedDeleteProtocolo(req, res) {
  const { doctorId, protocoloId } = req.params;
  try {
    await withMemedToken(doctorId, (t) => deleteProtocolo(protocoloId, t));
    res.json({ ok: true, protocoloId });
  } catch (err) {
    console.error("Memed delete protocolo error:", err.message);
    res.status(422).json({ error: err.message });
  }
}

async function memedDeleteProtocoloParceiros(req, res) {
  const { protocoloId } = req.params;
  try {
    await deleteProtocoloParceiros(protocoloId);
    res.json({ ok: true, protocoloId });
  } catch (err) {
    console.error("Memed delete protocolo parceiros error:", err.message);
    res.status(422).json({ error: err.message });
  }
}

// ---------------------------------------------------------------------------
// Memed — Receituário
// ---------------------------------------------------------------------------

async function memedGetOpcoesReceituario(req, res) {
  const { doctorId } = req.params;
  try {
    const data = await withMemedToken(doctorId, (t) => getOpcoesReceituario(t));
    res.json(data);
  } catch (err) {
    console.error("Memed get opcoes-receituario error:", err.message);
    res.status(422).json({ error: err.message });
  }
}

async function memedUpdateOpcoesReceituario(req, res) {
  const { doctorId } = req.params;
  try {
    const result = await withMemedToken(doctorId, (t) =>
      updateOpcoesReceituario(t, req.body),
    );
    res.json(result);
  } catch (err) {
    console.error("Memed opcoes-receituario error:", err.message);
    res.status(422).json({ error: err.message });
  }
}

async function memedUploadTemplate(req, res) {
  const { doctorId } = req.params;
  const { template } = req.body;
  if (!doctorId || !template)
    return res
      .status(400)
      .json({ error: "doctorId e template são obrigatórios" });
  try {
    const result = await withMemedToken(doctorId, (t) =>
      uploadTemplate(t, template),
    );
    res.json(result);
  } catch (err) {
    console.error("Memed upload-template error:", err.message);
    res.status(422).json({ error: err.message });
  }
}

// ---------------------------------------------------------------------------
// Memed — Dados Auxiliares
// ---------------------------------------------------------------------------

async function memedCidades(_req, res) {
  try {
    res.json({ cidades: await getCidades() });
  } catch (err) {
    console.error("Memed cidades error:", err.message);
    res.status(422).json({ error: err.message });
  }
}

async function memedEspecialidades(_req, res) {
  try {
    res.json({ especialidades: await getEspecialidades() });
  } catch (err) {
    console.error("Memed especialidades error:", err.message);
    res.status(422).json({ error: err.message });
  }
}

async function memedIngredients(req, res) {
  const terms = req.query.terms;
  if (!terms) return res.status(400).json({ error: "terms é obrigatório" });
  try {
    res.json(await getIngredients(terms, req.query.limit || 10));
  } catch (err) {
    console.error("Memed ingredients error:", err.message);
    res.status(422).json({ error: err.message });
  }
}

module.exports = {
  connectKommo,
  memedToken,
  memedPrescriptions,
  memedPrescriptionById,
  memedDeletePrescription,
  memedReceitaDigital,
  memedPrescriptionPdf,
  memedCreateProtocolo,
  memedCreateProtocoloParceiros,
  memedListProtocolos,
  memedListProtocolosParceiros,
  memedDeleteProtocolo,
  memedDeleteProtocoloParceiros,
  memedGetOpcoesReceituario,
  memedUpdateOpcoesReceituario,
  memedUploadTemplate,
  memedCidades,
  memedEspecialidades,
  memedIngredients,
};
