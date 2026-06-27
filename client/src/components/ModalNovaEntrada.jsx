import { useEffect, useState } from "react";
import { apiUrl } from "../config/api";

export default function ModalNovaEntrada({
  isOpen,
  onClose,
  onSuccess,
  onProdutoNaoCadastrado,
}) {
  const [step, setStep] = useState("confirm");
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    produto_id: "",
    fornecedor: "",
    quantidade: "",
    data_entrada: "",
    valor: "",
    registrar_financeiro: false,
    lote: "",
    validade: "",
  });

  useEffect(() => {
    if (!isOpen) return;
    setStep("confirm");
    setError(null);
    setSaving(false);
    setForm((f) => ({
      ...f,
      data_entrada: new Date().toISOString().split("T")[0],
      lote: "",
      validade: "",
    }));
    fetch(apiUrl("/api/estoque/produtos"))
      .then((r) => r.json())
      .then((d) => setProdutos(d.produtos || []))
      .catch(() => setProdutos([]));
  }, [isOpen]);

  const setField = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));
  const handleSubmit = async () => {
    if (!form.produto_id || !form.quantidade || Number(form.quantidade) <= 0) {
      setError("Preencha produto e quantidade.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(apiUrl("/api/estoque/entradas"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          quantidade: Number(form.quantidade),
          valor: form.valor
            ? parseFloat(String(form.valor).replace(",", "."))
            : null,
          lote: form.lote || null,
          validade: form.validade || null,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Erro ao registrar entrada");
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
        data-testid="modal-nova-entrada"
        role="dialog"
        aria-modal="true"
        aria-label="Nova Entrada de Estoque"
      >
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold text-slate-800">
            Nova Entrada de Estoque
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl"
            aria-label="Fechar"
          >
            &times;
          </button>
        </div>

        {step === "confirm" && (
          <div className="p-8 space-y-6">
            <p className="text-sm text-slate-600">
              É um produto já cadastrado no sistema?
            </p>
            <div className="flex justify-center gap-4">
              <button
                data-testid="btn-produto-cadastrado-sim"
                onClick={() => setStep("form")}
                className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Sim
              </button>
              <button
                data-testid="btn-produto-cadastrado-nao"
                onClick={() => {
                  onClose();
                  onProdutoNaoCadastrado?.();
                }}
                className="px-6 py-2.5 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Não
              </button>
            </div>
          </div>
        )}

        {step === "cadastrar" && (
          <div className="p-8 space-y-6 text-center">
            <p
              className="text-sm text-slate-600"
              data-testid="msg-cadastrar-produto"
            >
              Você precisa cadastrar o produto antes de registrar uma entrada.
            </p>
            <a
              href="/estoque/produtos/novo"
              data-testid="btn-ir-cadastro-produto"
              className="inline-block px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Ir para Cadastro de Produto
            </a>
            <button
              onClick={onClose}
              className="block mx-auto mt-2 text-sm text-slate-500 hover:text-slate-700"
            >
              Fechar
            </button>
          </div>
        )}

        {step === "form" && (
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
                data-testid="entrada-produto-select"
                value={form.produto_id}
                onChange={(e) => setField("produto_id", e.target.value)}
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
                Fornecedor
              </span>
              <input
                data-testid="entrada-fornecedor-input"
                type="text"
                value={form.fornecedor}
                onChange={(e) => setField("fornecedor", e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/30"
                placeholder="Nome do fornecedor (opcional)"
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="text-xs font-medium text-slate-500 mb-1 block">
                  Quantidade *
                </span>
                <input
                  data-testid="entrada-quantidade-input"
                  type="number"
                  min="1"
                  value={form.quantidade}
                  onChange={(e) => setField("quantidade", e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/30"
                  placeholder="Ex: 10"
                  required
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-500 mb-1 block">
                  Data *
                </span>
                <input
                  data-testid="entrada-data-input"
                  type="date"
                  value={form.data_entrada}
                  onChange={(e) => setField("data_entrada", e.target.value)}
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
                <input
                  data-testid="entrada-lote-input"
                  type="text"
                  value={form.lote}
                  onChange={(e) => setField("lote", e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/30"
                  placeholder="Número do lote (opcional)"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-500 mb-1 block">
                  Validade
                </span>
                <input
                  data-testid="entrada-validade-input"
                  type="date"
                  value={form.validade}
                  onChange={(e) => setField("validade", e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/30"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-xs font-medium text-slate-500 mb-1 block">
                Valor (R$)
              </span>
              <input
                data-testid="entrada-valor-input"
                type="text"
                value={form.valor}
                onChange={(e) => setField("valor", e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/30"
                placeholder="R$ 0,00"
              />
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                data-testid="entrada-registrar-financeiro-checkbox"
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
                data-testid="btn-cancelar-entrada"
                onClick={onClose}
                className="px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                data-testid="btn-registrar-entrada"
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
              >
                {saving && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {saving ? "Registrando..." : "Registrar Entrada"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
