import { useState } from 'react';
import { formatDateISO } from '../../api/agenda';

const MEDICOS = [
  { id: 1, nome: 'Dr. Marco Silva' },
  { id: 2, nome: 'teste Dr' },
  { id: 3, nome: 'Dra. Ana Costa' },
];

const REPETICOES = [
  { id: 'UNICO', label: 'Único' },
  { id: 'PERIODO', label: 'Período (diário)' },
  { id: 'SEMANAL', label: 'Semanal' },
  { id: 'MENSAL', label: 'Mensal' },
];

export default function BloqueioModal({ open, onClose, onSubmit, defaultDate }) {
  const [form, setForm] = useState({
    doctor_id: 1,
    motivo_bloqueio: 'Horário bloqueado',
    data_inicio: defaultDate ? formatDateISO(defaultDate) : '2026-06-16',
    data_limite: '2026-06-20',
    hora_inicio: '00:01',
    hora_fim: '23:59',
    tipo_repeticao: 'UNICO',
  });
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (payload.tipo_repeticao === 'UNICO') {
        delete payload.data_limite;
      }
      await onSubmit(payload);
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
          <h2 className="text-lg font-bold text-slate-800">Bloquear Período</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Field label="Médico">
            <select value={form.doctor_id} onChange={set('doctor_id')} className={inputCls}>
              {MEDICOS.map((m) => (
                <option key={m.id} value={m.id}>{m.nome}</option>
              ))}
            </select>
          </Field>

          <Field label="Motivo">
            <input
              type="text"
              value={form.motivo_bloqueio}
              onChange={set('motivo_bloqueio')}
              className={inputCls}
              required
            />
          </Field>

          <Field label="Repetição">
            <select value={form.tipo_repeticao} onChange={set('tipo_repeticao')} className={inputCls}>
              {REPETICOES.map((r) => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Data início">
              <input type="date" value={form.data_inicio} onChange={set('data_inicio')} className={inputCls} required />
            </Field>
            {form.tipo_repeticao !== 'UNICO' && (
              <Field label="Data limite">
                <input type="date" value={form.data_limite} onChange={set('data_limite')} className={inputCls} required />
              </Field>
            )}
          </div>

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
              disabled={saving}
              className="px-5 py-2 text-sm font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-60"
            >
              {saving ? 'Bloqueando...' : 'Bloquear'}
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

const inputCls = 'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-600/30';
