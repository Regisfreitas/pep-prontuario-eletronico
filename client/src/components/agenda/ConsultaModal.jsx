import { useEffect, useState } from 'react';
import { formatDateISO } from '../../api/agenda';
import { fetchPatients } from '../../api/patients';

const MEDICOS = [
  { id: 1, nome: 'Dr. Marco Silva' },
  { id: 2, nome: 'teste Dr' },
  { id: 3, nome: 'Dra. Ana Costa' },
];

export default function ConsultaModal({ open, onClose, onSubmit, defaultDate }) {
  const [pacientes, setPacientes] = useState([]);
  const [form, setForm] = useState({
    doctor_id: 1,
    paciente_id: '',
    data_evento: defaultDate ? formatDateISO(defaultDate) : '2026-06-16',
    hora_inicio: '10:00',
    hora_fim: '10:30',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    fetchPatients()
      .then((data) => {
        const list = data.patients ?? [];
        setPacientes(list);
        if (list.length > 0) {
          setForm((f) => ({ ...f, paciente_id: f.paciente_id || list[0].id }));
        }
      })
      .catch(() => setPacientes([]));
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({ ...form, clinic_id: 1 });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">Novo Agendamento</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Field label="Médico">
            <select value={form.doctor_id} onChange={set('doctor_id')} className={inputCls}>
              {MEDICOS.map((m) => (
                <option key={m.id} value={m.id}>{m.nome}</option>
              ))}
            </select>
          </Field>

          <Field label="Paciente">
            <select
              value={form.paciente_id}
              onChange={set('paciente_id')}
              className={inputCls}
              required
              disabled={pacientes.length === 0}
            >
              {pacientes.length === 0 ? (
                <option value="">Nenhum paciente cadastrado</option>
              ) : (
                pacientes.map((p) => (
                  <option key={p.id} value={p.id}>{p.full_name}</option>
                ))
              )}
            </select>
          </Field>

          <Field label="Data">
            <input type="date" value={form.data_evento} onChange={set('data_evento')} className={inputCls} required />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Início">
              <input type="time" value={form.hora_inicio} onChange={set('hora_inicio')} className={inputCls} required />
            </Field>
            <Field label="Fim">
              <input type="time" value={form.hora_fim} onChange={set('hora_fim')} className={inputCls} required />
            </Field>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || pacientes.length === 0}
              className="px-5 py-2 text-sm font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-60"
            >
              {saving ? 'Salvando...' : 'Agendar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-500 mb-1 block">{label}</span>
      {children}
    </label>
  );
}

const inputCls = 'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/30';
