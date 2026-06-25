const express = require('express');
const {
  query,
  BLANK_DRAFT,
  DRAFT_FIELDS,
  FIELD_MAP,
  URL_MAP,
  pgErrorMessage,
} = require('../db');
const { getFirstPatientId } = require('../services/patientService');

const router = express.Router();

const DEFAULT_MEDICO_ID = 1;

function mockPdfUrl(atendimentoId, module) {
  return `https://storage.pep.local/atendimentos/${atendimentoId}/${module}.pdf`;
}

router.post('/iniciar', async (req, res) => {
  try {
    const medico_id = req.body.medico_id ?? DEFAULT_MEDICO_ID;
    let paciente_id = req.body.paciente_id;

    if (!paciente_id) {
      paciente_id = await getFirstPatientId();
      if (!paciente_id) {
        return res.status(422).json({ error: 'Nenhum paciente cadastrado no sistema' });
      }
    }

    const draftPlaceholders = DRAFT_FIELDS.map((_, i) => `$${i + 3}`).join(', ');
    const values = [medico_id, paciente_id, ...DRAFT_FIELDS.map(() => BLANK_DRAFT)];

    const { rows } = await query(
      `INSERT INTO atendimentos (medico_id, paciente_id, ${DRAFT_FIELDS.join(', ')})
       VALUES ($1, $2, ${draftPlaceholders})
       RETURNING *`,
      values
    );

    const row = rows[0];

    res.status(201).json({
      atendimento_id: row.id,
      medico_id,
      paciente_id,
      drafts: parseDrafts(row),
    });
  } catch (err) {
    res.status(422).json({ error: pgErrorMessage(err) });
  }
});

router.post('/rascunho', async (req, res) => {
  const { atendimento_id, module, content } = req.body;

  if (!atendimento_id || !module) {
    return res.status(400).json({ error: 'atendimento_id e module são obrigatórios' });
  }

  const column = FIELD_MAP[module];
  if (!column) {
    return res.status(400).json({ error: `Módulo inválido: ${module}` });
  }

  try {
    const { rowCount } = await query('SELECT id FROM atendimentos WHERE id = $1', [
      atendimento_id,
    ]);
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Atendimento não encontrado' });
    }

    const draftJson = JSON.stringify(
      typeof content === 'object' ? content : { texto: content ?? '' }
    );

    await query(`UPDATE atendimentos SET ${column} = $1 WHERE id = $2`, [
      draftJson,
      atendimento_id,
    ]);

    res.json({ ok: true, atendimento_id, module, saved_at: new Date().toISOString() });
  } catch (err) {
    res.status(422).json({ error: pgErrorMessage(err) });
  }
});

router.post('/finalizar', async (req, res) => {
  const { atendimento_id } = req.body;

  if (!atendimento_id) {
    return res.status(400).json({ error: 'atendimento_id é obrigatório' });
  }

  try {
    const { rows: atendimentoRows } = await query(
      'SELECT * FROM atendimentos WHERE id = $1',
      [atendimento_id]
    );
    const atendimento = atendimentoRows[0];

    if (!atendimento) {
      return res.status(404).json({ error: 'Atendimento não encontrado' });
    }

    const urlColumns = Object.values(URL_MAP);
    const urlValues = Object.keys(URL_MAP).map((mod) => mockPdfUrl(atendimento_id, mod));
    const placeholders = urlValues.map((_, i) => `$${i + 3}`).join(', ');

    const { rows: fileRows } = await query(
      `INSERT INTO attendance_file (atendimento_id, medico_id, ${urlColumns.join(', ')})
       VALUES ($1, $2, ${placeholders})
       RETURNING *`,
      [atendimento_id, atendimento.medico_id, ...urlValues]
    );

    const fileRecord = fileRows[0];

    res.json({
      ok: true,
      atendimento_id,
      file_id: fileRecord.id,
      urls: parseUrls(fileRecord),
    });
  } catch (err) {
    res.status(422).json({ error: pgErrorMessage(err) });
  }
});

router.get('/atendimentos/:id', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM atendimentos WHERE id = $1', [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Atendimento não encontrado' });
    }

    res.json({ atendimento_id: rows[0].id, drafts: parseDrafts(rows[0]) });
  } catch (err) {
    res.status(500).json({ error: pgErrorMessage(err) });
  }
});

function parseDrafts(row) {
  const drafts = {};
  for (const [module, column] of Object.entries(FIELD_MAP)) {
    try {
      drafts[module] = JSON.parse(row[column] || BLANK_DRAFT);
    } catch {
      drafts[module] = { texto: '' };
    }
  }
  return drafts;
}

function parseUrls(row) {
  const urls = {};
  for (const [module, column] of Object.entries(URL_MAP)) {
    urls[module] = row[column];
  }
  return urls;
}

module.exports = router;
