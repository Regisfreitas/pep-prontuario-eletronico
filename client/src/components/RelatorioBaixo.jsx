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
const fmtDate = (d) =>
  d ? new Date(d + "T12:00:00").toLocaleDateString("pt-BR") : "—";

export default function RelatorioBaixo() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [situacao, setSituacao] = useState("ambos");
  const [categoria, setCategoria] = useState("");
  const [sort, setSort] = useState({ col: null, dir: "asc" });

  const carregar = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (situacao) params.set("situacao", situacao);
    if (categoria) params.set("categoria", categoria);
    try {
      const res = await fetch(
        apiUrl(`/api/estoque/relatorios/baixo?${params}`),
      );
      const json = await res.json();
      setData(json.data || []);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [situacao, categoria]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const columns = [
    { label: "Código", accessor: (r) => r.codigo || "—", sortKey: "codigo" },
    { label: "Produto", accessor: (r) => r.nome, sortKey: "nome" },
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
      label: "Qtde para Repor",
      accessor: (r) => r.qtde_repor,
      sortKey: "qtde_repor",
      className: "text-right",
    },
    { label: "Situação", accessor: (r) => r.situacao, sortKey: "situacao" },
    {
      label: "Fornecedor",
      accessor: (r) => r.fornecedor || "—",
      sortKey: "fornecedor",
    },
    {
      label: "Última Entrada",
      accessor: (r) => r.ultima_entrada || "—",
      sortKey: "ultima_entrada",
    },
    {
      label: "Dias Sem Mov.",
      accessor: (r) => r.dias_sem_mov ?? "—",
      sortKey: "dias_sem_mov",
      className: "text-right",
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

  const handleSort = (key) =>
    setSort((prev) =>
      prev.col === key
        ? { col: key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { col: key, dir: "asc" },
    );
  const handleExport = () =>
    downloadCSV(
      data,
      columns,
      `relatorio-baixo-${new Date().toISOString().split("T")[0]}`,
    );

  const empty = !loading && data.length === 0;

  return (
    <div className="flex-1 flex flex-col">
      <div className="px-8 py-3 bg-white border-b border-slate-200 flex items-center gap-3 flex-wrap">
        <select
          value={situacao}
          onChange={(e) => setSituacao(e.target.value)}
          data-testid="filtro-baixo-situacao"
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/30 bg-white"
        >
          <option value="ambos">Ambos</option>
          <option value="baixo">Baixo</option>
          <option value="esgotado">Esgotado</option>
        </select>
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          data-testid="filtro-baixo-categoria"
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/30 bg-white"
        >
          <option value="">Todas as categorias</option>
          {CATEGORIAS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <span className="text-xs text-slate-400 ml-auto">
          {data.length} produto(s)
        </span>
      </div>

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
              aria-label="Estoque Baixo/Esgotado"
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
                    <td className="py-3 px-3 font-medium text-red-600 text-right">
                      {r.saldo_atual}
                    </td>
                    <td className="py-3 px-3 text-slate-600 text-right">
                      {r.saldo_minimo}
                    </td>
                    <td className="py-3 px-3 text-amber-700 font-medium text-right">
                      {r.qtde_repor}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${SITUACAO_CLASSES[r.situacao] || SITUACAO_CLASSES.normal}`}
                      >
                        {SITUACAO_LABELS[r.situacao] || "Normal"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {r.fornecedor || "—"}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {fmtDate(r.ultima_entrada)}
                    </td>
                    <td className="py-3 px-3 text-slate-600 text-right">
                      {r.dias_sem_mov ?? "—"}
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
