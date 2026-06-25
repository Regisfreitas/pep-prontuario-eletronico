const crypto = require('crypto');
const { query, withTransaction, pgErrorMessage } = require('../db');
const { generateBloqueioDates } = require('../utils/generateBloqueioDates');
const { getMedicosMap } = require('../services/doctorService');
const { getPatientsMap, DEMO_PATIENTS } = require('../services/patientService');
const {
  syncAgendaEventToGoogle,
  syncManyAgendaEvents,
} = require('../services/agendaSyncService');

async function toEventRow(row, patientsMap) {
  const medicos = await getMedicosMap();
  const pacienteNome = row.paciente_id ? patientsMap[row.paciente_id] : null;
  return {
    id: row.id,
    doctor_id: row.doctor_id,
    clinic_id: row.clinic_id,
    tipo_evento: row.tipo_evento,
    grupo_bloqueio_id: row.grupo_bloqueio_id,
    data_evento: row.data_evento,
    hora_inicio: row.hora_inicio,
    hora_fim: row.hora_fim,
    paciente_id: row.paciente_id,
    paciente_nome: pacienteNome,
    motivo_bloqueio: row.motivo_bloqueio,
    google_event_id: row.google_event_id,
    timezone: row.timezone,
    medico_nome: medicos[row.doctor_id] ?? `Médico #${row.doctor_id}`,
  };
}

async function listAgenda(req, res) {
  const { startDate, endDate, clinic_id, doctor_id } = req.query;

  if (!startDate || !endDate || !clinic_id) {
    return res.status(400).json({
      error: 'startDate, endDate e clinic_id são obrigatórios',
    });
  }

  let sql = `
    SELECT * FROM agenda
    WHERE clinic_id = $1
      AND data_evento >= $2
      AND data_evento <= $3
  `;
  const params = [clinic_id, startDate, endDate];

  if (doctor_id) {
    sql += ` AND doctor_id = $${params.length + 1}`;
    params.push(doctor_id);
  }

  sql += ' ORDER BY data_evento, hora_inicio';

  try {
    const { rows } = await query(sql, params);
    const patientsMap = await getPatientsMap();
    const medicos = await getMedicosMap();
    res.json({
      events: await Promise.all(rows.map((row) => toEventRow(row, patientsMap))),
      medicos,
    });
  } catch (err) {
    res.status(500).json({ error: pgErrorMessage(err) });
  }
}

async function createConsulta(req, res) {
  const {
    doctor_id,
    clinic_id,
    paciente_id,
    data_evento,
    hora_inicio,
    hora_fim,
  } = req.body;

  if (!doctor_id || !clinic_id || !paciente_id || !data_evento || !hora_inicio || !hora_fim) {
    return res.status(400).json({
      error: 'doctor_id, clinic_id, paciente_id, data_evento, hora_inicio e hora_fim são obrigatórios',
    });
  }

  try {
    const { rows } = await query(
      `INSERT INTO agenda (
        doctor_id, clinic_id, tipo_evento, data_evento,
        hora_inicio, hora_fim, paciente_id
      ) VALUES ($1, $2, 'CONSULTA', $3, $4, $5, $6)
      RETURNING *`,
      [doctor_id, clinic_id, data_evento, hora_inicio, hora_fim, paciente_id]
    );

    let row = rows[0];
    const patientsMap = await getPatientsMap();

    const googleSync = await syncAgendaEventToGoogle(row, {
      pacienteNome: patientsMap[paciente_id],
    });

    if (googleSync.google_event_id) {
      const refreshed = await query('SELECT * FROM agenda WHERE id = $1', [row.id]);
      row = refreshed.rows[0];
    }

    res.status(201).json({
      event: await toEventRow(row, patientsMap),
      google_sync: googleSync,
    });
  } catch (err) {
    res.status(422).json({ error: pgErrorMessage(err) });
  }
}

async function createBloqueio(req, res) {
  const {
    doctor_id,
    clinic_id,
    motivo_bloqueio,
    hora_inicio,
    hora_fim,
    data_inicio,
    tipo_repeticao,
    data_limite,
  } = req.body;

  if (!doctor_id || !clinic_id || !motivo_bloqueio || !hora_inicio || !hora_fim || !data_inicio || !tipo_repeticao) {
    return res.status(400).json({
      error: 'doctor_id, clinic_id, motivo_bloqueio, hora_inicio, hora_fim, data_inicio e tipo_repeticao são obrigatórios',
    });
  }

  const validTipos = ['UNICO', 'PERIODO', 'SEMANAL', 'MENSAL'];
  if (!validTipos.includes(tipo_repeticao)) {
    return res.status(400).json({ error: 'tipo_repeticao inválido' });
  }

  if (tipo_repeticao !== 'UNICO' && !data_limite) {
    return res.status(400).json({ error: 'data_limite é obrigatória para repetições' });
  }

  const dates = generateBloqueioDates(data_inicio, tipo_repeticao, data_limite);
  if (dates.length === 0) {
    return res.status(400).json({ error: 'Nenhuma data gerada para o bloqueio' });
  }

  const grupoId = crypto.randomUUID();

  try {
    const createdRows = await withTransaction(async (client) => {
      const created = [];
      for (const data_evento of dates) {
        const { rows } = await client.query(
          `INSERT INTO agenda (
            doctor_id, clinic_id, tipo_evento, grupo_bloqueio_id,
            data_evento, hora_inicio, hora_fim, motivo_bloqueio
          ) VALUES ($1, $2, 'BLOQUEIO', $3, $4, $5, $6, $7)
          RETURNING *`,
          [doctor_id, clinic_id, grupoId, data_evento, hora_inicio, hora_fim, motivo_bloqueio]
        );
        created.push(rows[0]);
      }
      return created;
    });

    const googleSync = await syncManyAgendaEvents(createdRows);
    const patientsMap = await getPatientsMap();

    const events = await Promise.all(
      createdRows.map((row) => toEventRow(row, patientsMap))
    );

    res.status(201).json({
      grupo_bloqueio_id: grupoId,
      total: events.length,
      events,
      google_sync: googleSync,
    });
  } catch (err) {
    res.status(422).json({ error: pgErrorMessage(err) });
  }
}

async function seedDemoData() {
  const { rows } = await query('SELECT COUNT(*)::int AS n FROM agenda');
  if (rows[0].n > 0) return;

  const patientIds = DEMO_PATIENTS.map((p) => p.id);

  await query(
    `INSERT INTO agenda (
      doctor_id, clinic_id, tipo_evento, data_evento,
      hora_inicio, hora_fim, paciente_id
    ) VALUES
      (1, 1, 'CONSULTA', '2026-06-16', '10:00', '10:30', $1),
      (1, 1, 'CONSULTA', '2026-06-17', '14:00', '14:30', $2),
      (2, 1, 'CONSULTA', '2026-06-18', '09:00', '09:30', $3)`,
    [patientIds[1], patientIds[0], patientIds[2]]
  );

  await query(
    `INSERT INTO agenda (
      doctor_id, clinic_id, tipo_evento, grupo_bloqueio_id,
      data_evento, hora_inicio, hora_fim, motivo_bloqueio
    ) VALUES ($1, $2, 'BLOQUEIO', $3, $4, $5, $6, $7)`,
    [1, 1, crypto.randomUUID(), '2026-06-14', '00:01', '23:59', 'Feriado local']
  );
}

module.exports = {
  listAgenda,
  createConsulta,
  createBloqueio,
  seedDemoData,
};
