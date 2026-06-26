# Backend — PEP SoMed

## Stack

| Tecnologia | Versão | Finalidade |
|---|---|---|
| **Node.js** | v18+ | Runtime |
| **Express** | ^4.21.2 | Framework HTTP |
| **pg** | ^8.13.1 | Cliente PostgreSQL |
| **googleapis** | ^144.0.0 | SDK Google APIs |
| **cors** | ^2.8.5 | Middleware CORS |
| **dotenv** | ^16.4.7 | Variáveis de ambiente |
| **concurrently** | ^9.1.2 | Dev: executa server + client |

---

## Estrutura de Pastas

```
server/
├── controllers/
│   ├── agendaController.js        # CRUD agenda + seed
│   ├── googleController.js        # OAuth Google
│   ├── integrationsController.js  # CRM Kommo + Memed (token, prescrições, protocolos, cache)
│   ├── patientsController.js      # CRUD pacientes + busca + sugestão
│   └── profileController.js       # Perfil médico (states, specialties, profile)
├── migrations/
│   ├── 001_initial_schema.sql     # DDL base (doctors, patients, agenda, etc.)
│   ├── 002_memed_integration.sql  # Colunas Memed (cpf, birth_date, crm, memed_token, etc.)
│   ├── 003_memed_cache.sql        # Tabelas de cache (cidades, especialidades)
│   └── 004_profile_and_support.sql # states, specialties + colunas de perfil
├── routes/
│   ├── agenda.js               # /api/agenda/*
│   ├── atendimento.js          # /api (iniciar, rascunho, finalizar)
│   ├── google.js               # /api/google/*
│   ├── integrations.js         # /api/integrations/* (Kommo + Memed)
│   ├── patients.js             # /api/patients/* (inclui /search, /suggested)
│   └── profile.js              # /api/states, /api/specialties, /api/profile
├── services/
│   ├── agendaSyncService.js    # Sincroniza eventos com Google Calendar
│   ├── crmService.js           # CRUD credenciais Kommo
│   ├── doctorService.js        # CRUD médicos + tokens Google + Memed
│   ├── googleCalendarService.js # Criação/remoção de eventos no Google Calendar
│   ├── memedService.js         # Integração Memed (profissionais, prescrições, protocolos, cache)
│   ├── patientService.js       # CRUD pacientes + busca + sugestão + seed
│   └── profileService.js       # Consulta/atualização de perfil (com transaction)
├── utils/
│   ├── age.js                  # Cálculo de idade
│   ├── generateBloqueioDates.js # Geração de datas para bloqueios recorrentes
│   ├── googleApiClient.js      # Cliente HTTP raw para Google Calendar API
│   └── googleTokenExchange.js  # Troca de código OAuth por tokens
├── db.js                       # Pool PostgreSQL, migrations, helpers
├── server.js                   # Entry point Express
├── schema-agenda.sql           # Schema SQLite (legado / referência)
└── schema-doctors.sql          # Schema SQLite (legado / referência)
```

---

## Endpoints de API

### Health Check

```
GET /api/health
```

**Resposta:**
```json
{
  "ok": true,
  "service": "pep-emr-api",
  "port": 3001,
  "database": "postgresql"
}
```

---

### Atendimento (prontuário)

#### `POST /api/iniciar`
Inicia um novo atendimento com rascunhos vazios.

**Payload:**
```json
{
  "medico_id": 1,
  "paciente_id": "uuid-do-paciente"
}
```
> Se `paciente_id` não for informado, o sistema usa o primeiro paciente cadastrado.

**Resposta (201):**
```json
{
  "atendimento_id": 1,
  "medico_id": 1,
  "paciente_id": "uuid",
  "drafts": {
    "anamnese": { "texto": "" },
    "orientacao": { "texto": "" },
    "...": {}
  }
}
```

#### `POST /api/rascunho`
Salva o rascunho de um módulo do atendimento (auto-save com debounce de 1.5s no front-end).

**Payload:**
```json
{
  "atendimento_id": 1,
  "module": "anamnese",
  "content": { "texto": "<html>" }
}
```

**Resposta:**
```json
{
  "ok": true,
  "atendimento_id": 1,
  "module": "anamnese",
  "saved_at": "2026-01-01T00:00:00.000Z"
}
```

#### `POST /api/finalizar`
Finaliza o atendimento e gera URLs mockadas de documentos.

**Payload:**
```json
{
  "atendimento_id": 1
}
```

**Resposta:**
```json
{
  "ok": true,
  "atendimento_id": 1,
  "file_id": 1,
  "urls": {
    "anamnese": "https://storage.pep.local/atendimentos/1/anamnese.pdf",
    "orientacao": "https://storage.pep.local/atendimentos/1/orientacao.pdf",
    "...": "..."
  }
}
```

#### `GET /api/atendimentos/:id`
Retorna os rascunhos de um atendimento.

**Resposta:**
```json
{
  "atendimento_id": 1,
  "drafts": { "anamnese": { "texto": "" }, "...": {} }
}
```

---

### Agenda

#### `GET /api/agenda`
Lista eventos da agenda em um período.

**Query Parameters:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `startDate` | `string` (YYYY-MM-DD) | Sim | Data inicial |
| `endDate` | `string` (YYYY-MM-DD) | Sim | Data final |
| `clinic_id` | `number` | Sim | ID da clínica |
| `doctor_id` | `number` | Não | Filtro por médico |

**Resposta:**
```json
{
  "events": [
    {
      "id": 1,
      "doctor_id": 1,
      "clinic_id": 1,
      "tipo_evento": "CONSULTA",
      "grupo_bloqueio_id": null,
      "data_evento": "2026-06-17",
      "hora_inicio": "10:00",
      "hora_fim": "10:30",
      "paciente_id": "uuid",
      "paciente_nome": "Dara Amaral",
      "motivo_bloqueio": null,
      "google_event_id": null,
      "timezone": "America/Sao_Paulo",
      "medico_nome": "Dr. Marco Silva"
    }
  ],
  "medicos": { "1": "Dr. Marco Silva", "2": "teste Dr", "3": "Dra. Ana Costa" }
}
```

#### `POST /api/agenda/consulta`
Cria uma consulta na agenda.

**Payload:**
```json
{
  "doctor_id": 1,
  "clinic_id": 1,
  "paciente_id": "uuid",
  "data_evento": "2026-06-17",
  "hora_inicio": "10:00",
  "hora_fim": "10:30"
}
```

**Resposta (201):**
```json
{
  "event": { "...": "..." },
  "google_sync": {
    "synced": true,
    "google_event_id": "google-calendar-event-id"
  }
}
```

#### `POST /api/agenda/bloqueio`
Cria bloqueio(s) de horário com suporte a recorrência.

**Payload:**
```json
{
  "doctor_id": 1,
  "clinic_id": 1,
  "motivo_bloqueio": "Feriado",
  "hora_inicio": "00:01",
  "hora_fim": "23:59",
  "data_inicio": "2026-06-14",
  "tipo_repeticao": "UNICO",
  "data_limite": "2026-06-20"
}
```

**Tipos de repetição:** `UNICO`, `PERIODO` (diário), `SEMANAL`, `MENSAL`

**Resposta (201):**
```json
{
  "grupo_bloqueio_id": "uuid-do-grupo",
  "total": 1,
  "events": [ "..." ],
  "google_sync": { "synced": 1, "failed": 0, "skipped": 0, "errors": [] }
}
```

---

### Pacientes

#### `GET /api/patients/suggested`
Retorna o paciente sugerido para o momento (próximo agendamento ou primeiro alfabético).

**Resposta:**
```json
{
  "id": "uuid",
  "full_name": "Dara Amaral",
  "birth_date": "1991-03-12",
  "age": 34,
  "document": "123.456.789-00"
}
```

#### `GET /api/patients/search?q=...`
Busca pacientes por nome ou documento.

**Resposta:**
```json
{
  "patients": [
    { "id": "uuid", "full_name": "Dara Amaral", "birth_date": "1991-03-12", "age": 34, "document": "123.456.789-00" }
  ]
}
```

#### `GET /api/patients`
Lista todos os pacientes (resumo: id, nome, idade).

**Resposta:**
```json
{
  "patients": [
    { "id": "uuid", "full_name": "Dara Amaral", "birth_date": "1991-03-12", "age": 34 }
  ]
}
```

#### `GET /api/patients/:id`
Retorna detalhes completos de um paciente.

**Resposta:**
```json
{
  "id": "uuid",
  "full_name": "Dara Amaral",
  "birth_date": "1991-03-12",
  "email": "dara@example.com",
  "phone": "(11) 98765-4321",
  "document": "123.456.789-00",
  "kommo_id": null,
  "created_at": "...",
  "updated_at": "...",
  "age": 34,
  "integration_status": "Não integrado"
}
```

#### `POST /api/patients`
Cadastra um novo paciente.

**Payload:**
```json
{
  "full_name": "Nome Completo",
  "birth_date": "1991-03-12",
  "email": "email@example.com",
  "phone": "(11) 99999-9999",
  "document": "123.456.789-00"
}
```

**Resposta (201):**
```json
{ "id": "uuid", "full_name": "...", "birth_date": "...", "age": 34 }
```

---

### Perfil do Médico

#### `GET /api/states`
Lista os 27 estados brasileiros para dropdown.

**Resposta:**
```json
{
  "states": [
    { "id": 1, "name": "Acre", "abbreviation": "AC" },
    "..."
  ]
}
```

#### `GET /api/specialties`
Lista as especialidades médicas.

**Resposta:**
```json
{
  "specialties": [
    { "id": 1, "name": "Acupuntura" },
    "..."
  ]
}
```

#### `GET /api/profile?doctor_id=1`
Perfil completo do médico (JOIN com states e specialties).

**Resposta:**
```json
{
  "id": 1,
  "nome": "Dr. Marco Silva",
  "first_name": "Marco",
  "last_name": "Silva",
  "cpf": "12345678909",
  "birth_date": "1980-05-10",
  "gender": "Masculino",
  "email": "marco@example.com",
  "phone": "11987654321",
  "board_type": "CRM",
  "crm": "123456",
  "crm_uf": "SP",
  "req_number": null,
  "state_id": 25,
  "specialty_id": 5,
  "specialty_name": "Cardiologia",
  "state_abbreviation": "SP"
}
```

#### `PATCH /api/profile`
Atualiza os dados do perfil (usa **transaction**). Valida CPF, birth_date e crm obrigatórios.

**Payload:**
```json
{
  "doctor_id": 1,
  "first_name": "Marco",
  "gender": "Masculino",
  "email": "marco@example.com",
  "state_id": 25,
  "specialty_id": 5
}
```

**Resposta:** Perfil atualizado (mesmo formato do GET).

---

### Google Calendar (OAuth2)

#### `GET /api/google/auth/:doctor_id`
Redireciona o médico para a tela de autorização do Google.

#### `GET /api/google/callback`
Callback OAuth — troca o código por tokens e salva no banco.

**Resposta:** Redireciona para `/agenda?google=success` ou `/agenda?google=error&message=...`.

#### `GET /api/google/status/:doctor_id`
Retorna status da conexão Google do médico.

**Resposta:**
```json
{
  "doctor_id": 1,
  "nome": "Dr. Marco Silva",
  "connected": true,
  "google_calendar_id": "primary"
}
```

#### `POST /api/google/disconnect/:doctor_id`
Remove os tokens Google do médico.

**Resposta:**
```json
{ "ok": true, "doctor_id": 1, "connected": false }
```

---

### Integrações — Kommo

#### `POST /api/integrations/kommo/connect`
Salva ou atualiza credenciais de integração com o CRM Kommo.

**Payload:**
```json
{
  "api_key": "sua-api-key",
  "subdomain": "minha-clinica"
}
```

**Resposta (201):**
```json
{
  "ok": true,
  "provider": "kommo",
  "subdomain": "minha-clinica",
  "connected": true
}
```

---

### Integrações — Memed (Prescrição Digital)

#### `GET /api/integrations/memed/token?doctor_id=1`
Obtém ou cria o token do médico na Memed (com validação via GET + cadastro via POST).

**Resposta:**
```json
{
  "memed_token": "token-temporario",
  "memed_id": "external-id"
}
```

#### `GET /api/integrations/memed/prescriptions/:doctorId`
Histórico de prescrições do médico.

#### `GET /api/integrations/memed/prescriptions/:doctorId/:prescriptionId/receita`
Recupera o link da Receita Digital.

#### `GET /api/integrations/memed/prescriptions/:doctorId/:prescriptionId/pdf`
Recupera a URL do PDF da prescrição.

#### `POST /api/integrations/memed/protocolos`
Cria um protocolo para um médico específico.

#### `POST /api/integrations/memed/protocolos/parceiros`
Cria protocolos para todos os prescritores parceiros.

#### `PATCH /api/integrations/memed/opcoes-receituario/:doctorId`
Atualiza opções de impressão do receituário.

#### `POST /api/integrations/memed/opcoes-receituario/:doctorId/upload-template`
Upload de template PDF (papel timbrado) para recorte automático.

#### `GET /api/integrations/memed/cidades`
Lista de cidades (cache de 24h na tabela `memed_cidades`).

#### `GET /api/integrations/memed/especialidades`
Lista de especialidades (cache de 24h na tabela `memed_especialidades`).

---

## Integração CRM Kommo

A integração com **Kommo** (antigo amoCRM) funciona via API Key + subdomínio:

1. O usuário informa `api_key` e `subdomain` no modal `CrmConnectModal`
2. O backend armazena em `crm_settings` com `provider_name = 'kommo'` (upsert)
3. O campo `kommo_id` na tabela `patients` é reservado para armazenar o ID do contato no Kommo

Atualmente a integração é **unidirecional**: apenas armazena as credenciais.

---

## Integração Memed (Prescrição Digital)

O `memedService.js` centraliza toda a comunicação com a API Memed:

- **Auth:** Basic Auth (`MEMED_API_KEY : MEMED_SECRET_KEY`)
- **URL:** `integrations.api.memed.com.br/v1` (dev) / `api.memed.com.br/v1` (production)
- **Fluxo do médico:** `GET /sinapse-prescricao/usuarios/{id}` → 404 → `POST /sinapse-prescricao/usuarios`
- **RDC 1000/25:** `cpf` e `data_nascimento` obrigatórios no cadastro
- **External ID:** UUID do médico (`memed_id`), nunca o CPF

---

## Google Calendar (Sincronização)

1. **Auth:** O médico autoriza via OAuth2 (botão "Conectar" no `AgendaHeader`)
2. **Tokens:** Armazenados na tabela `doctors`
3. **Criação de evento:** `agendaSyncService` tenta criar o evento no Google Calendar
4. **Retry com backoff:** Cliente HTTP raw com até 4 tentativas
5. **Refresh automático:** Se o access token expirar (401), usa refresh token
6. **Recuperação:** Busca evento já criado via `privateExtendedProperty`

---

## Inicialização (Seed)

Ao iniciar, o servidor executa automaticamente:

1. **`initDb()`** — Aplica migrations pendentes (001 a 004)
2. **`seedDoctors()`** — Cria 3 médicos com CPF, CRM, UF e data de nascimento
3. **`seedPatients()`** — Cria 4 pacientes demo (Dara Amaral, Teste memed, João Pedro, Maria Santos)
4. **`seedDemoData()`** — Cria 3 consultas e 1 bloqueio de exemplo na agenda
