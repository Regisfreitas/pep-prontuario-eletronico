-- Tabela doctors com credenciais Google OAuth2
-- Execute no DBeaver se o banco já existia antes desta feature

CREATE TABLE IF NOT EXISTS doctors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    clinic_id INTEGER NOT NULL DEFAULT 1,
    google_access_token TEXT,
    google_refresh_token TEXT,
    google_calendar_id TEXT,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed inicial (ignore se já existir)
INSERT OR IGNORE INTO doctors (id, nome, clinic_id) VALUES (1, 'Dr. Marco Silva', 1);
INSERT OR IGNORE INTO doctors (id, nome, clinic_id) VALUES (2, 'teste Dr', 1);
INSERT OR IGNORE INTO doctors (id, nome, clinic_id) VALUES (3, 'Dra. Ana Costa', 1);
