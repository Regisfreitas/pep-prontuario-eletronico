import { useEffect, useState } from "react";
import { apiUrl } from "../config/api";

export default function ModalEntradaAuto({
  isOpen,
  produto,
  onClose,
  onFinalizar,
}) {
  const [dataEntrada, setDataEntrada] = useState("");
  const [valor, setValor] = useState("");
  const [registrarFinanceiro, setRegistrarFinanceiro] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const quantidade = produto?.saldo_inicial || 0;
  const produtoId = produto?.produto?.id;

  useEffect(() => {
    if (!isOpen) return;
    setDataEntrada(new Date().toISOString().split("T")[0]);
    setValor("");
    setRegistrarFinanceiro(false);
    setError(null);
    setSaving(false);
  }, [isOpen]);

  const handleFinalizar = async () => {
    if (!produtoId) {
      setError("Produto inválido");
      return;
    }
    if (!dataEntrada) {
      setError("Selecione a data da entrada.");
      return;
    }
    if (quantidade <= 0) {
      setError("Quantidade inválida para entrada.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const body = {
        produto_id: produtoId,
        quantidade: quantidade,
        data_entrada: dataEntrada,
        valor: valor ? parseFloat(String(valor).replace(",", ".")) : null,
        registrar_financeiro: registrarFinanceiro,
      };

      const res = await fetch(apiUrl("/api/estoque/entradas"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Erro ao registrar entrada");
      }

      onFinalizar();
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
        data-testid="modal-entrada-auto"
        role="dialog"
        aria-modal="true"
        aria-label="Finalizar Entrada"
      >
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">
            Finalizar Entrada
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl"
            aria-label="Fechar"
          >
            &times;
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <p
            className="text-sm text-slate-600 leading-relaxed"
            data-testid="entrada-auto-mensagem"
          >
            Produto cadastrado com sucesso! Informe os dados para registrar a
            entrada de <strong>{quantidade}</strong> unidade(s) no estoque.
          </p>

          <label className="block">
            <span className="text-xs font-medium text-slate-500 mb-1 block">
              Data *
            </span>
            <input
              data-testid="entrada-auto-data-input"
              type="date"
              value={dataEntrada}
              onChange={(e) => setDataEntrada(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/30"
              required
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-slate-500 mb-1 block">
              Valor (R$)
            </span>
            <input
              data-testid="entrada-auto-valor-input"
              type="text"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/30"
              placeholder="R$ 0,00"
            />
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              data-testid="entrada-auto-registrar-financeiro-checkbox"
              type="checkbox"
              checked={registrarFinanceiro}
              onChange={(e) => setRegistrarFinanceiro(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-600/30"
            />
            <span className="text-sm text-slate-600">
              Registrar esse custo no módulo financeiro
            </span>
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button
              data-testid="btn-cancelar-entrada-auto"
              onClick={onClose}
              className="px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              data-testid="btn-finalizar-entrada-auto"
              onClick={handleFinalizar}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
            >
              {saving && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {saving ? "Registrando..." : "Finalizar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
