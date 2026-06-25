import { apiUrl } from '../config/api';

async function parseResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Erro na requisição');
  }
  return data;
}

export function fetchPatients() {
  return fetch(apiUrl('/api/patients')).then(parseResponse);
}

export function fetchPatientById(id) {
  return fetch(apiUrl(`/api/patients/${id}`)).then(parseResponse);
}

export function createPatient(payload) {
  return fetch(apiUrl('/api/patients'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then(parseResponse);
}

export function connectKommo({ api_key, subdomain }) {
  return fetch(apiUrl('/api/integrations/kommo/connect'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key, subdomain }),
  }).then(parseResponse);
}
