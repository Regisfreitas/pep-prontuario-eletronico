import { useEffect, useRef, useState } from "react";
import { apiUrl } from "../config/api";

const CATEGORIAS = [
  "Medicamento",
  "Material Cirúrgico",
  "Material de Limpeza",
  "Material de Escritório",
  "Outro",
];

export default function ModalCadastrarProduto({
  isOpen,
  onClose,
  onSuccess,
  onProductCreated,
}) {
  const nomeRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [form, setForm] = useState({
    codigo: "",
    nome: "",
    descricao: "",
    embalagem: "",
    categoria: "",
    fornecedor: "",
    lote: "",
    vencimento: "",
    saldo_inicial: "",
    saldo_minimo: "1",
    saldo_ideal: "",
  });

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setFieldErrors({});
    setSaving(false);
    setForm({
      codigo: "",
      nome: "",
      descricao: "",
      embalagem: "",
      categoria: "",
      fornecedor: "",
      lote: "",
      vencimento: "",
      saldo_inicial: "",
      saldo_minimo: "1",
      saldo_ideal: "",
    });
    setTimeout(() => nomeRef.current?.focus(), 100);
  }, [isOpen]);

  const setField = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    // Validate
    if (!form.nome.trim()) {
      setError("Preencha o nome do produto.");
      return;
    }
    if (!form.embalagem.trim()) {
      setError("Preencha a embalagem.");
      return;
    }
    if (!form.categoria) {
      setError("Selecione uma categoria.");
      return;
    }
    if (Number(form.saldo_minimo) < 0) {
      setError("Estoque mínimo deve ser maior ou igual a zero.");
      return;
    }

    setSaving(true);
    setError(null);
    setFieldErrors({});

    try {
      const res = await fetch(apiUrl("/api/estoque/produtos"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo: form.codigo.trim() || null,
          nome: form.nome.trim(),
          descricao: form.descricao.trim() || null,
          embalagem: form.embalagem.trim(),
          categoria: form.categoria,
          fornecedor: form.fornecedor.trim() || null,
          lote: form.lote.trim() || null,
          vencimento: form.vencimento || null,
          saldo_inicial: form.saldo_inicial ? Number(form.saldo_inicial) : 0,
          saldo_minimo: form.saldo_minimo ? Number(form.saldo_minimo) : 1,
          saldo_ideal: form.saldo_ideal ? Number(form.saldo_ideal) : null,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        if (d.error === "Código já existe") {
          setFieldErrors({ codigo: d.error });
        }
        throw new Error(d.error || "Erro ao cadastrar produto");
      }
      const data = await res.json();
      if (onProductCreated) {
        const saldoInicial = form.saldo_inicial
          ? Number(form.saldo_inicial)
          : 0;
        onProductCreated({ produto: data, saldo_inicial: saldoInicial });
        onClose();
      } else {
        onSuccess?.();
        onClose();
      }
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
        data-testid="modal-cadastrar-produto"
        role="dialog"
        aria-modal="true"
        aria-label="Cadastrar Produto"
      >
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold text-slate-800">
            Cadastrar Produto
          </h2>
          <button
            data-testid="btn-fechar-modal-cadastro-produto"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl"
            aria-label="Fechar"
          >
            &times;
          </button>
        </div>

        <form
          data-testid="form-cadastro-produto"
          className="p-6 space-y-4 overflow-y-auto"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-medium text-slate-500 mb-1 block">
                Código
              </span>
              <input
                data-testid="produto-codigo-input"
                type="text"
                value={form.codigo}
                onChange={(e) => {
                  setField("codigo", e.target.value);
                  setFieldErrors((prev) => ({ ...prev, codigo: null }));
                }}
                className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/30 ${
                  fieldErrors.codigo ? "border-red-400" : "border-slate-200"
                }`}
                placeholder="Ex: MED001"
              />
              {fieldErrors.codigo && (
                <p className="text-xs text-red-500 mt-1">
                  {fieldErrors.codigo}
                </p>
              )}
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-500 mb-1 block">
                Nome *
              </span>
              <input
                ref={nomeRef}
                data-testid="produto-nome-input"
                type="text"
                value={form.nome}
                onChange={(e) => setField("nome", e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/30"
                placeholder="Nome do produto"
                required
              />
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-medium text-slate-500 mb-1 block">
              Descrição
            </span>
            <textarea
              data-testid="produto-descricao-input"
              value={form.descricao}
              onChange={(e) => setField("descricao", e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/30 resize-none"
              placeholder="Descrição do produto"
              rows={2}
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-medium text-slate-500 mb-1 block">
                Embalagem *
              </span>
              <input
                data-testid="produto-embalagem-input"
                type="text"
                value={form.embalagem}
                onChange={(e) => setField("embalagem", e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/30"
                placeholder="Ex: Frasco 20ml"
                required
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-500 mb-1 block">
                Categoria *
              </span>
              <select
                data-testid="produto-categoria-select"
                value={form.categoria}
                onChange={(e) => setField("categoria", e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/30"
                required
              >
                <option value="">Selecione a categoria</option>
                {CATEGORIAS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-medium text-slate-500 mb-1 block">
              Fornecedor
            </span>
            <input
              data-testid="produto-fornecedor-input"
              type="text"
              value={form.fornecedor}
              onChange={(e) => setField("fornecedor", e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/30"
              placeholder="Nome do fornecedor"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-medium text-slate-500 mb-1 block">
                Lote
              </span>
              <input
                data-testid="produto-lote-input"
                type="text"
                value={form.lote}
                onChange={(e) => setField("lote", e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/30"
                placeholder="Número do lote"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-500 mb-1 block">
                Vencimento
              </span>
              <input
                data-testid="produto-vencimento-input"
                type="date"
                value={form.vencimento}
                onChange={(e) => setField("vencimento", e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/30"
              />
            </label>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <label className="block">
              <span className="text-xs font-medium text-slate-500 mb-1 block">
                Saldo Inicial
              </span>
              <input
                data-testid="produto-saldo-inicial-input"
                type="number"
                min="0"
                value={form.saldo_inicial}
                onChange={(e) => setField("saldo_inicial", e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/30"
                placeholder="0"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-500 mb-1 block">
                Estoque Mínimo *
              </span>
              <input
                data-testid="produto-estoque-minimo-input"
                type="number"
                min="0"
                value={form.saldo_minimo}
                onChange={(e) => setField("saldo_minimo", e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/30"
                placeholder="Ex: 5"
                required
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-500 mb-1 block">
                Estoque Ideal
              </span>
              <input
                data-testid="produto-estoque-ideal-input"
                type="number"
                min="0"
                value={form.saldo_ideal}
                onChange={(e) => setField("saldo_ideal", e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/30"
                placeholder="Ex: 20"
              />
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              data-testid="btn-cancelar-cadastro-produto"
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              data-testid="btn-salvar-produto"
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
            >
              {saving && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {saving ? "Salvando..." : "Salvar Produto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
