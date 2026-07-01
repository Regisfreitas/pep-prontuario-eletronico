import { useEffect, useRef, useState } from "react";
import { apiUrl } from "../config/api";

const TIPOS = [
  { value: "consulta", label: "Consulta" },
  { value: "soroterapia", label: "Soroterapia" },
  { value: "aplicacao", label: "Aplicação" },
  { value: "procedimento", label: "Procedimento" },
  { value: "sala", label: "Sala" },
  { value: "outro", label: "Outro" },
];

const CORES = ["#3B82F6", "#14B8A6", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16"];

export default function ModalNovaAgenda({ isOpen, onClose, onSuccess }) {
  const nomeRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ nome: "", descricao: "", tipo: "", cor: "#3B82F6" });

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setSaving(false);
    setForm({ nome: "", descricao: "", tipo: "", cor: "#3B82F6" });
    setTimeout(() => nomeRef.current?.focus(), 100);
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nome.trim()) {
      setError("Informe o nome da agenda.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(apiUrl("/api/agendas"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome.trim(),
          descricao: form.descricao.trim() || null,
          tipo: form.tipo || null,
          cor: form.cor,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Erro ao criar agenda");
      }
      onSuccess();
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md"
        data-testid="modal-nova-agenda"
        role="dialog"
        aria-modal="true"
        aria-label="Nova Agenda"
      >
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-surgical-dark">Nova Agenda</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl"
            aria-label="Fechar"
          >
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <label className="block">
            <span className="text-xs font-medium text-slate-500 mb-1 block">
              Nome *
            </span>
            <input
              ref={nomeRef}
              data-testid="agenda-nome-input"
              type="text"
              value={form.nome}
              onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-surgical-blue/30"
              placeholder="Ex: Sala 1"
              required
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-slate-500 mb-1 block">
              Descrição
            </span>
            <textarea
              data-testid="agenda-descricao-input"
              value={form.descricao}
              onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-surgical-blue/30 resize-none"
              placeholder="Descrição opcional"
              rows={2}
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-medium text-slate-500 mb-1 block">
                Tipo
              </span>
              <select
                data-testid="agenda-tipo-select"
                value={form.tipo}
                onChange={(e) => setForm((p) => ({ ...p, tipo: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-surgical-blue/30"
              >
                <option value="">Selecione um tipo</option>
                {TIPOS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-500 mb-1 block">
                Cor
              </span>
              <div className="flex items-center gap-2">
                <input
                  data-testid="agenda-cor-input"
                  type="color"
                  value={form.cor}
                  onChange={(e) => setForm((p) => ({ ...p, cor: e.target.value }))}
                  className="w-10 h-10 p-0.5 border border-slate-200 rounded-lg cursor-pointer"
                />
                <div className="flex gap-1">
                  {CORES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, cor: c }))}
                      className={`w-5 h-5 rounded-full border-2 transition-all ${
                        form.cor === c ? "border-surgical-dark scale-125" : "border-transparent"
                      }`}
                      style={{ backgroundColor: c }}
                      aria-label={`Cor ${c}`}
                    />
                  ))}
                </div>
              </div>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              data-testid="btn-cancelar-agenda"
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              data-testid="btn-salvar-agenda"
              type="submit"
              disabled={saving}
              className="btn-primary"
            >
              {saving && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block mr-2" />
              )}
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
