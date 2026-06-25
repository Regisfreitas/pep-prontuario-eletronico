CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS doctors (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  clinic_id INTEGER NOT NULL DEFAULT 1,
  google_access_token TEXT,
  google_refresh_token TEXT,
  google_calendar_id TEXT,
  data_criacao TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  document TEXT,
  kommo_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS crm_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_name TEXT NOT NULL DEFAULT 'kommo',
  api_key TEXT NOT NULL,
  subdomain TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS atendimentos (
  id SERIAL PRIMARY KEY,
  medico_id INTEGER NOT NULL REFERENCES doctors(id),
  paciente_id UUID NOT NULL REFERENCES patients(id),
  anamnese_draft TEXT,
  orientacao_draft TEXT,
  laudo_draft TEXT,
  atestado_declaracao_draft TEXT,
  pedido_exames_draft TEXT,
  prescription_draft TEXT,
  consentimento_lgpd_draft TEXT,
  data_hora_criacao TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_atendimentos_paciente ON atendimentos (paciente_id);

CREATE TABLE IF NOT EXISTS attendance_file (
  id SERIAL PRIMARY KEY,
  atendimento_id INTEGER NOT NULL REFERENCES atendimentos(id) ON DELETE CASCADE,
  medico_id INTEGER NOT NULL REFERENCES doctors(id),
  anamnese_url TEXT,
  orientacao_url TEXT,
  laudo_url TEXT,
  atestado_declaracao_url TEXT,
  pedido_exames_url TEXT,
  prescription_url TEXT,
  consentimento_lgpd_url TEXT,
  data_hora_geracao TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agenda (
  id SERIAL PRIMARY KEY,
  doctor_id INTEGER NOT NULL REFERENCES doctors(id),
  clinic_id INTEGER NOT NULL,
  tipo_evento TEXT NOT NULL CHECK (tipo_evento IN ('CONSULTA', 'BLOQUEIO')),
  grupo_bloqueio_id TEXT,
  data_evento DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  paciente_id UUID REFERENCES patients(id),
  motivo_bloqueio TEXT,
  google_event_id TEXT,
  timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
  data_criacao TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (
    (tipo_evento = 'CONSULTA' AND paciente_id IS NOT NULL)
    OR
    (tipo_evento = 'BLOQUEIO' AND paciente_id IS NULL AND motivo_bloqueio IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_agenda_clinic_date ON agenda (clinic_id, data_evento);
CREATE INDEX IF NOT EXISTS idx_agenda_doctor_date ON agenda (doctor_id, data_evento);
