import { useState } from 'react';

export default function CrmConnectModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({ api_key: '', subdomain: '' });
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
      setForm({ api_key: '', subdomain: '' });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">Conectar CRM Kommo</h2>
          <p className="text-sm text-slate-500 mt-1">
            Informe as credenciais da sua conta Kommo.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <label className="block">
            <span className="text-sm font-medium text-slate-700 mb-1 block">API Key</span>
            <input
              data-testid="crm-api-key-input"
              type="password"
              required
              value={form.api_key}
              onChange={set('api_key')}
              className={inputCls}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700 mb-1 block">Subdomínio</span>
            <input
              data-testid="crm-subdomain-input"
              type="text"
              required
              placeholder="minha-clinica"
              value={form.subdomain}
              onChange={set('subdomain')}
              className={inputCls}
            />
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg"
              aria-label="Cancelar conexão com Kommo"
            >
              Cancelar
            </button>
            <button
              type="submit"
              data-testid="btn-save-crm"
              disabled={saving}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg"
              aria-label="Salvar credenciais do Kommo"
            >
              {saving ? 'Conectando...' : 'Conectar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputCls =
  'w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/30 focus:border-brand-600';
