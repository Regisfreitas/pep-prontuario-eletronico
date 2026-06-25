/**
 * Em dev, deixe vazio para usar o proxy do Vite (/api → localhost:3001).
 * Só defina VITE_API_BASE_URL se o proxy não funcionar no seu ambiente.
 */
export const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export function apiUrl(path) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return API_BASE ? `${API_BASE}${normalized}` : normalized;
}

export async function checkBackendHealth() {
  try {
    const res = await fetch(apiUrl('/api/health'), {
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.ok === true;
  } catch {
    return false;
  }
}
