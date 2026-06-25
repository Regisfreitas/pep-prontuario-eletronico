const https = require('https');

const API_HOST = 'www.googleapis.com';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableError(err, raw) {
  const msg = (err?.message || '').toLowerCase();
  return (
    msg.includes('premature close') ||
    msg.includes('timeout') ||
    msg.includes('econnreset') ||
    msg.includes('incompleta') ||
    !raw
  );
}

function googleJsonRequest({ method, path, accessToken, body, attempt = 1, maxAttempts = 4 }) {
  const bodyStr = body ? JSON.stringify(body) : null;

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: API_HOST,
        path,
        method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
          'User-Agent': 'pep-emr/1.0',
          ...(bodyStr
            ? {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(bodyStr),
              }
            : {}),
        },
        timeout: 45000,
        family: 4,
      },
      (res) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          const raw = Buffer.concat(chunks).toString('utf8');

          let json = null;
          if (raw) {
            try {
              json = JSON.parse(raw);
            } catch {
              if (attempt < maxAttempts && isRetryableError(null, raw)) {
                sleep(1500 * attempt).then(() =>
                  googleJsonRequest({
                    method,
                    path,
                    accessToken,
                    body,
                    attempt: attempt + 1,
                    maxAttempts,
                  })
                    .then(resolve)
                    .catch(reject)
                );
                return;
              }
              const err = new Error(
                `Resposta incompleta da Google Calendar API. Detalhe: ${raw.slice(0, 120) || 'vazio'}`
              );
              err.statusCode = res.statusCode;
              err.prematureClose = true;
              reject(err);
              return;
            }
          }

          if (res.statusCode >= 400) {
            const err = new Error(
              json?.error?.message || json?.error_description || `HTTP ${res.statusCode}`
            );
            err.statusCode = res.statusCode;
            reject(err);
            return;
          }

          resolve(json || {});
        });
      }
    );

    req.on('timeout', () => {
      req.destroy(new Error('Timeout ao contactar Google Calendar API'));
    });

    req.on('error', (err) => {
      if (attempt < maxAttempts && isRetryableError(err, null)) {
        sleep(1500 * attempt).then(() =>
          googleJsonRequest({
            method,
            path,
            accessToken,
            body,
            attempt: attempt + 1,
            maxAttempts,
          })
            .then(resolve)
            .catch(reject)
        );
        return;
      }
      err.prematureClose = isRetryableError(err, null);
      reject(err);
    });

    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

function insertCalendarEvent(accessToken, calendarId, eventBody) {
  const path = `/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`;
  return googleJsonRequest({
    method: 'POST',
    path,
    accessToken,
    body: eventBody,
  });
}

function findEventByPepAgendaId(accessToken, calendarId, pepAgendaId) {
  const path =
    `/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events` +
    `?privateExtendedProperty=pep_agenda_id%3D${encodeURIComponent(pepAgendaId)}` +
    '&maxResults=1&singleEvents=true&orderBy=startTime';
  return googleJsonRequest({ method: 'GET', path, accessToken });
}

module.exports = {
  insertCalendarEvent,
  findEventByPepAgendaId,
  sleep,
};
