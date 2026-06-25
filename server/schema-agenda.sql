-- PEP EMR — Tabela Agenda (Agenda Médica)
-- Execute no DBeaver conectado a server/pep.db

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS agenda (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    doctor_id INTEGER NOT NULL,
    clinic_id INTEGER NOT NULL,
    tipo_evento TEXT NOT NULL CHECK(tipo_evento IN ('CONSULTA', 'BLOQUEIO')),
    grupo_bloqueio_id TEXT,
    data_evento DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    paciente_id INTEGER,
    motivo_bloqueio TEXT,
    google_event_id TEXT,
    timezone TEXT DEFAULT 'America/Sao_Paulo',
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    CHECK (
        (tipo_evento = 'CONSULTA' AND paciente_id IS NOT NULL)
        OR
        (tipo_evento = 'BLOQUEIO' AND paciente_id IS NULL AND motivo_bloqueio IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_agenda_clinic_date ON agenda (clinic_id, data_evento);
CREATE INDEX IF NOT EXISTS idx_agenda_doctor_date ON agenda (doctor_id, data_evento);
