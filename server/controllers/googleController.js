const googleCalendarService = require('../services/googleCalendarService');
const {
  getDoctorById,
  saveGoogleTokens,
  clearGoogleTokens,
  getGoogleConnectionStatus,
} = require('../services/doctorService');

function getFrontendUrl() {
  return process.env.FRONTEND_URL || 'http://localhost:5173';
}

async function startAuth(req, res) {
  const doctorId = req.params.doctor_id;
  const doctor = await getDoctorById(doctorId);

  if (!doctor) {
    return res.status(404).json({ error: 'Médico não encontrado' });
  }

  if (!googleCalendarService.isOAuthConfigured()) {
    const frontendUrl = getFrontendUrl();
    return res.redirect(
      `${frontendUrl}/agenda?google=error&message=${encodeURIComponent('Google OAuth não configurado no servidor (.env)')}`
    );
  }

  try {
    const authUrl = googleCalendarService.generateAuthUrl(doctorId);
    res.redirect(authUrl);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function handleCallback(req, res) {
  const frontendUrl = getFrontendUrl();
  const { code, state, error } = req.query;

  if (error) {
    return res.redirect(`${frontendUrl}/agenda?google=error&message=${encodeURIComponent(error)}`);
  }

  if (!code || !state) {
    return res.redirect(`${frontendUrl}/agenda?google=error&message=missing_code`);
  }

  const doctor = await getDoctorById(state);
  if (!doctor) {
    return res.redirect(`${frontendUrl}/agenda?google=error&message=doctor_not_found`);
  }

  try {
    const tokens = await googleCalendarService.exchangeCodeForTokens(code);
    await saveGoogleTokens(state, tokens);
    res.redirect(`${frontendUrl}/agenda?google=success&doctor_id=${state}`);
  } catch (err) {
    console.error('Google OAuth callback error:', err.message);
    const friendly = err.message.includes('Premature close')
      ? 'Conexão interrompida com o Google. Reinicie npm run dev e clique em Conectar novamente (não recarregue a página do callback).'
      : err.message;
    res.redirect(
      `${frontendUrl}/agenda?google=error&message=${encodeURIComponent(friendly)}`
    );
  }
}

async function getStatus(req, res) {
  const status = await getGoogleConnectionStatus(req.params.doctor_id);
  if (!status) {
    return res.status(404).json({ error: 'Médico não encontrado' });
  }
  res.json(status);
}

async function disconnect(req, res) {
  const doctor = await getDoctorById(req.params.doctor_id);
  if (!doctor) {
    return res.status(404).json({ error: 'Médico não encontrado' });
  }

  await clearGoogleTokens(req.params.doctor_id);
  res.json({ ok: true, doctor_id: Number(req.params.doctor_id), connected: false });
}

module.exports = {
  startAuth,
  handleCallback,
  getStatus,
  disconnect,
};
