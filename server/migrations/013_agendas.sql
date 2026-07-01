CREATE TABLE IF NOT EXISTS agendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id INTEGER NOT NULL DEFAULT 1,
  nome VARCHAR(150) NOT NULL,
  descricao TEXT,
  cor VARCHAR(7) DEFAULT '#3B82F6',
  tipo VARCHAR(50),
  is_ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_agendas_clinic ON agendas(clinic_id);

-- Add agenda_id to the agenda table (appointments)
ALTER TABLE agenda
  ADD COLUMN IF NOT EXISTS agenda_id UUID REFERENCES agendas(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_agenda_agenda_id ON agenda(agenda_id);

-- Create a default "Geral" agenda and assign all existing appointments to it
DO $$
DECLARE
  geral_id UUID;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM agendas WHERE nome = 'Geral' AND deleted_at IS NULL) THEN
    INSERT INTO agendas (clinic_id, nome, descricao, cor, tipo)
    VALUES (1, 'Geral', 'Agenda geral para todos os compromissos', '#3B82F6', 'consulta')
    RETURNING id INTO geral_id;

    -- Assign all existing appointments to the default agenda
    UPDATE agenda SET agenda_id = geral_id WHERE agenda_id IS NULL;
  END IF;
END;
$$;
