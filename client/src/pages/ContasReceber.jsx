import { useCallback, useEffect, useState } from "react";
import { apiUrl } from "../config/api";
import LoadingSpinner from "../components/patients/LoadingSpinner";
import ModalNovaReceita from "../components/ModalNovaReceita";

const fmtValor = (v) =>
  `R$ ${Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
const fmtDate = (d) =>
  d ? new Date(d + "T12:00:00").toLocaleDateString("pt-BR") : "—";

export default function ContasReceber() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [categoria, setCategoria] = useState("");
  const [modalAberto, setModalAberto] = useState(false);

  const carregar = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (dataInicio) params.set("data_inicio", dataInicio);
    if (dataFim) params.set("data_fim", dataFim);
    if (categoria) params.set("categoria", categoria);
    try {
      const res = await fetch(apiUrl(`/api/financeiro/receitas?${params}`));
      const json = await res.json();
      setData(json.data || []);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [dataInicio, dataFim, categoria]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const empty = !loading && data.length === 0;

  return (
    <div
      id="wrapper"
      className="flex flex-col flex-1 bg-slate-50"
      data-testid="page-financeiro-contas-receber"
    >
      <div className="px-8 py-6 bg-white border-b border-slate-200 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-surgical-dark">
          Contas a Receber
        </h1>
        <button
          data-testid="btn-nova-receita"
          onClick={() => setModalAberto(true)}
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
      </div>

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
          data-testid="filtro-categoria"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/30 bg-white"
        >
          <option value="">Todas as categorias</option>
          {["estoque", "servico", "consulta", "exame", "outros"].map((c) => (
            <option key={c} value={c}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 p-8">
        {loading ? (
          <LoadingSpinner data-testid="loading-spinner" label="Carregando..." />
        ) : empty ? (
          <div
            data-testid="empty-state"
            className="flex items-center justify-center h-48 text-sm text-slate-500"
          >
            Nenhuma receita encontrada
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <table
              data-testid="tabela-receitas"
              role="table"
              aria-label="Contas a Receber"
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
                    Descrição
                  </th>
                  <th
                    className="py-3 px-4 font-medium text-white text-xs uppercase tracking-wider"
                    scope="col"
                  >
                    Paciente
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
                </tr>
              </thead>
              <tbody>
                {data.map((r) => (
                  <tr className="border-b border-slate-100 hover:bg-blue-50 transition-colors">
                    <td className="py-3 px-4 text-slate-600">
                      {fmtDate(r.data)}
                    </td>
                    <td className="py-3 px-4 text-slate-800">{r.descricao}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {r.paciente_id ? "Vinculado" : "—"}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {r.categoria
                        ? r.categoria.charAt(0).toUpperCase() +
                          r.categoria.slice(1)
                        : "—"}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-emerald-700">
                      {fmtValor(r.valor)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ModalNovaReceita
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        onSuccess={carregar}
      />
    </div>
  );
}
