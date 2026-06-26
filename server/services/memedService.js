const https = require("https");
const { query } = require("../db");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function env(name) {
  return (process.env[name] || "").trim();
}

function getApiUrl() {
  if (process.env.MEMED_API_URL) return process.env.MEMED_API_URL.trim();
  return process.env.NODE_ENV === "production"
    ? "https://api.memed.com.br/v1"
    : "https://integrations.api.memed.com.br/v1";
}

function isConfigured() {
  return Boolean(env("MEMED_API_KEY") && env("MEMED_SECRET_KEY"));
}

/** Add API key + secret as query params */
function withApiKey(path, token) {
  const sep = path.includes("?") ? "&" : "?";
  if (token) {
    return `${path}${sep}token=${encodeURIComponent(token)}`;
  }
  return `${path}${sep}api-key=${encodeURIComponent(env("MEMED_API_KEY"))}&secret-key=${encodeURIComponent(env("MEMED_SECRET_KEY"))}`;
}

function splitName(fullName) {
  const parts = (fullName || "").trim().split(/\s+/);
  if (parts.length === 1) return { first_name: parts[0], last_name: "" };
  const last = parts.pop();
  return { first_name: parts.join(" "), last_name: last };
}

function formatDateToBr(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

// ---------------------------------------------------------------------------
// Core HTTP helper
// ---------------------------------------------------------------------------

function memedRequest(method, path, body = null, token = null) {
  if (!isConfigured()) {
    return Promise.reject(
      new Error("Memed não configurada (MEMED_API_KEY / MEMED_SECRET_KEY)"),
    );
  }

  const fullPath = withApiKey(path, token);
  const url = new URL(getApiUrl() + fullPath);
  const bodyStr = body ? JSON.stringify(body) : null;

  return new Promise((resolve, reject) => {
    const headers = {
      Accept: "application/vnd.api+json",
      "User-Agent": "pep-emr/1.0",
    };
    if (bodyStr) {
      headers["Content-Type"] = "application/json";
      headers["Content-Length"] = Buffer.byteLength(bodyStr);
    }

    const req = https.request(
      url,
      { method, headers, timeout: 20000 },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const raw = Buffer.concat(chunks).toString("utf8");
          let json;
          try {
            json = raw ? JSON.parse(raw) : {};
          } catch {
            reject(
              new Error(
                `Memed: resposta inválida (${res.statusCode}): ${raw.slice(0, 200)}`,
              ),
            );
            return;
          }

          if (json.errors) {
            const detail = Array.isArray(json.errors)
              ? json.errors[0]?.detail || JSON.stringify(json.errors)
              : json.errors;
            if (detail) console.warn(`Memed API detail [${path}]:`, detail);
          }
          if (json.detail)
            console.warn(`Memed API detail [${path}]:`, json.detail);

          if (res.statusCode >= 400) {
            const detail = Array.isArray(json.errors)
              ? json.errors[0]?.detail || json.errors[0]?.title
              : json.detail || json.message || json.error;

            console.error(
              `Memed API ${res.statusCode} [${path}]:`,
              detail || JSON.stringify(json).slice(0, 300),
            );

            const err = new Error(
              detail ||
                `Memed API retornou erro ${res.statusCode}. Verifique as credenciais no .env.`,
            );
            err.statusCode = res.statusCode;
            err.body = json;
            reject(err);
            return;
          }

          resolve({ statusCode: res.statusCode, body: json });
        });
      },
    );

    req.on("timeout", () => req.destroy(new Error("Timeout — Memed API")));
    req.on("error", (err) =>
      reject(new Error(`Memed: falha de rede — ${err.message}`)),
    );
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

// ---------------------------------------------------------------------------
// 1. Check key pair
// ---------------------------------------------------------------------------

async function checkKeyPair() {
  const { body } = await memedRequest("GET", "/sinapse-prescricao/check-key");
  return body;
}

// ---------------------------------------------------------------------------
// 2. Gestão de Médico (Profissional Prescritor)
// ---------------------------------------------------------------------------

async function getOrRegisterProfessional(doctor) {
  const externalId = doctor.memed_id || String(doctor.id);

  // 1) Tentar GET (usuário já existe)
  try {
    const { body } = await memedRequest(
      "GET",
      `/sinapse-prescricao/usuarios/${externalId}`,
    );
    const token = body?.data?.attributes?.token || body?.data?.token;
    if (token) return { memed_id: externalId, memed_token: token };
  } catch (err) {
    if (err.statusCode !== 404) throw err;
  }

  // 2) Cadastrar (POST) — JSON:API format
  const nameParts = splitName(
    doctor.first_name && doctor.last_name
      ? `${doctor.first_name} ${doctor.last_name}`
      : doctor.nome,
  );

  const birthDate = formatDateToBr(doctor.birth_date);

  const payload = {
    data: {
      type: "usuarios",
      attributes: {
        external_id: externalId,
        nome: nameParts.first_name,
        sobrenome: nameParts.last_name || ".",
        cpf: (doctor.cpf || "").replace(/\D/g, ""),
        data_nascimento: birthDate,
        email: doctor.email || null,
        telefone: doctor.phone || null,
        sexo:
          doctor.gender === "Masculino"
            ? "M"
            : doctor.gender === "Feminino"
              ? "F"
              : null,
        board: {
          board_code: doctor.board_type || "CRM",
          board_number: doctor.crm || "",
          board_state: (doctor.crm_uf || "").toUpperCase(),
        },
      },
    },
  };

  const { body } = await memedRequest(
    "POST",
    "/sinapse-prescricao/usuarios",
    payload,
  );
  const token = body?.data?.attributes?.token || body?.data?.token;

  return { memed_id: externalId, memed_token: token };
}

/**
 * Atualiza profissional existente via PATCH.
 * NÃO incluir external_id a menos que deseje alterá-lo.
 */
async function updateProfessional(externalId, attributes) {
  const payload = {
    data: {
      type: "usuarios",
      attributes: attributes,
    },
  };
  const { body } = await memedRequest(
    "PATCH",
    `/sinapse-prescricao/usuarios/${externalId}`,
    payload,
  );
  return body;
}

/**
 * Exclui profissional (irreversível).
 */
async function deleteProfessional(externalId) {
  const { body } = await memedRequest(
    "DELETE",
    `/sinapse-prescricao/usuarios/${externalId}`,
  );
  return body;
}

// ---------------------------------------------------------------------------
// 3. Prescrições
// ---------------------------------------------------------------------------

async function getPrescriptions(token) {
  const { body } = await memedRequest("GET", "/prescricoes", null, token);
  return body;
}

async function getPrescriptionById(prescriptionId, token) {
  const { body } = await memedRequest(
    "GET",
    `/prescricoes/${prescriptionId}?structuredDocuments=true`,
    null,
    token,
  );
  return body;
}

async function deletePrescription(prescriptionId, token) {
  const { body } = await memedRequest(
    "DELETE",
    `/prescricoes/${prescriptionId}`,
    null,
    token,
  );
  return body;
}

async function getReceitaDigital(prescriptionId, token) {
  const { body } = await memedRequest(
    "GET",
    `/prescricoes/${prescriptionId}/get-digital-prescription-link`,
    null,
    token,
  );
  return body;
}

async function getPrescriptionPdf(prescriptionId, token) {
  const { body } = await memedRequest(
    "GET",
    `/prescricoes/${prescriptionId}/url-document/full`,
    null,
    token,
  );
  return body;
}

// ---------------------------------------------------------------------------
// 4. Protocolos
// ---------------------------------------------------------------------------

async function createProtocolo(token, data) {
  const { body } = await memedRequest("POST", "/protocolos", data, token);
  return body;
}

async function createProtocoloParceiros(data) {
  const { body } = await memedRequest("POST", "/protocolos/parceiros", data);
  return body;
}

async function listProtocolos(token) {
  const { body } = await memedRequest("GET", "/protocolos", null, token);
  return body;
}

async function listProtocolosParceiros() {
  const { body } = await memedRequest("GET", "/protocolos/parceiros");
  return body;
}

async function deleteProtocolo(id, token) {
  const { body } = await memedRequest(
    "DELETE",
    `/protocolos/${id}`,
    null,
    token,
  );
  return body;
}

async function deleteProtocoloParceiros(id) {
  const { body } = await memedRequest("DELETE", `/protocolos/parceiros/${id}`);
  return body;
}

// ---------------------------------------------------------------------------
// 5. Opções de Receituário (Impressão)
// ---------------------------------------------------------------------------

async function getOpcoesReceituario(token) {
  const { body } = await memedRequest(
    "GET",
    "/opcoes-receituario",
    null,
    token,
  );
  return body;
}

async function updateOpcoesReceituario(token, options) {
  const { body } = await memedRequest(
    "POST",
    "/opcoes-receituario",
    options,
    token,
  );
  return body;
}

async function uploadTemplate(token, formData) {
  // multipart/form-data not handled here — caller should prepare formData
  const { body } = await memedRequest(
    "POST",
    "/opcoes-receituario/upload-template",
    formData,
    token,
  );
  return body;
}

// ---------------------------------------------------------------------------
// 6. Dados Auxiliares (sem autenticação de token)
// ---------------------------------------------------------------------------

async function getCidades() {
  const { rows } = await query(
    `SELECT nome, uf FROM memed_cidades WHERE fetched_at > NOW() - INTERVAL '24 hours' ORDER BY nome`,
  );
  if (rows.length > 0) return rows.map((r) => ({ nome: r.nome, uf: r.uf }));

  const { body } = await memedRequest("GET", "/cidades");
  const cidades = body?.data || [];
  if (Array.isArray(cidades) && cidades.length > 0) {
    await query("DELETE FROM memed_cidades");
    for (const c of cidades) {
      const attrs = c.attributes || c;
      await query("INSERT INTO memed_cidades (nome, uf) VALUES ($1, $2)", [
        attrs.nome || attrs.name,
        attrs.uf || attrs.state,
      ]);
    }
    return cidades.map((c) => {
      const a = c.attributes || c;
      return { nome: a.nome || a.name, uf: a.uf || a.state };
    });
  }
  return [];
}

async function getEspecialidades() {
  const { rows } = await query(
    `SELECT nome FROM memed_especialidades WHERE fetched_at > NOW() - INTERVAL '24 hours' ORDER BY nome`,
  );
  if (rows.length > 0) return rows.map((r) => ({ nome: r.nome }));

  const { body } = await memedRequest("GET", "/especialidades");
  const especialidades = body?.data || [];
  if (Array.isArray(especialidades) && especialidades.length > 0) {
    await query("DELETE FROM memed_especialidades");
    for (const e of especialidades) {
      const attrs = e.attributes || e;
      await query("INSERT INTO memed_especialidades (nome) VALUES ($1)", [
        attrs.nome || attrs.name,
      ]);
    }
    return especialidades.map((e) => {
      const a = e.attributes || e;
      return { nome: a.nome || a.name };
    });
  }
  return [];
}

async function getIngredients(terms, limit = 10) {
  const { body } = await memedRequest(
    "GET",
    `/drugs/ingredients?terms=${encodeURIComponent(terms)}&limit=${limit}&order[field]=name&order[sort]=ASC`,
  );
  return body;
}

// ---------------------------------------------------------------------------
module.exports = {
  isConfigured,
  checkKeyPair,
  getOrRegisterProfessional,
  updateProfessional,
  deleteProfessional,
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
  splitName,
  memedRequest,
};
