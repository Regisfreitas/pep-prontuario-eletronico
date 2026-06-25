import { apiUrl } from '../config/api';

export async function fetchGoogleStatus(doctorId) {
  const res = await fetch(apiUrl(`/api/google/status/${doctorId}`));
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Falha ao verificar conexão Google');
  }
  return res.json();
}

export async function disconnectGoogle(doctorId) {
  const res = await fetch(apiUrl(`/api/google/disconnect/${doctorId}`), { method: 'POST' });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Falha ao desconectar Google Agenda');
  }
  return res.json();
}

/** Usa proxy Vite em dev (/api → :3001). Requer back-end rodando. */
export function getGoogleAuthUrl(doctorId) {
  return apiUrl(`/api/google/auth/${doctorId}`);
}
