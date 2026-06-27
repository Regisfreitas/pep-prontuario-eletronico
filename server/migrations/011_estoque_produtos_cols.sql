ALTER TABLE estoque_produtos
  ADD COLUMN IF NOT EXISTS codigo VARCHAR(50),
  ADD COLUMN IF NOT EXISTS embalagem VARCHAR(100),
  ADD COLUMN IF NOT EXISTS lote VARCHAR(100),
  ADD COLUMN IF NOT EXISTS vencimento DATE,
  ADD COLUMN IF NOT EXISTS categoria VARCHAR(100),
  ADD COLUMN IF NOT EXISTS fornecedor VARCHAR(200);

CREATE INDEX IF NOT EXISTS idx_estoque_produtos_categoria ON estoque_produtos(categoria);
CREATE INDEX IF NOT EXISTS idx_estoque_produtos_fornecedor ON estoque_produtos(fornecedor);
