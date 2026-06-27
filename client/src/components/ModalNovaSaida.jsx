import { useCallback, useEffect, useState } from "react";
import { apiUrl } from "../config/api";

export default function ModalNovaSaida({ isOpen, onClose, onSuccess }) {
  const [produtos, setProdutos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    produto_id: "",
    paciente_id: "",
    quantidade: "",
    data_saida: "",
    valor: "",
    registrar_financeiro: false,
    lote: "",
    validade: "",
  });

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setSaving(false);
    setForm((f) => ({
      ...f,
      data_saida: new Date().toISOString().split("T")[0],
      lote: "",
      validade: "",
    }));
    setLotes([]);
    fetch(apiUrl("/api/estoque/produtos"))
      .then((r) => r.json())
      .then((d) => setProdutos(d.produtos || []))
      .catch(() => setProdutos([]));
    fetch(apiUrl("/api/patients"))
      .then((r) => r.json())
      .then((d) => setPacientes(d.patients || []))
      .catch(() => setPacientes([]));
  }, [isOpen]);

  // Fetch lotes when produto changes
  const carregarLotes = useCallback(async (produtoId) => {
    if (!produtoId) {
      setLotes([]);
      return;
    }
    try {
      const res = await fetch(
        apiUrl(`/api/estoque/lotes?produto_id=${produtoId}`),
      );
      const data = await res.json();
      setLotes(data.lotes || []);
    } catch {
      setLotes([]);
    }
  }, []);

  const setField = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleProdutoChange = (produtoId) => {
    setField("produto_id", produtoId);
    setField("lote", "");
    setField("validade", "");
    carregarLotes(produtoId);
  };

  const handleLoteChange = (lote) => {
    setField("lote", lote);
    // Auto-fill validade from selected lote
    const loteData = lotes.find((l) => l.lote === lote);
    setField("validade", loteData?.validade || "");
  };

  const handleSubmit = async () => {
    if (!form.produto_id) {
      setError("Selecione um produto.");
      return;
    }
    if (!form.quantidade || Number(form.quantidade) <= 0) {
      setError("Informe uma quantidade maior que zero.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(apiUrl("/api/estoque/saidas"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          produto_id: form.produto_id,
          paciente_id: form.paciente_id || null,
          quantidade: Number(form.quantidade),
          data_saida: form.data_saida,
          valor: form.valor
            ? parseFloat(String(form.valor).replace(",", "."))
            : null,
          registrar_financeiro: form.registrar_financeiro,
          lote: form.lote || null,
          validade: form.validade || null,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Erro ao registrar saída");
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
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col"
        data-testid="modal-nova-saida"
        role="dialog"
        aria-modal="true"
        aria-label="Nova Saída de Estoque"
      >
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold text-slate-800">
            Nova Saída de Estoque
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl"
            aria-label="Fechar"
          >
            &times;
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <label className="block">
            <span className="text-xs font-medium text-slate-500 mb-1 block">
              Produto *
            </span>
            <select
              data-testid="saida-produto-select"
              value={form.produto_id}
              onChange={(e) => handleProdutoChange(e.target.value)}
              required
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/30"
            >
              <option value="">Selecione um produto...</option>
              {produtos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome} (Saldo: {p.saldo_atual})
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-medium text-slate-500 mb-1 block">
              Paciente
            </span>
            <select
              data-testid="saida-paciente-select"
              value={form.paciente_id}
              onChange={(e) => setField("paciente_id", e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/30"
            >
              <option value="">Selecione um paciente...</option>
              {pacientes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name}
                  {p.birth_date ? ` · ${p.birth_date}` : ""}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-medium text-slate-500 mb-1 block">
                Quantidade *
              </span>
              <input
                data-testid="saida-quantidade-input"
                type="number"
                min="1"
                value={form.quantidade}
                onChange={(e) => setField("quantidade", e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/30"
                placeholder="Ex: 5"
                required
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-500 mb-1 block">
                Data *
              </span>
              <input
                data-testid="saida-data-input"
                type="date"
                value={form.data_saida}
                onChange={(e) => setField("data_saida", e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/30"
                required
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-medium text-slate-500 mb-1 block">
                Lote
              </span>
              <select
                data-testid="saida-lote-select"
                value={form.lote}
                onChange={(e) => handleLoteChange(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/30"
              >
                <option value="">Selecione um lote...</option>
                {lotes.map((l) => (
                  <option key={l.lote} value={l.lote}>
                    {l.lote} (Saldo: {l.saldo})
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-500 mb-1 block">
                Validade
              </span>
              <input
                data-testid="saida-validade-input"
                type="date"
                value={form.validade}
                readOnly
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-medium text-slate-500 mb-1 block">
              Valor (R$)
            </span>
            <input
              data-testid="saida-valor-input"
              type="text"
              value={form.valor}
              onChange={(e) => setField("valor", e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/30"
              placeholder="R$ 0,00"
            />
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              data-testid="saida-registrar-financeiro-checkbox"
              type="checkbox"
              checked={form.registrar_financeiro}
              onChange={(e) =>
                setField("registrar_financeiro", e.target.checked)
              }
              className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-600/30"
            />
            <span className="text-sm text-slate-600">
              Registrar Valor no Módulo Financeiro
            </span>
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button
              data-testid="btn-cancelar-saida"
              onClick={onClose}
              className="px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              data-testid="btn-registrar-saida"
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
            >
              {saving && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {saving ? "Registrando..." : "Registrar Saída"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
