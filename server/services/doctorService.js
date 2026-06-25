const { query } = require("../db");
const memedService = require("./memedService");

async function getDoctorById(id) {
  const { rows } = await query("SELECT * FROM doctors WHERE id = $1", [
    Number(id),
  ]);
  return rows[0] ?? null;
}

async function getAllDoctors() {
  const { rows } = await query("SELECT id, nome FROM doctors ORDER BY id");
  return rows;
}

async function getMedicosMap() {
  const rows = await getAllDoctors();
  return Object.fromEntries(rows.map((r) => [r.id, r.nome]));
}

async function saveGoogleTokens(doctorId, tokens) {
  const existing = await getDoctorById(doctorId);
  if (!existing) return null;

  const refreshToken = tokens.refresh_token || existing.google_refresh_token;
  const calendarId = existing.google_calendar_id || "primary";

  await query(
    `UPDATE doctors SET
      google_access_token = $1,
      google_refresh_token = $2,
      google_calendar_id = $3
     WHERE id = $4`,
    [tokens.access_token, refreshToken, calendarId, Number(doctorId)],
  );

  return getDoctorById(doctorId);
}

async function updateGoogleAccessToken(doctorId, accessToken, refreshToken) {
  await query(
    `UPDATE doctors SET
      google_access_token = $1,
      google_refresh_token = COALESCE($2, google_refresh_token)
     WHERE id = $3`,
    [accessToken, refreshToken || null, Number(doctorId)],
  );
}

async function clearGoogleTokens(doctorId) {
  await query(
    `UPDATE doctors SET
      google_access_token = NULL,
      google_refresh_token = NULL,
      google_calendar_id = NULL
     WHERE id = $1`,
    [Number(doctorId)],
  );
  return getDoctorById(doctorId);
}

async function getGoogleConnectionStatus(doctorId) {
  const doctor = await getDoctorById(doctorId);
  if (!doctor) return null;

  return {
    doctor_id: doctor.id,
    nome: doctor.nome,
    connected: Boolean(doctor.google_refresh_token),
    google_calendar_id: doctor.google_calendar_id,
  };
}

async function updateMemedToken(doctorId, memedToken, memedId) {
  await query(
    `UPDATE doctors SET memed_token = $1, memed_id = $2 WHERE id = $3`,
    [memedToken, memedId || null, Number(doctorId)],
  );
}

/**
 * Fluxo dinâmico: tenta GET na Memed → se 404, faz POST (cadastro).
 * Sempre valida o token antes de retornar, pois não é estático.
 */
async function getOrCreateMemedToken(doctorId) {
  const doctor = await getDoctorById(doctorId);
  if (!doctor) {
    throw new Error("Médico não encontrado");
  }

  // Mesmo que já tenha token, revalida via GET para garantir que é válido.
  // Se a Memed retornar 404 (usuário removido), refaz o cadastro.
  const registration = await memedService.getOrRegisterProfessional(doctor);

  if (!registration.memed_token) {
    throw new Error("Falha ao registrar profissional na Memed");
  }

  await updateMemedToken(
    doctorId,
    registration.memed_token,
    registration.memed_id,
  );

  return {
    memed_token: registration.memed_token,
    memed_id: registration.memed_id,
  };
}

async function seedDoctors() {
  const { rows } = await query("SELECT COUNT(*)::int AS n FROM doctors");
  if (rows[0].n > 0) return;

  await query(
    `INSERT INTO doctors (id, nome, first_name, last_name, clinic_id, cpf, birth_date, crm, crm_uf) VALUES
      (1, 'Dr. Marco Silva',   'Marco',   'Silva',  1, '12345678909', '1980-05-10', '123456', 'SP'),
      (2, 'teste Dr',          'Teste',   'Dr',     1, '98765432100', '1975-11-22', '654321', 'SP'),
      (3, 'Dra. Ana Costa',    'Ana',     'Costa',  1, '11122233344', '1985-03-15', '789012', 'RJ')
     ON CONFLICT (id) DO NOTHING`,
  );
  await query(
    `SELECT setval(pg_get_serial_sequence('doctors', 'id'), COALESCE((SELECT MAX(id) FROM doctors), 1))`,
  );
}

module.exports = {
  getDoctorById,
  getAllDoctors,
  getMedicosMap,
  saveGoogleTokens,
  clearGoogleTokens,
  updateGoogleAccessToken,
  getGoogleConnectionStatus,
  getOrCreateMemedToken,
  updateMemedToken,
  seedDoctors,
};
