const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const BLANK_DRAFT = JSON.stringify({ texto: '' });

const DRAFT_FIELDS = [
  'anamnese_draft',
  'orientacao_draft',
  'laudo_draft',
  'atestado_declaracao_draft',
  'pedido_exames_draft',
  'prescription_draft',
  'consentimento_lgpd_draft',
];

const URL_FIELDS = [
  'anamnese_url',
  'orientacao_url',
  'laudo_url',
  'atestado_declaracao_url',
  'pedido_exames_url',
  'prescription_url',
  'consentimento_lgpd_url',
];

const FIELD_MAP = {
  anamnese: 'anamnese_draft',
  orientacao: 'orientacao_draft',
  laudo: 'laudo_draft',
  atestado_declaracao: 'atestado_declaracao_draft',
  pedido_exames: 'pedido_exames_draft',
  prescription: 'prescription_draft',
  consentimento_lgpd: 'consentimento_lgpd_draft',
};

const URL_MAP = {
  anamnese: 'anamnese_url',
  orientacao: 'orientacao_url',
  laudo: 'laudo_url',
  atestado_declaracao: 'atestado_declaracao_url',
  pedido_exames: 'pedido_exames_url',
  prescription: 'prescription_url',
  consentimento_lgpd: 'consentimento_lgpd_url',
};

async function query(text, params) {
  return pool.query(text, params);
}

async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function runMigrations() {
  await query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const migrationsDir = path.join(__dirname, 'migrations');
  if (!fs.existsSync(migrationsDir)) return;

  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const { rowCount } = await query(
      'SELECT 1 FROM schema_migrations WHERE filename = $1',
      [file]
    );
    if (rowCount > 0) continue;

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log(`Migration applied: ${file}`);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

async function initDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL não configurada. Copie .env.example → .env e defina a conexão PostgreSQL.'
    );
  }
  await runMigrations();
}

function pgErrorMessage(err) {
  if (err.code === '23514') {
    return 'Dados inválidos: consulta exige paciente; bloqueio exige motivo e não pode ter paciente.';
  }
  if (err.code === '23505') {
    return 'Registro duplicado (e-mail ou documento já cadastrado).';
  }
  return err.message || 'Erro interno do servidor';
}

module.exports = {
  pool,
  query,
  withTransaction,
  initDb,
  runMigrations,
  pgErrorMessage,
  BLANK_DRAFT,
  DRAFT_FIELDS,
  URL_FIELDS,
  FIELD_MAP,
  URL_MAP,
};
