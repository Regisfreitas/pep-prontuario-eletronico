const { google } = require('googleapis');
const { exchangeAuthorizationCode, refreshAccessToken } = require('../utils/googleTokenExchange');
const {
  insertCalendarEvent,
  findEventByPepAgendaId,
  sleep,
} = require('../utils/googleApiClient');

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.readonly',
];

const DEFAULT_TIMEZONE = 'America/Sao_Paulo';

function env(name) {
  return (process.env[name] || '').trim();
}

function getOAuthCredentials() {
  return {
    clientId: env('GOOGLE_CLIENT_ID'),
    clientSecret: env('GOOGLE_CLIENT_SECRET'),
    redirectUri: env('GOOGLE_REDIRECT_URI'),
  };
}

function createOAuth2Client() {
  const { clientId, clientSecret, redirectUri } = getOAuthCredentials();

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      'Google OAuth não configurado. Defina GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET e GOOGLE_REDIRECT_URI.'
    );
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

function generateAuthUrl(doctorId) {
  const client = createOAuth2Client();
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
    state: String(doctorId),
  });
}

async function exchangeCodeForTokens(code) {
  const credentials = getOAuthCredentials();

  try {
    return await exchangeAuthorizationCode(code, credentials);
  } catch (nativeErr) {
    console.warn('Token exchange via HTTPS falhou, tentando googleapis:', nativeErr.message);
    try {
      const client = createOAuth2Client();
      const { tokens } = await client.getToken(code);
      return tokens;
    } catch (libErr) {
      throw nativeErr;
    }
  }
}

function getAuthenticatedClient(doctor) {
  const client = createOAuth2Client();
  client.setCredentials({
    access_token: doctor.google_access_token,
    refresh_token: doctor.google_refresh_token,
  });
  return client;
}

function getCalendarApi(doctor) {
  const auth = getAuthenticatedClient(doctor);
  return google.calendar({ version: 'v3', auth });
}

function isOAuthConfigured() {
  const { clientId, clientSecret, redirectUri } = getOAuthCredentials();
  return Boolean(clientId && clientSecret && redirectUri);
}

function normalizeTime(time) {
  if (!time) return '00:00:00';
  return time.length === 5 ? `${time}:00` : time;
}

function isAllDayEvent(horaInicio, horaFim) {
  const start = normalizeTime(horaInicio);
  const end = normalizeTime(horaFim);
  return start <= '00:05:00' && end >= '23:55:00';
}

function addDaysToDateString(dateStr, days) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day + days);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function buildEventResource(agendaRow, meta = {}) {
  const timezone = agendaRow.timezone || DEFAULT_TIMEZONE;
  const isBloqueio = agendaRow.tipo_evento === 'BLOQUEIO';
  const pacienteNome = meta.pacienteNome || `Paciente #${agendaRow.paciente_id}`;

  const summary = isBloqueio
    ? agendaRow.motivo_bloqueio || 'Horário bloqueado'
    : `Consulta: ${pacienteNome}`;

  const description = [
    'Sincronizado via PEP EMR',
    `ID local: ${agendaRow.id}`,
    isBloqueio ? null : `Paciente ID: ${agendaRow.paciente_id}`,
    agendaRow.grupo_bloqueio_id ? `Grupo: ${agendaRow.grupo_bloqueio_id}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const resource = {
    summary,
    description,
    extendedProperties: {
      private: {
        pep_agenda_id: String(agendaRow.id),
        pep_tipo: agendaRow.tipo_evento,
        pep_clinic_id: String(agendaRow.clinic_id),
      },
    },
  };

  if (isAllDayEvent(agendaRow.hora_inicio, agendaRow.hora_fim)) {
    resource.start = { date: agendaRow.data_evento };
    resource.end = { date: addDaysToDateString(agendaRow.data_evento, 1) };
  } else {
    const startTime = normalizeTime(agendaRow.hora_inicio).slice(0, 8);
    const endTime = normalizeTime(agendaRow.hora_fim).slice(0, 8);
    resource.start = {
      dateTime: `${agendaRow.data_evento}T${startTime}`,
      timeZone: timezone,
    };
    resource.end = {
      dateTime: `${agendaRow.data_evento}T${endTime}`,
      timeZone: timezone,
    };
  }

  resource.colorId = isBloqueio ? '8' : '10';
  if (isBloqueio) resource.transparency = 'opaque';

  return resource;
}

function attachTokenRefresh(auth, doctorId, onTokensUpdated) {
  auth.on('tokens', (tokens) => {
    if (tokens.access_token) {
      onTokensUpdated(doctorId, tokens);
    }
  });
}

async function createAgendaEvent(doctor, agendaRow, meta, onTokensUpdated) {
  const calendarId = doctor.google_calendar_id || 'primary';
  const eventBody = buildEventResource(agendaRow, meta);
  let accessToken = doctor.google_access_token;

  const recoverExistingEvent = async (token) => {
    await sleep(2000);
    const list = await findEventByPepAgendaId(token, calendarId, String(agendaRow.id));
    return list.items?.[0]?.id || null;
  };

  const insertWithToken = async (token) => {
    const data = await insertCalendarEvent(token, calendarId, eventBody);
    return data.id;
  };

  try {
    return await insertWithToken(accessToken);
  } catch (err) {
    try {
      const recovered = await recoverExistingEvent(accessToken);
      if (recovered) {
        console.warn(`Google Calendar: evento #${agendaRow.id} recuperado após resposta incompleta.`);
        return recovered;
      }
    } catch (recoverErr) {
      console.warn('Google Calendar recovery failed:', recoverErr.message);
    }

    if (err.statusCode === 401 && doctor.google_refresh_token) {
      const refreshed = await refreshAccessToken(getOAuthCredentials(), doctor.google_refresh_token);
      onTokensRefreshed(doctor.id, {
        access_token: refreshed.access_token,
        refresh_token: refreshed.refresh_token,
      });
      accessToken = refreshed.access_token;

      try {
        return await insertWithToken(accessToken);
      } catch (retryErr) {
        const recovered = await recoverExistingEvent(accessToken);
        if (recovered) return recovered;
        throw retryErr;
      }
    }

    throw err;
  }
}

async function deleteAgendaEvent(doctor, googleEventId, onTokensUpdated) {
  if (!googleEventId) return;

  const auth = getAuthenticatedClient(doctor);
  attachTokenRefresh(auth, doctor.id, onTokensUpdated);

  const calendar = google.calendar({ version: 'v3', auth });
  const calendarId = doctor.google_calendar_id || 'primary';

  try {
    await calendar.events.delete({
      calendarId,
      eventId: googleEventId,
    });
  } catch (err) {
    console.warn('Google Calendar delete via googleapis failed:', err.message);
  }
}

module.exports = {
  SCOPES,
  DEFAULT_TIMEZONE,
  createOAuth2Client,
  generateAuthUrl,
  exchangeCodeForTokens,
  getAuthenticatedClient,
  getCalendarApi,
  isOAuthConfigured,
  buildEventResource,
  createAgendaEvent,
  deleteAgendaEvent,
  isAllDayEvent,
};
