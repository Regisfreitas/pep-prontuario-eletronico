import { useCallback, useEffect, useState } from "react";
import { apiUrl } from "../config/api";
import LoadingSpinner from "../components/patients/LoadingSpinner";
import ModalNovaReceita from "../components/ModalNovaReceita";
import ModalNovaDespesa from "../components/ModalNovaDespesa";

const fmtValor = (v) =>
  `R$ ${Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
const fmtDate = (d) =>
  d ? new Date(d + "T12:00:00").toLocaleDateString("pt-BR") : "—";

export default function ReceitasDespesas() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [tipo, setTipo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [modalReceita, setModalReceita] = useState(false);
  const [modalDespesa, setModalDespesa] = useState(false);

  const carregar = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (dataInicio) params.set("data_inicio", dataInicio);
    if (dataFim) params.set("data_fim", dataFim);
    if (tipo) params.set("tipo", tipo);
    if (categoria) params.set("categoria", categoria);
    try {
      const res = await fetch(apiUrl(`/api/financeiro/transacoes?${params}`));
      const json = await res.json();
      setData(json.data || []);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [dataInicio, dataFim, tipo, categoria]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const totalReceitas = data
    .filter((r) => r.tipo === "receita")
    .reduce((s, r) => s + r.valor, 0);
  const totalDespesas = data
    .filter((r) => r.tipo === "despesa")
    .reduce((s, r) => s + r.valor, 0);
  const saldo = totalReceitas - totalDespesas;

  const empty = !loading && data.length === 0;

  return (
    <div
      id="wrapper"
      className="flex flex-col flex-1 bg-slate-50"
      data-testid="page-financeiro-receitas-despesas"
    >
      {/* Header */}
      <div className="px-8 py-6 bg-white border-b border-slate-200 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-surgical-dark">
          Receitas e Despesas
        </h1>
        <div className="flex gap-3">
          <button
            data-testid="btn-nova-receita"
            onClick={() => setModalReceita(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-sm"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Nova Receita
          </button>
          <button
            data-testid="btn-nova-despesa"
            onClick={() => setModalDespesa(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-sm"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
            </svg>
            Nova Despesa
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-8 py-4 bg-white border-b border-slate-200 flex items-center gap-4 flex-wrap">
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
        <select
          data-testid="filtro-tipo"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/30 bg-white"
        >
          <option value="">Todos</option>
          <option value="receita">Receita</option>
          <option value="despesa">Despesa</option>
        </select>
        <select
          data-testid="filtro-categoria"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/30 bg-white"
        >
          <option value="">Todas as categorias</option>
          {[
            "estoque",
            "aluguel",
            "salario",
            "servico",
            "consulta",
            "exame",
            "outros",
          ].map((c) => (
            <option key={c} value={c}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      <div className="flex-1 p-8">
        {loading ? (
          <LoadingSpinner data-testid="loading-spinner" label="Carregando..." />
        ) : empty ? (
          <div
            data-testid="empty-state"
            className="flex items-center justify-center h-48 text-sm text-slate-500"
          >
            Nenhuma transação encontrada
          </div>
        ) : (
          <>
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-6">
              <table
                data-testid="tabela-transacoes"
                role="table"
                aria-label="Receitas e Despesas"
                className="w-full text-sm"
              >
                <thead>
                  <tr className="bg-surgical-dark text-left">
                    <th
                      className="py-3 px-4 font-medium text-white text-xs uppercase tracking-wider"
                      scope="col"
                    >
                      Data
                    </th>
                    <th
                      className="py-3 px-4 font-medium text-white text-xs uppercase tracking-wider"
                      scope="col"
                    >
                      Tipo
                    </th>
                    <th
                      className="py-3 px-4 font-medium text-white text-xs uppercase tracking-wider"
                      scope="col"
                    >
                      Descrição
                    </th>
                    <th
                      className="py-3 px-4 font-medium text-white text-xs uppercase tracking-wider"
                      scope="col"
                    >
                      Categoria
                    </th>
                    <th
                      className="py-3 px-4 font-medium text-white text-xs uppercase tracking-wider text-right"
                      scope="col"
                    >
                      Valor
                    </th>
                    <th
                      className="py-3 px-4 font-medium text-white text-xs uppercase tracking-wider"
                      scope="col"
                    >
                      Origem
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((r) => (
                    <tr className="border-b border-slate-100 hover:bg-blue-50 transition-colors">
                      <td className="py-3 px-4 text-slate-600">
                        {fmtDate(r.data)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${r.tipo === "receita" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}
                        >
                          {r.tipo === "receita" ? "Receita" : "Despesa"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-800">
                        {r.descricao}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {r.categoria
                          ? r.categoria.charAt(0).toUpperCase() +
                            r.categoria.slice(1)
                          : "—"}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-medium ${r.tipo === "receita" ? "text-emerald-700" : "text-red-700"}`}
                      >
                        {r.tipo === "receita" ? "+" : "-"}
                        {fmtValor(r.valor)}
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-xs">
                        {r.origem}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="card-surgical">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Total Receitas
                </p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  {fmtValor(totalReceitas)}
                </p>
              </div>
              <div className="card-surgical">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Total Despesas
                </p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {fmtValor(totalDespesas)}
                </p>
              </div>
              <div className="card-surgical">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Saldo
                </p>
                <p
                  className={`text-2xl font-bold mt-1 ${saldo >= 0 ? "text-emerald-600" : "text-red-600"}`}
                >
                  {fmtValor(saldo)}
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      <ModalNovaReceita
        isOpen={modalReceita}
        onClose={() => setModalReceita(false)}
        onSuccess={carregar}
      />
      <ModalNovaDespesa
        isOpen={modalDespesa}
        onClose={() => setModalDespesa(false)}
        onSuccess={carregar}
      />
    </div>
  );
}
