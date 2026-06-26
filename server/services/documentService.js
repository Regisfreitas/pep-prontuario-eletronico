const { query } = require("../db");

async function getTemplates() {
  const { rows } = await query(
    "SELECT id, type, name, description, is_active FROM document_templates WHERE is_active = true ORDER BY name"
  );
  return rows;
}

async function getTemplateByType(type) {
  const { rows } = await query(
    "SELECT * FROM document_templates WHERE type = $1 AND is_active = true",
    [type]
  );
  return rows[0] || null;
}

async function createDocument({ atendimento_id, patient_id, doctor_id, document_type, title, content_json }) {
  const template = await getTemplateByType(document_type);
  if (!template) throw new Error(`Template "${document_type}" não encontrado`);

  const { rows } = await query(
    `INSERT INTO documents (atendimento_id, patient_id, doctor_id, template_id, document_type, title, content_json, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'draft')
     RETURNING *`,
    [atendimento_id || null, patient_id, doctor_id, template.id, document_type, title, JSON.stringify(content_json || {})]
  );
  return rows[0];
}

async function getDocumentById(id) {
  const { rows } = await query(
    `SELECT d.*, dt.name AS template_name, dt.template_html, dt.css
     FROM documents d
     LEFT JOIN document_templates dt ON dt.id = d.template_id
     WHERE d.id = $1 AND d.deleted_at IS NULL`,
    [id]
  );
  return rows[0] || null;
}

async function listDocumentsByPatient(patientId) {
  const { rows } = await query(
    `SELECT id, document_type, title, status, signed_at, pdf_url, created_at
     FROM documents
     WHERE patient_id = $1 AND deleted_at IS NULL
     ORDER BY created_at DESC`,
    [patientId]
  );
  return rows;
}

async function signDocument(documentId, doctorId, { certificate_id, signed_hash, signature_algorithm, certificate_chain, provider }) {
  const client = await require("../db").pool.connect();
  try {
    await client.query("BEGIN");

    // Insert signature record
    const { rows: sigRows } = await client.query(
      `INSERT INTO signatures (document_id, doctor_id, certificate_id, signature_algorithm, signed_hash, certificate_chain, provider)
       VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, 'webcrypto'))
       RETURNING *`,
      [documentId, doctorId, certificate_id || null, signature_algorithm, signed_hash, certificate_chain || null, provider || "webcrypto"]
    );

    const signature = sigRows[0];

    // Generate mock PDF URL
    const pdfUrl = `/uploads/documents/${documentId}.pdf`;

    // Update document
    await client.query(
      `UPDATE documents SET
         status = 'signed', signed_at = NOW(), signed_by = $1,
         pdf_url = $2, signature_id = $3, updated_at = NOW()
       WHERE id = $4`,
      [doctorId, pdfUrl, signature.id, documentId]
    );

    await client.query("COMMIT");
    return { pdf_url: pdfUrl, signature_id: signature.id };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function signDocumentMemed(documentId, doctorId) {
  // Mock — retorna erro controlado até ativação da Memed
  throw Object.assign(new Error("Integração com a Memed para prescrição de controlados estará disponível em breve."), {
    statusCode: 501,
    code: "MEMED_NOT_AVAILABLE",
  });
}

async function listCertificates(doctorId) {
  const { rows } = await query(
    `SELECT id, certificate_type, owner_name, cpf, crm, provider, provider_certificate_id,
            valid_from, valid_until, issuer, serial_number, is_active
     FROM digital_certificates
     WHERE doctor_id = $1 AND is_active = true AND deleted_at IS NULL
     ORDER BY created_at DESC`,
    [doctorId]
  );
  return rows;
}

async function createCertificate(doctorId, data) {
  const { rows } = await query(
    `INSERT INTO digital_certificates
       (doctor_id, certificate_type, owner_name, cpf, crm, provider, provider_certificate_id, valid_from, valid_until, issuer, serial_number)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [
      doctorId, data.certificate_type, data.owner_name, data.cpf || null, data.crm || null,
      data.provider || null, data.provider_certificate_id || null,
      data.valid_from || null, data.valid_until || null, data.issuer || null, data.serial_number || null,
    ]
  );
  return rows[0];
}

module.exports = {
  getTemplates,
  getTemplateByType,
  createDocument,
  getDocumentById,
  listDocumentsByPatient,
  signDocument,
  signDocumentMemed,
  listCertificates,
  createCertificate,
};
