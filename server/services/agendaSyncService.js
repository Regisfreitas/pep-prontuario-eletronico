const { query } = require('../db');
const { updateGoogleAccessToken } = require('./doctorService');
const {
  createAgendaEvent,
  isOAuthConfigured,
} = require('./googleCalendarService');

async function setAgendaGoogleEventId(agendaId, googleEventId) {
  await query('UPDATE agenda SET google_event_id = $1 WHERE id = $2', [
    googleEventId,
    agendaId,
  ]);
}

async function getAgendaRowById(id) {
  const { rows } = await query('SELECT * FROM agenda WHERE id = $1', [id]);
  return rows[0] ?? null;
}

function onTokensRefreshed(doctorId, tokens) {
  return updateGoogleAccessToken(doctorId, tokens.access_token, tokens.refresh_token);
}

async function syncAgendaEventToGoogle(agendaRow, meta = {}) {
  const { getDoctorById } = require('./doctorService');
  const doctor = await getDoctorById(agendaRow.doctor_id);

  if (!doctor?.google_refresh_token) {
    return { synced: false, skipped: true, reason: 'not_connected' };
  }

  if (!isOAuthConfigured()) {
    return { synced: false, skipped: true, reason: 'oauth_not_configured' };
  }

  if (agendaRow.google_event_id) {
    return {
      synced: false,
      skipped: true,
      reason: 'already_synced',
      google_event_id: agendaRow.google_event_id,
    };
  }

  try {
    const googleEventId = await createAgendaEvent(
      doctor,
      agendaRow,
      meta,
      onTokensRefreshed
    );

    await setAgendaGoogleEventId(agendaRow.id, googleEventId);

    return { synced: true, google_event_id: googleEventId };
  } catch (err) {
    console.error(`Google sync failed for agenda #${agendaRow.id}:`, err.message);

    if (err.message?.includes('Premature close') || err.prematureClose) {
      return {
        synced: false,
        error:
          'Evento pode ter sido criado no Google, mas a resposta foi interrompida. Verifique o Google Agenda.',
        warning: true,
      };
    }

    return { synced: false, error: err.message };
  }
}

async function syncManyAgendaEvents(rows, meta = {}) {
  const results = {
    synced: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };

  for (const row of rows) {
    const rowMeta = {
      ...meta,
      pacienteNome: meta.pacienteNomeByRow?.(row) ?? meta.pacienteNome,
    };
    const outcome = await syncAgendaEventToGoogle(row, rowMeta);

    if (outcome.synced) results.synced += 1;
    else if (outcome.skipped) results.skipped += 1;
    else {
      results.failed += 1;
      if (outcome.error) results.errors.push({ agenda_id: row.id, error: outcome.error });
    }
  }

  return results;
}

module.exports = {
  syncAgendaEventToGoogle,
  syncManyAgendaEvents,
  setAgendaGoogleEventId,
  getAgendaRowById,
};
