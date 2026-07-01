import { useEffect, useState } from "react";
import { apiUrl } from "../config/api";

const CATEGORIAS = ["estoque", "servico", "consulta", "exame", "outros"];

export default function ModalNovaReceita({ isOpen, onClose, onSuccess }) {
  const [pacientes, setPacientes] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ descricao: "", valor: "", data: "", categoria: "outros", paciente_id: "" });

  useEffect(() => {
    if (!isOpen) return;
    setError(null); setSaving(false);
    setForm({ descricao: "", valor: "", data: new Date().toISOString().split("T")[0], categoria: "outros", paciente_id: "" });
    fetch(apiUrl("/api/patients")).then(r => r.json()).then(d => setPacientes(d.patients || [])).catch(() => setPacientes([]));
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.descricao.trim() || !form.valor || Number(form.valor) <= 0) {
      setError("Preencha descrição e valor.");
      return;
    }
    setSaving(true); setError(null);
    try {
      const res = await fetch(apiUrl("/api/financeiro/receitas"), {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          descricao: form.descricao.trim(),
          valor: Number(form.valor),
          data: form.data,
          categoria: form.categoria,
          paciente_id: form.paciente_id || null,
        }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || "Erro ao criar receita"); }
      onSuccess(); onClose();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md" data-testid="modal-nova-receita" role="dialog" aria-modal="true" aria-label="Nova Receita">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Nova Receita</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</div>}
          <label className="block">
            <span className="text-xs font-medium text-slate-500 mb-1 block">Descrição *</span>
            <input data-testid="receita-descricao-input" type="text" value={form.descricao} onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/30" placeholder="Descrição da receita" required />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-medium text-slate-500 mb-1 block">Valor (R$) *</span>
              <input data-testid="receita-valor-input" type="number" step="0.01" min="0.01" value={form.valor} onChange={e => setForm(p => ({ ...p, valor: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/30" placeholder="0,00" required />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-500 mb-1 block">Data *</span>
              <input data-testid="receita-data-input" type="date" value={form.data} onChange={e => setForm(p => ({ ...p, data: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/30" required />
            </label>
          </div>
          <label className="block">
            <span className="text-xs font-medium text-slate-500 mb-1 block">Categoria</span>
            <select data-testid="receita-categoria-select" value={form.categoria} onChange={e => setForm(p => ({ ...p, categoria: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/30">
              {CATEGORIAS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-500 mb-1 block">Paciente</span>
            <select data-testid="receita-paciente-select" value={form.paciente_id} onChange={e => setForm(p => ({ ...p, paciente_id: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/30">
              <option value="">Nenhum</option>
              {pacientes.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
            </select>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">Cancelar</button>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm">
              {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
