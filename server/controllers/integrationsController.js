const { pgErrorMessage } = require('../db');
const { saveKommoCredentials } = require('../services/crmService');

async function connectKommo(req, res) {
  const { api_key, subdomain } = req.body;

  if (!api_key || !subdomain) {
    return res.status(400).json({ error: 'api_key e subdomain são obrigatórios' });
  }

  try {
    const settings = await saveKommoCredentials({ api_key, subdomain });
    res.status(201).json({
      ok: true,
      provider: settings.provider_name,
      subdomain: settings.subdomain,
      connected: settings.connected,
    });
  } catch (err) {
    res.status(422).json({ error: pgErrorMessage(err) });
  }
}

module.exports = { connectKommo };
