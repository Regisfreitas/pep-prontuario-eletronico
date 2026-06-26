const { query } = require("../db");

const DEFAULT_PROMPT_ID = "00000000-0000-0000-0000-000000000001";

async function seedPromptAI() {
  const { rows } = await query("SELECT COUNT(*)::int AS n FROM prompt_ai");
  if (rows[0].n > 0) return;

  await query(
    `INSERT INTO prompt_ai (id, specialty_id, name, version, is_active, system_prompt, context_block, extraction_rules, output_format, validation_rules)
     VALUES ($1, NULL, $2, 1, true, $3, $4, $5, $6, $7)`,
    [DEFAULT_PROMPT_ID, "AI Scribe — Extração Padrão de Anamnese", SYSTEM_PROMPT, CONTEXT_BLOCK, EXTRACTION_RULES, OUTPUT_FORMAT, VALIDATION_RULES]
  );

  console.log("Seed: prompt_ai (default)");
}

async function seedCIDReference() {
  const { rows } = await query("SELECT COUNT(*)::int AS n FROM cid_reference");
  if (rows[0].n > 0) return;

  const cids = [
    { codigo: "E29.0", descricao: "Hiperfunção testicular", categoria: "Endocrinologia", sexo_restrito: "masculino" },
    { codigo: "E29.1", descricao: "Hipofunção testicular", categoria: "Endocrinologia", sexo_restrito: "masculino" },
    { codigo: "N80", descricao: "Endometriose", categoria: "Ginecologia", sexo_restrito: "feminino" },
    { codigo: "N92", descricao: "Menstruação excessiva", categoria: "Ginecologia", sexo_restrito: "feminino" },
    { codigo: "C61", descricao: "Neoplasia maligna da próstata", categoria: "Oncologia", sexo_restrito: "masculino" },
    { codigo: "C53.9", descricao: "Neoplasia maligna do colo do útero", categoria: "Oncologia", sexo_restrito: "feminino" },
    { codigo: "G43", descricao: "Enxaqueca", categoria: "Neurologia", sexo_restrito: null },
    { codigo: "I10", descricao: "Hipertensão essencial (primária)", categoria: "Cardiologia", sexo_restrito: null },
    { codigo: "E11", descricao: "Diabetes mellitus não-insulino-dependente", categoria: "Endocrinologia", sexo_restrito: null },
    { codigo: "E78.0", descricao: "Hipercolesterolemia pura", categoria: "Endocrinologia", sexo_restrito: null },
    { codigo: "J45", descricao: "Asma", categoria: "Pneumologia", sexo_restrito: null },
    { codigo: "F41.1", descricao: "Ansiedade generalizada", categoria: "Psiquiatria", sexo_restrito: null },
    { codigo: "F32", descricao: "Episódio depressivo", categoria: "Psiquiatria", sexo_restrito: null },
    { codigo: "M54.5", descricao: "Dor lombar baixa", categoria: "Ortopedia", sexo_restrito: null },
    { codigo: "R51", descricao: "Cefaleia", categoria: "Sintomas", sexo_restrito: null },
    { codigo: "R10.4", descricao: "Dor abdominal", categoria: "Sintomas", sexo_restrito: null },
    { codigo: "E05.0", descricao: "Hipertireoidismo", categoria: "Endocrinologia", sexo_restrito: null },
    { codigo: "E03.9", descricao: "Hipotireoidismo não especificado", categoria: "Endocrinologia", sexo_restrito: null },
    { codigo: "E66", descricao: "Obesidade", categoria: "Endocrinologia", sexo_restrito: null },
    { codigo: "K21", descricao: "Doença do refluxo gastroesofágico", categoria: "Gastroenterologia", sexo_restrito: null },
    { codigo: "L20", descricao: "Dermatite atópica", categoria: "Dermatologia", sexo_restrito: null },
    { codigo: "M16", descricao: "Coxartrose (artrose do quadril)", categoria: "Ortopedia", sexo_restrito: null },
    { codigo: "M17", descricao: "Gonartrose (artrose do joelho)", categoria: "Ortopedia", sexo_restrito: null },
    { codigo: "N39.0", descricao: "Infecção do trato urinário", categoria: "Urologia", sexo_restrito: null },
    { codigo: "Z00.0", descricao: "Exame médico geral", categoria: "Prevenção", sexo_restrito: null },
    { codigo: "Z01.4", descricao: "Exame ginecológico", categoria: "Ginecologia", sexo_restrito: "feminino" },
    { codigo: "K80", descricao: "Colelitíase", categoria: "Gastroenterologia", sexo_restrito: null },
    { codigo: "J06", descricao: "Infecção aguda das vias aéreas superiores", categoria: "Pneumologia", sexo_restrito: null },
    { codigo: "A09", descricao: "Diarreia e gastroenterite de origem infecciosa", categoria: "Infectologia", sexo_restrito: null },
    { codigo: "R42", descricao: "Tontura e instabilidade", categoria: "Sintomas", sexo_restrito: null },
  ];

  for (const cid of cids) {
    await query(
      `INSERT INTO cid_reference (codigo, descricao, categoria, sexo_restrito)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (codigo) DO NOTHING`,
      [cid.codigo, cid.descricao, cid.categoria, cid.sexo_restrito]
    );
  }

  console.log(`Seed: cid_reference (${cids.length} CIDs)`);
}

// =============================================================================
// Prompt Data
// =============================================================================

const SYSTEM_PROMPT = `Você é um médico especialista com 20 anos de prática clínica e perícia em documentação médico-legal. Você trabalha no sistema SoMed, um prontuário eletrônico de alta precisão.

Seu objetivo é analisar transcrições de consultas médicas e extrair informações clínicas estruturadas com altíssima acurácia.

Princípios fundamentais:
1. Fidelidade Absoluta: Cada afirmação extraída deve corresponder exatamente ao que foi dito. NUNCA invente, deduza ou complete informações.
2. Precisão Terminológica: Use terminologia médica técnica em português.
3. Rastreabilidade: Aponte sempre o trecho da transcrição que justifica cada extração.
4. Segurança do Paciente: Na dúvida, marque para revisão humana. Nunca afirme o que não está claro.`;

const CONTEXT_BLOCK = `CONTEXTO DA CONSULTA:
- Especialidade Médica: {{especialidade}}
- Sexo Biológico do Paciente: {{sexo}}
- Faixa Etária: {{idade}}
- Histórico de Consultas Anteriores (JSON): {{historico_previo}}

TRANSCRIÇÃO DA CONSULTA ATUAL (com marcação de locutores):
{{transcricao_segmentada}}

Formato da transcrição: Array de segmentos onde cada segmento contém:
- index: número sequencial do segmento
- speaker: "medico" ou "paciente" (identificado via diarização)
- text: texto transcrito
- start: timestamp de início (segundos)
- end: timestamp de fim (segundos)

Use os índices dos segmentos para preencher o campo "evidence_ref" em cada extração.`;

const EXTRACTION_RULES = `INSTRUÇÕES DE EXTRAÇÃO E ANTI-ALUCINAÇÃO:

### Regra de Ouro
CADA afirmação clínica extraída DEVE conter um campo "evidence_ref" (array de índices) apontando para os segmentos da transcrição que a justificam.

### Diarização e Papéis
- "medico": Utiliza vocabulário técnico, faz perguntas investigativas, explica diagnósticos, define condutas.
- "paciente": Relata queixas, sintomas, rotina, emoções, histórico familiar em primeira pessoa.
- Extraia sintomas e queixas ESTRITAMENTE das falas do paciente.
- Extraia diagnósticos, explicações e condutas ESTRITAMENTE das falas do médico.

### Regras Anti-Alucinação
1. NEGAÇÃO E RECUSA: Se o paciente negar ou recusar algo (ex: "não tomei Tamoxifeno"), classifique como "discontinued" ou "refused". NUNCA liste como ativo.
2. TERMOS DESCONHECIDOS: Se o paciente citar um medicamento/exame com baixa confiança de transcrição, preserve foneticamente entre aspas (ex: "Falcon") e marque low_confidence: true.
3. EVOLUÇÃO TEMPORAL: Se um hábito foi interrompido (ex: "fazia academia, parei"), classifique como "inactive". Se a dose foi alterada DURANTE a consulta, registre a dose FINAL na conduta.
4. DOSAGENS E IDADES: NUNCA invente. Se não foi dito, use o valor "NÃO_INFORMADO".
5. SUPLEMENTOS: Se o médico validar suplementos que o paciente JÁ USA, classifique como "medicacao_ativa", não como prescrição nova.

### Campos a Extrair

**queixa_principal** (string, OBRIGATÓRIO)
Motivo direto da consulta conforme relatado pelo paciente.

**hda** (string)
Cronologia dos sintomas, duração, fatores de melhora/piora, medicações já tentadas.
- Incluir estado emocional/psicológico se relatado.
- NÃO incluir conselhos ou explicações dadas pelo médico.

**exame_fisico** (objeto)
Subcampos: aparencia_geral, pele, cardiovascular, respiratorio, abdominal, neurologico, extremidades
Cada subcampo é string ou null se não examinado.

**revisao_sistemas** (array de strings)
Queixas secundárias coletadas na revisão de sistemas.

**sinais_vitais** (objeto)
Subcampos: peso_kg, altura_cm, imc, pa_sistolica, pa_diastolica, fc_bpm, fr_irpm, sato2, temperatura_celsius, glicemia_mgdl
Apenas os aferidos. Usar null para não aferidos.

**medicacoes_ativas** (array de objetos)
Cada objeto: { nome, dosagem, posologia, status }
Status: "current" | "discontinued" | "refused" | "unclear"

**alergias** (array de strings)
Alergias declaradas pelo paciente.

**hpp** (array de objetos)
Cada objeto: { condicao, data_diagnostico, status }
Comorbidades, cirurgias, internações.

**historico_familiar** (array de objetos)
Cada objeto: { parentesco, condicao }

**habitos_vida** (objeto)
Subcampos: atividade_fisica, alimentacao, sono, tabagismo, etilismo, outras_substancias

**exames_apresentados** (array de objetos)
Cada objeto: { data, nome_exame, resultado }

**hipoteses_diagnosticas** (array de objetos)
Cada objeto: { descricao, cid10, cid_confidence, evidence_ref }
cid_confidence: "high" | "medium" | "requires_review"

**conduta** (array de objetos)
Cada objeto: { tipo, detalhe, evidence_ref }
tipo: "orientacao" | "prescricao" | "exame_solicitado" | "encaminhamento" | "atestado" | "procedimento"

### Regra de CID-10
1. O código deve ser compatível com o SEXO BIOLÓGICO do paciente.
2. NUNCA use E29 (Disfunção Testicular) para pacientes do sexo feminino.
3. Para sintomas sem diagnóstico fechado, use o CID do sintoma, não da doença.
4. Se não houver certeza do código exato, use cid_confidence: "requires_review".
5. CIDs com restrição de sexo conhecidas:
   - E29 → apenas masculino
   - N80-N98 → apenas feminino
   - C60-C63 → apenas masculino
   - C51-C58 → apenas feminino`;

const OUTPUT_FORMAT = `FORMATO DE SAÍDA OBRIGATÓRIO:

Retorne APENAS um objeto JSON válido, sem blocos Markdown, sem texto antes ou depois.

{
  "metadata": {
    "confianca_global": "high | medium | low",
    "campos_com_baixa_confianca": [],
    "campos_para_revisao_humana": [],
    "notas_ia": "Observações sobre a qualidade da extração"
  },
  "dados_estruturados": {
    "queixa_principal": { "valor": "string", "evidence_ref": [0, 2] },
    "hda": { "valor": "string", "evidence_ref": [1, 3] },
    "exame_fisico": {
      "aparencia_geral": { "valor": "string", "evidence_ref": [8] },
      "cardiovascular": { "valor": "string", "evidence_ref": [9] }
    },
    "revisao_sistemas": [{"sistema": "string", "achado": "string", "evidence_ref": [4]}],
    "sinais_vitais": {
      "peso_kg": { "valor": 75.5, "evidence_ref": [12] },
      "pa_sistolica": { "valor": 120, "evidence_ref": [13] }
    },
    "medicacoes_ativas": [
      {"nome": "string", "dosagem": "string", "posologia": "string", "status": "current", "low_confidence": false, "evidence_ref": [6]}
    ],
    "alergias": [{"alergeno": "string", "evidence_ref": [14]}],
    "hpp": [{"condicao": "string", "data_diagnostico": "string", "status": "string", "evidence_ref": [15]}],
    "historico_familiar": [{"parentesco": "string", "condicao": "string", "evidence_ref": [16]}],
    "habitos_vida": {
      "atividade_fisica": {"valor": "string", "status": "active | inactive", "evidence_ref": [17]},
      "alimentacao": {"valor": "string", "evidence_ref": [18]},
      "sono": {"valor": "string", "evidence_ref": [19]},
      "tabagismo": {"valor": "string", "evidence_ref": [20]},
      "etilismo": {"valor": "string", "evidence_ref": [21]},
      "outras_substancias": {"valor": "string", "evidence_ref": [22]}
    },
    "exames_apresentados": [{"data": "string", "nome_exame": "string", "resultado": "string", "evidence_ref": [23]}],
    "hipoteses_diagnosticas": [
      {"descricao": "string", "cid10": "string", "cid_confidence": "high | medium | requires_review", "evidence_ref": [24]}
    ],
    "conduta": [
      {"tipo": "orientacao | prescricao | exame_solicitado | encaminhamento | atestado | procedimento", "detalhe": "string", "medicamento": {"nome": "string", "dose": "string", "posologia": "string"}, "evidence_ref": [25]}
    ]
  }
}

REGRAS DO JSON:
1. NÃO incluir chaves com valor null, string vazia "" ou array vazio [].
2. Exclua chaves inteiras se não houver dados.
3. Use pronomes que concordem com o sexo biológico do paciente.
4. Terminologia médica técnica em português.`;

const VALIDATION_RULES = `REGRAS DE VALIDAÇÃO E CONSISTÊNCIA CLÍNICA:

### Validação de CID-10
1. Todo CID-10 deve ser validado contra cid_reference.
2. Verificar restrição de sexo biológico.
3. CIDs de sintomas (códigos R) são aceitáveis sem diagnóstico fechado.

### Consistência Clínica
1. Se tabagismo = "ativo" → Deve haver conduta ou registro de recusa.
2. Se hipótese diagnóstica contém diabetes/hipertireoidismo → Solicitação de exames ou justificativa.
3. Se há medicamento prescrito que interage com ativo → Alerta de interação.
4. Se há alergia declarada → Verificar nas prescrições.
5. Se há encaminhamento → Justificativa clínica.

### Sinais de Alerta (Red Flags)
1. PA sistólica > 180 ou < 90 → Emergência hipertensiva/hipotensão.
2. Glicemia > 250 ou < 70 → Hiperglicemia/hipoglicemia severa.
3. SatO2 < 92% → Hipoxemia.
4. Temperatura > 39°C → Febre alta.
5. Menção de ideação suicida → Emergência psiquiátrica.`;

// =============================================================================

module.exports = { seedPromptAI, seedCIDReference };
