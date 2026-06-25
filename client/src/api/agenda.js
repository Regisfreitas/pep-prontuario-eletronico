const API = '/api/agenda';

export async function fetchAgenda({ startDate, endDate, clinicId, doctorId }) {
  const params = new URLSearchParams({
    startDate,
    endDate,
    clinic_id: String(clinicId),
  });
  if (doctorId) params.set('doctor_id', String(doctorId));

  const res = await fetch(`${API}?${params}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Falha ao carregar agenda');
  }
  return res.json();
}

export async function createConsulta(payload) {
  const res = await fetch(`${API}/consulta`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Falha ao agendar consulta');
  return data;
}

export async function createBloqueio(payload) {
  const res = await fetch(`${API}/bloqueio`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Falha ao bloquear período');
  return data;
}

export function eventToCalendar(event) {
  const start = new Date(`${event.data_evento}T${event.hora_inicio}`);
  const end = new Date(`${event.data_evento}T${event.hora_fim}`);
  return {
    id: event.id,
    title: buildEventTitle(event),
    start,
    end,
    resource: event,
  };
}

function buildEventTitle(event) {
  if (event.tipo_evento === 'BLOQUEIO') {
    return `${event.motivo_bloqueio} ${event.hora_inicio.slice(0, 5)} - ${event.hora_fim.slice(0, 5)}`;
  }
  const nome = event.paciente_nome ?? `Paciente #${event.paciente_id}`;
  return `${nome} ${event.hora_inicio.slice(0, 5)} - ${event.hora_fim.slice(0, 5)}`;
}

export function formatDateISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
