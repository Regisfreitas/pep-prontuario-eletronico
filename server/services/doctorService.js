const { query } = require('../db');

async function getDoctorById(id) {
  const { rows } = await query('SELECT * FROM doctors WHERE id = $1', [Number(id)]);
  return rows[0] ?? null;
}

async function getAllDoctors() {
  const { rows } = await query('SELECT id, nome FROM doctors ORDER BY id');
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
  const calendarId = existing.google_calendar_id || 'primary';

  await query(
    `UPDATE doctors SET
      google_access_token = $1,
      google_refresh_token = $2,
      google_calendar_id = $3
     WHERE id = $4`,
    [tokens.access_token, refreshToken, calendarId, Number(doctorId)]
  );

  return getDoctorById(doctorId);
}

async function updateGoogleAccessToken(doctorId, accessToken, refreshToken) {
  await query(
    `UPDATE doctors SET
      google_access_token = $1,
      google_refresh_token = COALESCE($2, google_refresh_token)
     WHERE id = $3`,
    [accessToken, refreshToken || null, Number(doctorId)]
  );
}

async function clearGoogleTokens(doctorId) {
  await query(
    `UPDATE doctors SET
      google_access_token = NULL,
      google_refresh_token = NULL,
      google_calendar_id = NULL
     WHERE id = $1`,
    [Number(doctorId)]
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

async function seedDoctors() {
  const { rows } = await query('SELECT COUNT(*)::int AS n FROM doctors');
  if (rows[0].n > 0) return;

  await query(
    `INSERT INTO doctors (id, nome, clinic_id) VALUES
      (1, 'Dr. Marco Silva', 1),
      (2, 'teste Dr', 1),
      (3, 'Dra. Ana Costa', 1)
     ON CONFLICT (id) DO NOTHING`
  );
  await query(`SELECT setval(pg_get_serial_sequence('doctors', 'id'), COALESCE((SELECT MAX(id) FROM doctors), 1))`);
}

module.exports = {
  getDoctorById,
  getAllDoctors,
  getMedicosMap,
  saveGoogleTokens,
  clearGoogleTokens,
  updateGoogleAccessToken,
  getGoogleConnectionStatus,
  seedDoctors,
};
