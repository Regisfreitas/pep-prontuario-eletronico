const https = require('https');
const querystring = require('querystring');

const TOKEN_URL = 'https://oauth2.googleapis.com/token';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function postTokenRequest(body, attempt = 1, maxAttempts = 4) {
  const payload = querystring.stringify(body);

  return new Promise((resolve, reject) => {
    const req = https.request(
      TOKEN_URL,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(payload),
          'Accept': 'application/json',
          'User-Agent': 'pep-emr/1.0',
        },
        timeout: 45000,
        family: 4,
      },
      (res) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          const raw = Buffer.concat(chunks).toString('utf8');

          let json;
          try {
            json = JSON.parse(raw);
          } catch {
            if (attempt < maxAttempts) {
              sleep(1500 * attempt).then(() =>
                postTokenRequest(body, attempt + 1, maxAttempts).then(resolve).catch(reject)
              );
              return;
            }
            reject(
              new Error(
                `Resposta incompleta do Google OAuth (tente novamente). Detalhe: ${raw.slice(0, 120) || 'vazio'}`
              )
            );
            return;
          }

          if (res.statusCode >= 400) {
            const msg = json.error_description || json.error || `HTTP ${res.statusCode}`;
            reject(new Error(formatGoogleTokenError(msg, json.error)));
            return;
          }

          resolve(json);
        });
      }
    );

    req.on('timeout', () => {
      req.destroy(new Error('Timeout ao contactar oauth2.googleapis.com'));
    });

    req.on('error', (err) => {
      if (attempt < maxAttempts) {
        sleep(1500 * attempt).then(() =>
          postTokenRequest(body, attempt + 1, maxAttempts).then(resolve).catch(reject)
        );
        return;
      }
      reject(
        new Error(
          `Falha de rede ao trocar código OAuth (${err.message}). Verifique firewall/antivírus/VPN e tente de novo.`
        )
      );
    });

    req.write(payload);
    req.end();
  });
}

function formatGoogleTokenError(message, code) {
  if (code === 'invalid_grant') {
    return 'Código OAuth expirado ou já usado. Clique em "Conectar Google Agenda" novamente.';
  }
  if (code === 'redirect_uri_mismatch') {
    return 'redirect_uri_mismatch: confira GOOGLE_REDIRECT_URI no .env e no Google Cloud Console.';
  }
  return message;
}

function toOAuthTokens(response) {
  return {
    access_token: response.access_token,
    refresh_token: response.refresh_token,
    expiry_date: response.expires_in
      ? Date.now() + response.expires_in * 1000
      : undefined,
    token_type: response.token_type,
    scope: response.scope,
  };
}

async function exchangeAuthorizationCode(code, credentials) {
  const response = await postTokenRequest({
    code,
    client_id: credentials.clientId,
    client_secret: credentials.clientSecret,
    redirect_uri: credentials.redirectUri,
    grant_type: 'authorization_code',
  });

  return toOAuthTokens(response);
}

async function refreshAccessToken(credentials, refreshToken) {
  const response = await postTokenRequest({
    client_id: credentials.clientId,
    client_secret: credentials.clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });

  return toOAuthTokens(response);
}

module.exports = {
  exchangeAuthorizationCode,
  refreshAccessToken,
};
