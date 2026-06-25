import { useState } from 'react';

export default function PatientFormModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({
    full_name: '',
    birth_date: '',
    email: '',
    phone: '',
    document: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  if (!open) return null;

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSubmit(form);
      setForm({ full_name: '', birth_date: '', email: '', phone: '', document: '' });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Cadastrar Novo Paciente</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
            aria-label="Fechar modal de cadastro"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <Field label="Nome completo">
            <input
              data-testid="patient-name-input"
              type="text"
              required
              value={form.full_name}
              onChange={set('full_name')}
              className={inputCls}
            />
          </Field>

          <Field label="Data de nascimento">
            <input
              data-testid="patient-birth-date-input"
              type="date"
              required
              value={form.birth_date}
              onChange={set('birth_date')}
              className={inputCls}
            />
          </Field>

          <Field label="E-mail">
            <input
              data-testid="patient-email-input"
              type="email"
              value={form.email}
              onChange={set('email')}
              className={inputCls}
            />
          </Field>

          <Field label="Telefone">
            <input
              data-testid="patient-phone-input"
              type="tel"
              value={form.phone}
              onChange={set('phone')}
              className={inputCls}
            />
          </Field>

          <Field label="CPF">
            <input
              data-testid="patient-document-input"
              type="text"
              value={form.document}
              onChange={set('document')}
              className={inputCls}
            />
          </Field>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg"
              aria-label="Cancelar cadastro de paciente"
            >
              Cancelar
            </button>
            <button
              type="submit"
              data-testid="btn-save-patient"
              disabled={saving}
              className="px-5 py-2 bg-medical-600 hover:bg-medical-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg"
              aria-label="Salvar paciente"
            >
              {saving ? 'Salvando...' : 'Salvar Paciente'}
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
      <span className="text-sm font-medium text-slate-700 mb-1 block">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  'w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-600/30 focus:border-medical-600';
