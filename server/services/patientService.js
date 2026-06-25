const { query } = require('../db');
const { calculateAge, toDateString } = require('../utils/age');

const DEMO_PATIENTS = [
  {
    id: 'a1111111-1111-4111-8111-111111111111',
    full_name: 'Dara Amaral',
    birth_date: '1991-03-12',
    email: 'dara.amaral@example.com',
    phone: '(11) 98765-4321',
    document: '123.456.789-00',
  },
  {
    id: 'a2222222-2222-4222-8222-222222222222',
    full_name: 'Teste memed',
    birth_date: '1985-07-20',
    email: 'teste.memed@example.com',
  },
  {
    id: 'a3333333-3333-4333-8333-333333333333',
    full_name: 'João Pedro',
    birth_date: '2010-01-15',
    email: 'joao.pedro@example.com',
  },
  {
    id: 'a4444444-4444-4444-8444-444444444444',
    full_name: 'Maria Santos',
    birth_date: '1978-11-03',
    email: 'maria.santos@example.com',
  },
];

function mapPatientRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    full_name: row.full_name,
    birth_date: toDateString(row.birth_date),
    email: row.email,
    phone: row.phone,
    document: row.document,
    kommo_id: row.kommo_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    age: calculateAge(row.birth_date),
    integration_status: row.kommo_id ? 'Integrado ao Kommo' : 'Não integrado',
  };
}

async function listPatients() {
  const { rows } = await query(
    'SELECT id, full_name, birth_date FROM patients ORDER BY full_name ASC'
  );
  return rows.map((row) => ({
    id: row.id,
    full_name: row.full_name,
    birth_date: toDateString(row.birth_date),
    age: calculateAge(row.birth_date),
  }));
}

async function getPatientById(id) {
  const { rows } = await query('SELECT * FROM patients WHERE id = $1', [id]);
  return mapPatientRow(rows[0]);
}

async function createPatient({ full_name, birth_date, email, phone, document }) {
  const { rows } = await query(
    `INSERT INTO patients (full_name, birth_date, email, phone, document)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [full_name, birth_date, email || null, phone || null, document || null]
  );
  return mapPatientRow(rows[0]);
}

async function getPatientsMap() {
  const { rows } = await query('SELECT id, full_name FROM patients');
  return Object.fromEntries(rows.map((r) => [r.id, r.full_name]));
}

async function getFirstPatientId() {
  const { rows } = await query('SELECT id FROM patients ORDER BY full_name ASC LIMIT 1');
  return rows[0]?.id ?? null;
}

async function seedPatients() {
  const { rows } = await query('SELECT COUNT(*)::int AS n FROM patients');
  if (rows[0].n > 0) return;

  for (const patient of DEMO_PATIENTS) {
    await query(
      `INSERT INTO patients (id, full_name, birth_date, email, phone, document)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO NOTHING`,
      [
        patient.id,
        patient.full_name,
        patient.birth_date,
        patient.email,
        patient.phone ?? null,
        patient.document ?? null,
      ]
    );
  }
}

module.exports = {
  listPatients,
  getPatientById,
  createPatient,
  getPatientsMap,
  getFirstPatientId,
  seedPatients,
  DEMO_PATIENTS,
};
