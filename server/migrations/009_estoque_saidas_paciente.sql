ALTER TABLE estoque_saidas
  ADD COLUMN IF NOT EXISTS paciente_id UUID REFERENCES patients(id);

CREATE INDEX IF NOT EXISTS idx_estoque_saidas_paciente ON estoque_saidas(paciente_id);
