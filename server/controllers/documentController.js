const {
  getTemplates,
  createDocument,
  getDocumentById,
  listDocumentsByPatient,
  signDocument,
  signDocumentMemed,
  listCertificates,
  createCertificate,
} = require("../services/documentService");

// ---------- Templates ----------

async function listTemplates(_req, res) {
  try {
    const templates = await getTemplates();
    res.json({ templates });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ---------- Documents ----------

async function createDocumentHandler(req, res) {
  const { atendimento_id, patient_id, doctor_id, document_type, title, content_json } = req.body;
  if (!patient_id || !doctor_id || !document_type || !title) {
    return res.status(400).json({ error: "patient_id, doctor_id, document_type e title são obrigatórios" });
  }
  try {
    const doc = await createDocument({
      atendimento_id: atendimento_id || null,
      patient_id,
      doctor_id,
      document_type,
      title,
      content_json: content_json || {},
    });
    res.status(201).json(doc);
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
}

async function getDocumentHandler(req, res) {
  try {
    const doc = await getDocumentById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Documento não encontrado" });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function listPatientDocuments(req, res) {
  try {
    const docs = await listDocumentsByPatient(req.params.patientId);
    res.json({ documents: docs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function signDocumentHandler(req, res) {
  const { document_type } = req.body;

  // Prescrição especial → Memed (mock)
  if (document_type === "prescription_special") {
    try {
      await signDocumentMemed(req.params.id, req.body.doctor_id || 1);
    } catch (err) {
      if (err.code === "MEMED_NOT_AVAILABLE") {
        return res.status(501).json({ error: err.message, code: "MEMED_NOT_AVAILABLE" });
      }
      return res.status(422).json({ error: err.message });
    }
  }

  // Outros documentos → assinatura padrão
  const { doctor_id, certificate_id, signed_hash, signature_algorithm, certificate_chain, provider } = req.body;
  if (!signed_hash || !signature_algorithm) {
    return res.status(400).json({ error: "signed_hash e signature_algorithm são obrigatórios" });
  }

  try {
    const result = await signDocument(req.params.id, doctor_id || 1, {
      certificate_id: certificate_id || null,
      signed_hash,
      signature_algorithm,
      certificate_chain: certificate_chain || null,
      provider: provider || "webcrypto",
    });
    res.json(result);
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
}

// ---------- Certificates ----------

async function listCertificatesHandler(req, res) {
  const doctorId = req.query.doctor_id || 1;
  try {
    const certs = await listCertificates(doctorId);
    res.json({ certificates: certs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function createCertificateHandler(req, res) {
  const doctorId = req.body.doctor_id || 1;
  try {
    const cert = await createCertificate(doctorId, req.body);
    res.status(201).json(cert);
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
}

module.exports = {
  listTemplates,
  createDocumentHandler,
  getDocumentHandler,
  listPatientDocuments,
  signDocumentHandler,
  listCertificatesHandler,
  createCertificateHandler,
};
