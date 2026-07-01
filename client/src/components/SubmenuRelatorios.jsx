import { CATEGORIAS } from "../utils/relatorios";

const ITENS = [
  {
    key: "posicao",
    label: "Posição de Estoque",
    dataTestid: "relatorio-posicao-estoque",
    icon: (
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
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
    ),
  },
  {
    key: "baixo",
    label: "Estoque Baixo / Esgotado",
    dataTestid: "relatorio-estoque-baixo",
    icon: (
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
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
    ),
  },
  {
    key: "vencimento",
    label: "Produtos Próximos ao Vencimento",
    dataTestid: "relatorio-produtos-vencimento",
    icon: (
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
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
];

export default function SubmenuRelatorios({ activeReport, onChange }) {
  return (
    <nav className="w-56 shrink-0 bg-white border-r border-slate-200 p-3 space-y-1">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 pb-2">
        Relatórios
      </p>
      {ITENS.map((item) => (
        <button
          key={item.key}
          data-testid={item.dataTestid}
          onClick={() => onChange(item.key)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors text-left ${
            activeReport === item.key
              ? "bg-surgical-blue/10 text-surgical-blue font-semibold"
              : "text-surgical-slate hover:bg-surgical-blue/10 hover:text-surgical-blue"
          }`}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
