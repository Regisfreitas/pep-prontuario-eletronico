import { useCallback, useEffect, useState } from "react";
import { apiUrl } from "../config/api";
import LoadingSpinner from "../components/patients/LoadingSpinner";
import ModalNovaEntrada from "../components/ModalNovaEntrada";

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

export default function MovimentacoesEstoque() {
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroProduto, setFiltroProduto] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [modalEntradaAberto, setModalEntradaAberto] = useState(false);

  const carregar = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filtroTipo) params.set("tipo", filtroTipo);
    if (filtroProduto) params.set("produto_id", filtroProduto);
    if (dataInicio) params.set("data_inicio", dataInicio);
    if (dataFim) params.set("data_fim", dataFim);

    try {
      const res = await fetch(apiUrl(`/api/estoque/movimentacoes?${params}`));
      const data = await res.json();
      setMovimentacoes(data.movimentacoes || []);
    } catch {
      setMovimentacoes([]);
    } finally {
      setLoading(false);
    }
  }, [filtroTipo, filtroProduto, dataInicio, dataFim]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Extrair lista única de produtos para o filtro
  const produtos = [
    ...new Map(
      movimentacoes.map((m) => [
        m.produto_id,
        { id: m.produto_id, nome: m.produto_nome },
      ]),
    ).values(),
  ];

  return (
    <div
      id="wrapper"
      className="flex flex-col flex-1 bg-slate-50"
      data-testid="page-estoque-movimentacoes"
    >
      {/* Header */}
      <div className="px-8 py-6 bg-white border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">
          Movimentações de Estoque
        </h1>
      </div>

      {/* Filters */}
      <div className="px-8 py-4 bg-white border-b border-slate-200 flex items-center gap-4 flex-wrap">
        <select
          data-testid="filtro-tipo"
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/30 bg-white"
        >
          <option value="">Todos os tipos</option>
          <option value="entrada">Entrada</option>
          <option value="saida">Saída</option>
        </select>

        <select
          data-testid="filtro-produto"
          value={filtroProduto}
          onChange={(e) => setFiltroProduto(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/30 bg-white min-w-[180px]"
        >
          <option value="">Todos os produtos</option>
          {produtos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </select>

        <input
          type="date"
          data-testid="filtro-data-inicio"
          value={dataInicio}
          onChange={(e) => setDataInicio(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/30"
        />
        <span className="text-sm text-slate-400">até</span>

        <input
          type="date"
          data-testid="filtro-data-fim"
          value={dataFim}
          onChange={(e) => setDataFim(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/30"
        />

        <div className="flex items-center gap-3 ml-auto">
          <button
            type="button"
            onClick={() => setModalEntradaAberto(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-sm"
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
            Nova Entrada
          </button>
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-sm"
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
                d="M20 12H4"
              />
            </svg>
            Nova Saída
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-8">
        {loading ? (
          <LoadingSpinner
            data-testid="loading-spinner"
            label="Carregando movimentações..."
          />
        ) : movimentacoes.length === 0 ? (
          <div
            data-testid="movimentacoes-empty"
            className="flex items-center justify-center h-48 text-sm text-slate-500"
          >
            Nenhuma movimentação encontrada
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <table
              data-testid="tabela-movimentacoes"
              role="table"
              aria-label="Movimentações de Estoque"
              className="w-full text-sm"
            >
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">
                  <th className="py-3 px-4 font-semibold text-slate-600">
                    Produto
                  </th>
                  <th className="py-3 px-4 font-semibold text-slate-600">
                    Tipo
                  </th>
                  <th className="py-3 px-4 font-semibold text-slate-600 text-right">
                    Quantidade
                  </th>
                  <th className="py-3 px-4 font-semibold text-slate-600 text-right">
                    Saldo Atual
                  </th>
                  <th className="py-3 px-4 font-semibold text-slate-600">
                    Situação
                  </th>
                  <th className="py-3 px-4 font-semibold text-slate-600">
                    Data
                  </th>
                  <th className="py-3 px-4 font-semibold text-slate-600">
                    Observação
                  </th>
                </tr>
              </thead>
              <tbody>
                {movimentacoes.map((m) => (
                  <tr
                    key={m.id}
                    data-testid={`movimentacao-row-${m.id}`}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-3 px-4 text-slate-800 font-medium">
                      {m.produto_nome}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          m.tipo === "entrada"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {m.tipo === "entrada" ? "Entrada" : "Saída"}
                      </span>
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-medium ${m.tipo === "entrada" ? "text-emerald-700" : "text-red-700"}`}
                    >
                      {m.tipo === "entrada" ? "+" : "-"}
                      {m.quantidade}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-700 font-medium">
                      {m.saldo_apos_movimentacao}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        data-testid={`movimentacao-situacao-${m.id}`}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          SITUACAO_CLASSES[m.situacao_produto] ||
                          SITUACAO_CLASSES.normal
                        }`}
                      >
                        {SITUACAO_LABELS[m.situacao_produto] || "Normal"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {fmtDate(m.data_movimentacao)}
                    </td>
                    <td
                      className="py-3 px-4 text-slate-500 max-w-[200px] truncate"
                      title={m.observacao || ""}
                    >
                      {m.observacao || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ModalNovaEntrada
        isOpen={modalEntradaAberto}
        onClose={() => setModalEntradaAberto(false)}
        onSuccess={carregar}
      />
    </div>
  );
}
