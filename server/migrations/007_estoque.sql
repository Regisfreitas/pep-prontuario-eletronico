CREATE TABLE IF NOT EXISTS estoque_produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id INTEGER NOT NULL DEFAULT 1,
  nome VARCHAR(200) NOT NULL,
  descricao TEXT,
  codigo_barras VARCHAR(100),
  unidade VARCHAR(20) NOT NULL DEFAULT 'un',
  saldo_atual INT NOT NULL DEFAULT 0,
  saldo_minimo INT DEFAULT 0,
  saldo_ideal INT DEFAULT 0,
  situacao VARCHAR(20) DEFAULT 'normal',
  is_ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_estoque_produtos_clinic ON estoque_produtos(clinic_id);
CREATE INDEX IF NOT EXISTS idx_estoque_produtos_situacao ON estoque_produtos(situacao);

CREATE TABLE IF NOT EXISTS estoque_entradas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id INTEGER NOT NULL DEFAULT 1,
  produto_id UUID NOT NULL REFERENCES estoque_produtos(id) ON DELETE CASCADE,
  quantidade INT NOT NULL CHECK (quantidade > 0),
  data_entrada DATE NOT NULL DEFAULT CURRENT_DATE,
  observacao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_estoque_entradas_clinic ON estoque_entradas(clinic_id);
CREATE INDEX IF NOT EXISTS idx_estoque_entradas_produto ON estoque_entradas(produto_id);
CREATE INDEX IF NOT EXISTS idx_estoque_entradas_data ON estoque_entradas(data_entrada);

CREATE TABLE IF NOT EXISTS estoque_saidas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id INTEGER NOT NULL DEFAULT 1,
  produto_id UUID NOT NULL REFERENCES estoque_produtos(id) ON DELETE CASCADE,
  quantidade INT NOT NULL CHECK (quantidade > 0),
  data_saida DATE NOT NULL DEFAULT CURRENT_DATE,
  observacao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_estoque_saidas_clinic ON estoque_saidas(clinic_id);
CREATE INDEX IF NOT EXISTS idx_estoque_saidas_produto ON estoque_saidas(produto_id);
CREATE INDEX IF NOT EXISTS idx_estoque_saidas_data ON estoque_saidas(data_saida);

-- Trigger: atualizar saldo_atual e situacao ao inserir entrada
CREATE OR REPLACE FUNCTION atualizar_saldo_entrada()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE estoque_produtos SET
    saldo_atual = saldo_atual + NEW.quantidade,
    situacao = CASE
      WHEN saldo_atual + NEW.quantidade <= 0 THEN 'esgotado'
      WHEN saldo_atual + NEW.quantidade <= saldo_minimo THEN 'baixo'
      ELSE 'normal'
    END,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.produto_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION atualizar_saldo_saida()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE estoque_produtos SET
    saldo_atual = saldo_atual - NEW.quantidade,
    situacao = CASE
      WHEN saldo_atual - NEW.quantidade <= 0 THEN 'esgotado'
      WHEN saldo_atual - NEW.quantidade <= saldo_minimo THEN 'baixo'
      ELSE 'normal'
    END,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.produto_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_entrada_saldo') THEN
    CREATE TRIGGER trigger_entrada_saldo
      AFTER INSERT ON estoque_entradas
      FOR EACH ROW EXECUTE FUNCTION atualizar_saldo_entrada();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_saida_saldo') THEN
    CREATE TRIGGER trigger_saida_saldo
      AFTER INSERT ON estoque_saidas
      FOR EACH ROW EXECUTE FUNCTION atualizar_saldo_saida();
  END IF;
END;
$$;
