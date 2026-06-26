-- document_templates
CREATE TABLE IF NOT EXISTS document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  template_html TEXT NOT NULL,
  css TEXT,
  requires_patient_signature BOOLEAN DEFAULT false,
  requires_witness_signature BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- documents
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  atendimento_id INTEGER REFERENCES atendimentos(id) ON DELETE SET NULL,
  patient_id UUID NOT NULL REFERENCES patients(id),
  doctor_id INTEGER NOT NULL REFERENCES doctors(id),
  template_id UUID REFERENCES document_templates(id),
  document_type VARCHAR(50) NOT NULL,
  title VARCHAR(300) NOT NULL,
  content_json JSONB NOT NULL DEFAULT '{}',
  pdf_url TEXT,
  pdf_hash VARCHAR(64),
  status VARCHAR(30) DEFAULT 'draft',
  signed_at TIMESTAMPTZ,
  signed_by INTEGER REFERENCES doctors(id),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_documents_atendimento ON documents(atendimento_id);
CREATE INDEX IF NOT EXISTS idx_documents_patient ON documents(patient_id);
CREATE INDEX IF NOT EXISTS idx_documents_doctor ON documents(doctor_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);

-- digital_certificates
CREATE TABLE IF NOT EXISTS digital_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id INTEGER NOT NULL REFERENCES doctors(id),
  certificate_type VARCHAR(10) NOT NULL CHECK (certificate_type IN ('A1', 'A3')),
  owner_name VARCHAR(300) NOT NULL,
  cpf VARCHAR(14),
  crm VARCHAR(20),
  certificate_data_encrypted BYTEA,
  certificate_password_hint TEXT,
  provider VARCHAR(50),
  provider_certificate_id VARCHAR(200),
  valid_from DATE,
  valid_until DATE,
  issuer VARCHAR(300),
  serial_number VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_certificates_doctor ON digital_certificates(doctor_id);

-- signatures
CREATE TABLE IF NOT EXISTS signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  doctor_id INTEGER NOT NULL REFERENCES doctors(id),
  certificate_id UUID REFERENCES digital_certificates(id),
  signature_algorithm VARCHAR(50) NOT NULL,
  signed_hash TEXT NOT NULL,
  certificate_chain TEXT,
  timestamp_token TEXT,
  provider VARCHAR(50) NOT NULL DEFAULT 'webcrypto',
  provider_transaction_id VARCHAR(200),
  signature_metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_signatures_document ON signatures(document_id);
