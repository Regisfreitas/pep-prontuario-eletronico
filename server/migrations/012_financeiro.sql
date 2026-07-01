CREATE TABLE IF NOT EXISTS despesas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id INTEGER NOT NULL DEFAULT 1,
  estoque_entrada_id UUID REFERENCES estoque_entradas(id) ON DELETE SET NULL,
  descricao VARCHAR(300) NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  categoria VARCHAR(100) DEFAULT 'estoque',
  fornecedor VARCHAR(200),
  is_manual BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_despesas_clinic ON despesas(clinic_id);
CREATE INDEX IF NOT EXISTS idx_despesas_data ON despesas(data);

CREATE TABLE IF NOT EXISTS receitas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id INTEGER NOT NULL DEFAULT 1,
  estoque_saida_id UUID REFERENCES estoque_saidas(id) ON DELETE SET NULL,
  paciente_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  descricao VARCHAR(300) NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  categoria VARCHAR(100) DEFAULT 'estoque',
  is_manual BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_receitas_clinic ON receitas(clinic_id);
CREATE INDEX IF NOT EXISTS idx_receitas_data ON receitas(data);
