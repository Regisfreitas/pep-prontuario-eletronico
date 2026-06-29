import { useCallback, useEffect, useState } from "react";
import { apiUrl } from "../config/api";
import LoadingSpinner from "./patients/LoadingSpinner";
import { CATEGORIAS, downloadCSV } from "../utils/relatorios";

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
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("pt-BR") : "—");

function PCTBar({ value }) {
  const pct = Math.min(value ?? 0, 100);
  const color =
    pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-slate-500 font-medium">{pct}%</span>
    </div>
  );
}

export default function RelatorioPosicao() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("");
  const [situacao, setSituacao] = useState("");
  const [sort, setSort] = useState({ col: null, dir: "asc" });

  const carregar = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (busca) params.set("busca", busca);
    if (categoria) params.set("categoria", categoria);
    if (situacao) params.set("situacao", situacao);
    try {
      const res = await fetch(
        apiUrl(`/api/estoque/relatorios/posicao?${params}`),
      );
      const json = await res.json();
      setData(json.data || []);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [busca, categoria, situacao]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const columns = [
    { label: "Código", accessor: (r) => r.codigo || "—", sortKey: "codigo" },
    { label: "Produto", accessor: (r) => r.nome, sortKey: "nome" },
    {
      label: "Categoria",
      accessor: (r) => r.categoria || "—",
      sortKey: "categoria",
    },
    {
      label: "Embalagem",
      accessor: (r) => r.embalagem || "—",
      sortKey: "embalagem",
    },
    {
      label: "Saldo Atual",
      accessor: (r) => r.saldo_atual,
      sortKey: "saldo_atual",
      className: "text-right",
    },
    {
      label: "Est. Mínimo",
      accessor: (r) => r.saldo_minimo,
      sortKey: "saldo_minimo",
      className: "text-right",
    },
    {
      label: "Est. Ideal",
      accessor: (r) => r.saldo_ideal || "—",
      sortKey: "saldo_ideal",
      className: "text-right",
    },
    {
      label: "% do Ideal",
      accessor: (r) =>
        r.saldo_ideal ? Math.round((r.saldo_atual / r.saldo_ideal) * 100) : 0,
      sortKey: null,
    },
    { label: "Situação", accessor: (r) => r.situacao, sortKey: "situacao" },
    {
      label: "Última Entrada",
      accessor: (r) => r.ultima_entrada || "—",
      sortKey: "ultima_entrada",
    },
  ];

  const sorted = [...data].sort((a, b) => {
    if (!sort.col) return 0;
    const va = columns.find((c) => c.sortKey === sort.col)?.accessor(a) ?? "";
    const vb = columns.find((c) => c.sortKey === sort.col)?.accessor(b) ?? "";
    const cmp = String(va).localeCompare(String(vb), undefined, {
      numeric: true,
    });
    return sort.dir === "asc" ? cmp : -cmp;
  });

  const handleSort = (key) => {
    setSort((prev) =>
      prev.col === key
        ? { col: key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { col: key, dir: "asc" },
    );
  };

  const handleExport = () =>
    downloadCSV(
      data,
      columns,
      `relatorio-posicao-${new Date().toISOString().split("T")[0]}`,
    );

  const empty = !loading && data.length === 0;

  return (
    <div className="flex-1 flex flex-col">
      {/* Filters */}
      <div className="px-8 py-3 bg-white border-b border-slate-200 flex items-center gap-3 flex-wrap">
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          data-testid="filtro-posicao-busca"
          placeholder="Buscar por nome ou código"
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/30 bg-white min-w-[200px]"
        />
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          data-testid="filtro-posicao-categoria"
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/30 bg-white"
        >
          <option value="">Todas as categorias</option>
          {CATEGORIAS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={situacao}
          onChange={(e) => setSituacao(e.target.value)}
          data-testid="filtro-posicao-situacao"
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/30 bg-white"
        >
          <option value="">Todas as situações</option>
          <option value="normal">Normal</option>
          <option value="baixo">Baixo</option>
          <option value="esgotado">Esgotado</option>
        </select>
        <span className="text-xs text-slate-400 ml-auto">
          {data.length} produto(s)
        </span>
      </div>

      {/* Table */}
      <div className="flex-1 p-8">
        {loading ? (
          <LoadingSpinner data-testid="loading-spinner" label="Carregando..." />
        ) : empty ? (
          <div
            data-testid="relatorio-empty"
            className="flex items-center justify-center h-40 text-sm text-slate-500"
          >
            Nenhum resultado encontrado
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <table
              data-testid="tabela-relatorio"
              role="table"
              aria-label="Posição de Estoque"
              className="w-full text-sm"
            >
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">
                  {columns.map((col) => (
                    <th
                      key={col.label}
                      scope="col"
                      className={`py-3 px-3 font-semibold text-slate-600 text-xs whitespace-nowrap ${col.className || ""} ${col.sortKey ? "cursor-pointer hover:text-slate-800" : ""}`}
                      onClick={() => col.sortKey && handleSort(col.sortKey)}
                    >
                      {col.label}
                      {sort.col === col.sortKey
                        ? sort.dir === "asc"
                          ? " ▲"
                          : " ▼"
                        : ""}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-3 px-3 text-slate-700 font-mono text-xs">
                      {r.codigo || "—"}
                    </td>
                    <td className="py-3 px-3 text-slate-800 font-medium">
                      {r.nome}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {r.categoria || "—"}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {r.embalagem || "—"}
                    </td>
                    <td
                      className={`py-3 px-3 font-medium ${r.saldo_atual <= r.saldo_minimo ? "text-red-600" : "text-slate-700"} text-right`}
                    >
                      {r.saldo_atual}
                    </td>
                    <td className="py-3 px-3 text-slate-600 text-right">
                      {r.saldo_minimo}
                    </td>
                    <td className="py-3 px-3 text-slate-600 text-right">
                      {r.saldo_ideal || "—"}
                    </td>
                    <td className="py-3 px-3">
                      <PCTBar
                        value={
                          r.saldo_ideal
                            ? (r.saldo_atual / r.saldo_ideal) * 100
                            : 0
                        }
                      />
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${SITUACAO_CLASSES[r.situacao] || SITUACAO_CLASSES.normal}`}
                      >
                        {SITUACAO_LABELS[r.situacao] || "Normal"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {fmtDate(r.ultima_entrada)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
