-- Tabelas de referência
CREATE TABLE IF NOT EXISTS states (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  abbreviation TEXT NOT NULL UNIQUE
);

INSERT INTO states (name, abbreviation) VALUES
  ('Acre', 'AC'), ('Alagoas', 'AL'), ('Amapá', 'AP'), ('Amazonas', 'AM'),
  ('Bahia', 'BA'), ('Ceará', 'CE'), ('Distrito Federal', 'DF'), ('Espírito Santo', 'ES'),
  ('Goiás', 'GO'), ('Maranhão', 'MA'), ('Mato Grosso', 'MT'), ('Mato Grosso do Sul', 'MS'),
  ('Minas Gerais', 'MG'), ('Pará', 'PA'), ('Paraíba', 'PB'), ('Paraná', 'PR'),
  ('Pernambuco', 'PE'), ('Piauí', 'PI'), ('Rio de Janeiro', 'RJ'), ('Rio Grande do Norte', 'RN'),
  ('Rio Grande do Sul', 'RS'), ('Rondônia', 'RO'), ('Roraima', 'RR'), ('Santa Catarina', 'SC'),
  ('São Paulo', 'SP'), ('Sergipe', 'SE'), ('Tocantins', 'TO')
ON CONFLICT (abbreviation) DO NOTHING;

CREATE TABLE IF NOT EXISTS specialties (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

INSERT INTO specialties (name) VALUES
  ('Acupuntura'), ('Alergia e Imunologia'), ('Anestesiologia'), ('Angiologia'),
  ('Cardiologia'), ('Cirurgia Cardiovascular'), ('Cirurgia Geral'), ('Cirurgia Plástica'),
  ('Clínica Médica'), ('Coloproctologia'), ('Dermatologia'), ('Endocrinologia'),
  ('Gastroenterologia'), ('Geriatria'), ('Ginecologia e Obstetrícia'), ('Hematologia'),
  ('Infectologia'), ('Mastologia'), ('Medicina de Família'), ('Nefrologia'),
  ('Neurocirurgia'), ('Neurologia'), ('Nutrologia'), ('Oftalmologia'),
  ('Oncologia'), ('Ortopedia'), ('Otorrinolaringologia'), ('Pediatria'),
  ('Pneumologia'), ('Psiquiatria'), ('Radiologia'), ('Reumatologia'),
  ('Urologia')
ON CONFLICT (name) DO NOTHING;

-- Novas colunas na tabela doctors
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS board_type TEXT DEFAULT 'CRM';
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS state_id INTEGER REFERENCES states(id);
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS specialty_id INTEGER REFERENCES specialties(id);
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS req_number TEXT;
