const { query } = require('../db');

async function saveKommoCredentials({ api_key, subdomain }) {
  const { rows: existing } = await query(
    "SELECT id FROM crm_settings WHERE provider_name = 'kommo' LIMIT 1"
  );

  if (existing.length > 0) {
    const { rows } = await query(
      `UPDATE crm_settings
       SET api_key = $1, subdomain = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, provider_name, subdomain, created_at, updated_at`,
      [api_key, subdomain, existing[0].id]
    );
    return { ...rows[0], connected: true };
  }

  const { rows } = await query(
    `INSERT INTO crm_settings (provider_name, api_key, subdomain)
     VALUES ('kommo', $1, $2)
     RETURNING id, provider_name, subdomain, created_at, updated_at`,
    [api_key, subdomain]
  );
  return { ...rows[0], connected: true };
}

async function getKommoSettings() {
  const { rows } = await query(
    "SELECT id, provider_name, subdomain, created_at, updated_at FROM crm_settings WHERE provider_name = 'kommo' LIMIT 1"
  );
  if (!rows[0]) return { connected: false };
  return { ...rows[0], connected: true };
}

module.exports = {
  saveKommoCredentials,
  getKommoSettings,
};
