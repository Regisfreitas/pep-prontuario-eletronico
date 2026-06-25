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

function buildAuthHeader() {
  const credentials = Buffer.from(
    `${env("MEMED_API_KEY")}:${env("MEMED_SECRET_KEY")}`,
  ).toString("base64");
  return `Basic ${credentials}`;
}

/**
 * Split a full name into firstName and lastName.
 * Last word = lastName, everything before = firstName.
 */
function splitName(fullName) {
  const parts = (fullName || "").trim().split(/\s+/);
  if (parts.length === 1) return { first_name: parts[0], last_name: "" };
  const last = parts.pop();
  return { first_name: parts.join(" "), last_name: last };
}

// ---------------------------------------------------------------------------
// Core HTTP helper — all Memed API calls go through here
// ---------------------------------------------------------------------------

/**
 * @param {'GET'|'POST'|'PATCH'|'PUT'} method
 * @param {string} path  — e.g. "/sinapse-prescricao/usuarios/{id}"
 * @param {Object} [body]
 */
function memedRequest(method, path, body = null) {
  if (!isConfigured()) {
    return Promise.reject(
      new Error("Memed não configurada (MEMED_API_KEY / MEMED_SECRET_KEY)"),
    );
  }

  const apiUrl = getApiUrl();
  const url = new URL(apiUrl + path);
  const bodyStr = body ? JSON.stringify(body) : null;

  return new Promise((resolve, reject) => {
    const headers = {
      Authorization: buildAuthHeader(),
      Accept: "application/json",
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

          // Log the detail field for debugging
          if (json.detail) {
            console.warn(`Memed API detail [${path}]:`, json.detail);
          }

          if (res.statusCode >= 400) {
            const err = new Error(
              json.detail ||
                json.message ||
                json.error ||
                `HTTP ${res.statusCode}`,
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
// 1. Gestão de Médico (Profissional Prescritor)
// ---------------------------------------------------------------------------

/**
 * Tenta buscar o médico na Memed via GET.
 * Se retornar 404, faz o cadastro via POST.
 * Retorna { memed_id, memed_token }.
 */
async function getOrRegisterProfessional(doctor) {
  const externalId = doctor.memed_id || String(doctor.id);

  // 1) Tentar GET (usuário já existe na Memed)
  try {
    const { body } = await memedRequest(
      "GET",
      `/sinapse-prescricao/usuarios/${externalId}`,
    );
    if (body?.data?.token) {
      return { memed_id: externalId, memed_token: body.data.token };
    }
  } catch (err) {
    // 404 significa que precisa cadastrar — qualquer outro erro é inesperado
    if (err.statusCode !== 404) throw err;
  }

  // 2) Cadastrar (POST)
  const nameParts = splitName(
    doctor.first_name && doctor.last_name
      ? `${doctor.first_name} ${doctor.last_name}`
      : doctor.nome,
  );

  const payload = {
    external_id: externalId,
    nome: nameParts.first_name,
    sobrenome: nameParts.last_name || ".",
    cpf: (doctor.cpf || "").replace(/\D/g, ""),
    data_nascimento: doctor.birth_date || null,
    board: {
      crm: doctor.crm || "",
      numero: doctor.crm || "",
      uf: (doctor.crm_uf || "").toUpperCase(),
      state: (doctor.crm_uf || "").toUpperCase(),
    },
  };

  const { body } = await memedRequest(
    "POST",
    "/sinapse-prescricao/usuarios",
    payload,
  );

  return {
    memed_id: externalId,
    memed_token: body?.data?.token || body?.token,
  };
}

// ---------------------------------------------------------------------------
// 2. Prescrições & Documentos
// ---------------------------------------------------------------------------

/**
 * GET /consultations/:id/prescriptions?structuredDocuments=true
 * Busca as últimas prescrições do médico.
 */
async function getPrescriptions(memedId) {
  const { body } = await memedRequest(
    "GET",
    `/consultations/${memedId}/prescriptions?structuredDocuments=true`,
  );
  return body;
}

/**
 * Recupera o link da Receita Digital.
 */
async function getReceitaDigital(memedId, prescriptionId) {
  const { body } = await memedRequest(
    "GET",
    `/consultations/${memedId}/prescriptions/${prescriptionId}/receita`,
  );
  return body;
}

/**
 * Recupera a URL do PDF completo da prescrição.
 */
async function getPrescriptionPdf(memedId, prescriptionId) {
  const { body } = await memedRequest(
    "GET",
    `/consultations/${memedId}/prescriptions/${prescriptionId}/pdf`,
  );
  return body;
}

// ---------------------------------------------------------------------------
// 3. Protocolos
// ---------------------------------------------------------------------------

/**
 * Cria um protocolo para um médico específico.
 */
async function createProtocolo(memedId, data) {
  const { body } = await memedRequest(
    "POST",
    `/sinapse-prescricao/protocolos`,
    { ...data, usuario_id: memedId },
  );
  return body;
}

/**
 * Cria protocolos para todos os prescritores parceiros (clínica).
 */
async function createProtocoloParceiros(data) {
  const { body } = await memedRequest(
    "POST",
    "/sinapse-prescricao/protocolos/parceiros",
    data,
  );
  return body;
}

// ---------------------------------------------------------------------------
// 4. Opções de Receituário (Impressão)
// ---------------------------------------------------------------------------

/**
 * Atualiza as opções do receituário para um médico.
 */
async function updateOpcoesReceituario(memedId, options) {
  const { body } = await memedRequest(
    "PATCH",
    `/sinapse-prescricao/usuarios/${memedId}/opcoes-receituario`,
    options,
  );
  return body;
}

/**
 * Upload de template PDF (papel timbrado) para recorte automático.
 * O body deve ser um FormData — para simplicidade usamos JSON com o
 * conteúdo do arquivo em base64 quando suportado pela API.
 */
async function uploadTemplate(memedId, templateBase64) {
  const { body } = await memedRequest(
    "POST",
    `/sinapse-prescricao/usuarios/${memedId}/opcoes-receituario/upload-template`,
    { template: templateBase64 },
  );
  return body;
}

// ---------------------------------------------------------------------------
// 5. Dados Auxiliares (Cache)
// ---------------------------------------------------------------------------

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas

/**
 * Retorna a lista de cidades, com cache no banco local.
 */
async function getCidades() {
  const { rows } = await query(
    `SELECT nome, uf FROM memed_cidades
     WHERE fetched_at > NOW() - INTERVAL '24 hours'
     ORDER BY nome`,
  );

  if (rows.length > 0) {
    return rows.map((r) => ({ nome: r.nome, uf: r.uf }));
  }

  // Cache expirado ou vazio — buscar da Memed
  const { body } = await memedRequest("GET", "/sinapse-prescricao/cidades");

  const cidades = body?.data || body || [];

  if (Array.isArray(cidades) && cidades.length > 0) {
    await query("DELETE FROM memed_cidades");
    for (const c of cidades) {
      await query("INSERT INTO memed_cidades (nome, uf) VALUES ($1, $2)", [
        c.nome || c.name,
        c.uf || c.state,
      ]);
    }
    return cidades.map((c) => ({
      nome: c.nome || c.name,
      uf: c.uf || c.state,
    }));
  }

  return [];
}

/**
 * Retorna a lista de especialidades, com cache no banco local.
 */
async function getEspecialidades() {
  const { rows } = await query(
    `SELECT nome FROM memed_especialidades
     WHERE fetched_at > NOW() - INTERVAL '24 hours'
     ORDER BY nome`,
  );

  if (rows.length > 0) {
    return rows.map((r) => ({ nome: r.nome }));
  }

  const { body } = await memedRequest(
    "GET",
    "/sinapse-prescricao/especialidades",
  );

  const especialidades = body?.data || body || [];

  if (Array.isArray(especialidades) && especialidades.length > 0) {
    await query("DELETE FROM memed_especialidades");
    for (const e of especialidades) {
      await query("INSERT INTO memed_especialidades (nome) VALUES ($1)", [
        e.nome || e.name,
      ]);
    }
    return especialidades.map((e) => ({ nome: e.nome || e.name }));
  }

  return [];
}

// ---------------------------------------------------------------------------
module.exports = {
  isConfigured,
  getOrRegisterProfessional,
  getPrescriptions,
  getReceitaDigital,
  getPrescriptionPdf,
  createProtocolo,
  createProtocoloParceiros,
  updateOpcoesReceituario,
  uploadTemplate,
  getCidades,
  getEspecialidades,
  // export helper for testing
  splitName,
  memedRequest,
};
