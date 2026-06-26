-- prompt_ai: templates de prompt para AI Scribe
CREATE TABLE IF NOT EXISTS prompt_ai (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  specialty_id INTEGER REFERENCES specialties(id) ON DELETE SET NULL,
  name VARCHAR(200) NOT NULL,
  version INT NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  system_prompt TEXT NOT NULL,
  context_block TEXT NOT NULL,
  extraction_rules TEXT NOT NULL,
  output_format TEXT NOT NULL,
  validation_rules TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_prompt_ai_specialty_active
  ON prompt_ai(specialty_id) WHERE is_active = true;

-- cid_reference: tabela de referência CID-10 para validação
CREATE TABLE IF NOT EXISTS cid_reference (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(10) NOT NULL UNIQUE,
  descricao TEXT NOT NULL,
  categoria VARCHAR(100),
  sexo_restrito VARCHAR(10) CHECK (sexo_restrito IN ('masculino', 'feminino', null)),
  is_ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cid_codigo ON cid_reference(codigo);
CREATE INDEX IF NOT EXISTS idx_cid_sexo ON cid_reference(sexo_restrito) WHERE sexo_restrito IS NOT NULL;

-- atendimentos: adicionar colunas do AI Scribe
ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS raw_transcription JSONB;
ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS audio_path VARCHAR(500);
ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS audio_duration_seconds INT;
ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS structured_anamnesis JSONB;
ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS ai_metadata JSONB;
ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS scribe_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS requires_review BOOLEAN DEFAULT false;
ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS review_fields TEXT[];

CREATE INDEX IF NOT EXISTS idx_atendimentos_scribe_status
  ON atendimentos(scribe_status);
CREATE INDEX IF NOT EXISTS idx_atendimentos_requires_review
  ON atendimentos(requires_review) WHERE requires_review = true;
CREATE INDEX IF NOT EXISTS idx_atendimentos_structured_anamnesis
  ON atendimentos USING GIN(structured_anamnesis);

-- ai_scribe_logs: log de auditoria de processamento
CREATE TABLE IF NOT EXISTS ai_scribe_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  atendimento_id INTEGER NOT NULL REFERENCES atendimentos(id) ON DELETE CASCADE,
  prompt_ai_id UUID REFERENCES prompt_ai(id),
  prompt_version INT NOT NULL,
  transcription_provider VARCHAR(50) NOT NULL DEFAULT 'deepgram',
  transcription_model VARCHAR(100) NOT NULL,
  transcription_duration_ms INT,
  raw_transcription TEXT,
  llm_provider VARCHAR(50) NOT NULL,
  llm_model VARCHAR(100) NOT NULL,
  llm_request_tokens INT,
  llm_response_tokens INT,
  llm_latency_ms INT,
  structured_output JSONB,
  validation_errors JSONB,
  validation_warnings JSONB,
  status VARCHAR(20) NOT NULL DEFAULT 'processing',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_scribe_logs_atendimento ON ai_scribe_logs(atendimento_id);
CREATE INDEX IF NOT EXISTS idx_scribe_logs_created ON ai_scribe_logs(created_at DESC);
