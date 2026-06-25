import { apiUrl } from '../config/api';

export async function fetchMemedToken(doctorId) {
  const res = await fetch(apiUrl(`/api/integrations/memed/token?doctor_id=${doctorId}`));
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Falha ao obter token Memed');
  }
  return res.json();
}

export function getMemedScriptUrl() {
  return (
    import.meta.env.VITE_MEMED_SCRIPT_URL ||
    'https://integrations.memed.com.br/modulos/plataforma.sinapse-prescricao/build/sinapse-prescricao.min.js'
  );
}
