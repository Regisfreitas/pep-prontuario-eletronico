import { useCallback, useEffect, useState } from "react";
import { apiUrl } from "../config/api";
import LoadingSpinner from "../components/patients/LoadingSpinner";
import ModalCadastrarProduto from "../components/ModalCadastrarProduto";

const SITUACAO_CLASSES = {
  normal: "bg-emerald-50 text-emerald-700 border-emerald-200",
  baixo: "bg-amber-50 text-amber-700 border-amber-200",
  esgotado: "bg-red-50 text-red-700 border-red-200",
};

const SITUACAO_LABELS = {
  normal: "Normal",
  baixo: "Baixo",
  esgotado: "Esgotado",
};

function fmtDate(d) {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
  return date.toLocaleDateString("pt-BR");
}

export default function ProdutosEstoque() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroSituacao, setFiltroSituacao] = useState("");
  const [modalAberto, setModalAberto] = useState(false);

  const carregar = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (busca.trim()) params.set("busca", busca.trim());
    if (filtroCategoria) params.set("categoria", filtroCategoria);
    if (filtroSituacao) params.set("situacao", filtroSituacao);

    try {
      const res = await fetch(apiUrl(`/api/estoque/produtos?${params}`));
      const data = await res.json();
      setProdutos(data.produtos || []);
    } catch {
      setProdutos([]);
    } finally {
      setLoading(false);
    }
  }, [busca, filtroCategoria, filtroSituacao]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return (
    <div
      id="wrapper"
      className="flex flex-col flex-1 bg-slate-50"
      data-testid="page-estoque-produtos"
    >
      {/* Header */}
      <div className="px-8 py-6 bg-white border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">Produtos</h1>
      </div>

      {/* Filters */}
      <div className="px-8 py-4 bg-white border-b border-slate-200 flex items-center gap-4 flex-wrap">
        <input
          type="text"
          data-testid="filtro-busca"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome ou código"
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/30 bg-white min-w-[220px]"
        />

        <select
          data-testid="filtro-categoria"
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/30 bg-white"
        >
          <option value="">Todas as categorias</option>
          <option value="Medicamento">Medicamento</option>
          <option value="Material de Limpeza">Material de Limpeza</option>
          <option value="Material Cirúrgico">Material Cirúrgico</option>
          <option value="Material de Escritório">Material de Escritório</option>
        </select>

        <select
          data-testid="filtro-situacao"
          value={filtroSituacao}
          onChange={(e) => setFiltroSituacao(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/30 bg-white"
        >
          <option value="">Todas as situações</option>
          <option value="normal">Normal</option>
          <option value="baixo">Baixo</option>
          <option value="esgotado">Esgotado</option>
        </select>

        <div className="ml-auto">
          <button
            type="button"
            data-testid="btn-cadastrar-produto"
            onClick={() => setModalAberto(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors shadow-sm"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Cadastrar Produto
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-8">
        {loading ? (
          <LoadingSpinner
            data-testid="loading-spinner"
            label="Carregando produtos..."
          />
        ) : produtos.length === 0 ? (
          <div
            data-testid="produtos-empty"
            className="flex items-center justify-center h-48 text-sm text-slate-500"
          >
            Nenhum produto cadastrado
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <table
              data-testid="tabela-produtos"
              role="table"
              aria-label="Lista de Produtos"
              className="w-full text-sm"
            >
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">
                  <th
                    className="py-3 px-4 font-semibold text-slate-600"
                    scope="col"
                  >
                    Código
                  </th>
                  <th
                    className="py-3 px-4 font-semibold text-slate-600"
                    scope="col"
                  >
                    Nome
                  </th>
                  <th
                    className="py-3 px-4 font-semibold text-slate-600"
                    scope="col"
                  >
                    Embalagem
                  </th>
                  <th
                    className="py-3 px-4 font-semibold text-slate-600"
                    scope="col"
                  >
                    Lote
                  </th>
                  <th
                    className="py-3 px-4 font-semibold text-slate-600"
                    scope="col"
                  >
                    Vencimento
                  </th>
                  <th
                    className="py-3 px-4 font-semibold text-slate-600"
                    scope="col"
                  >
                    Categoria
                  </th>
                  <th
                    className="py-3 px-4 font-semibold text-slate-600"
                    scope="col"
                  >
                    Fornecedor
                  </th>
                  <th
                    className="py-3 px-4 font-semibold text-slate-600 text-right"
                    scope="col"
                  >
                    Saldo
                  </th>
                  <th
                    className="py-3 px-4 font-semibold text-slate-600"
                    scope="col"
                  >
                    Situação
                  </th>
                </tr>
              </thead>
              <tbody>
                {produtos.map((p) => (
                  <tr
                    key={p.id}
                    data-testid={`produto-row-${p.id}`}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-3 px-4 text-slate-700 font-mono text-xs">
                      {p.codigo || "—"}
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-medium">
                      {p.nome}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {p.embalagem || "—"}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-xs">
                      {p.lote || "—"}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {fmtDate(p.vencimento)}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        {p.categoria || "—"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {p.fornecedor || "—"}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-700 font-medium">
                      {p.saldo_atual}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        data-testid={`produto-situacao-${p.id}`}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          SITUACAO_CLASSES[p.situacao] ||
                          SITUACAO_CLASSES.normal
                        }`}
                      >
                        {SITUACAO_LABELS[p.situacao] || "Normal"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ModalCadastrarProduto
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        onSuccess={carregar}
      />
    </div>
  );
}
