import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Calendar,
  Stethoscope,
  Users,
  UserCog,
  UserRound,
  Building2,
  CreditCard,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Package,
  ArrowLeftRight,
  Pill,
  BarChart3,
  DollarSign,
  TrendingUp,
  ArrowDownCircle,
  ArrowUpCircle,
  Calculator,
  Receipt,
  PieChart,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/agenda", label: "Agenda", icon: Calendar, testId: "nav-link-agenda" },
  {
    to: "/",
    label: "Atendimento",
    icon: Stethoscope,
    testId: "nav-link-atendimento",
  },
  {
    to: "/pacientes",
    label: "Pacientes",
    icon: Users,
    testId: "nav-link-pacientes",
  },
];

const ACCORDIONS = [
  {
    key: "perfil",
    label: "Perfil",
    icon: UserCog,
    testId: "nav-link-perfil",
    items: [
      {
        to: "/perfil/prescritor",
        label: "Dados do Prescritor",
        icon: UserRound,
        testId: "submenu-dados-prescritor",
      },
      {
        to: "/perfil/clinicas",
        label: "Minhas Clínicas",
        icon: Building2,
        testId: "submenu-minhas-clinicas",
      },
      {
        to: "/perfil/assinaturas",
        label: "Planos e Assinaturas",
        icon: CreditCard,
        testId: "submenu-planos-assinaturas",
      },
      {
        to: "/perfil/layouts",
        label: "Meus Layouts",
        icon: FileText,
        testId: "submenu-meus-layouts",
      },
    ],
  },
  {
    key: "estoque",
    label: "Estoque",
    icon: Package,
    testId: "menu-estoque",
    items: [
      {
        to: "/estoque/movimentacoes",
        label: "Movimentações",
        icon: ArrowLeftRight,
        testId: "submenu-estoque-movimentacoes",
      },
      {
        to: "/estoque/produtos",
        label: "Produtos",
        icon: Pill,
        testId: "submenu-estoque-produtos",
      },
      {
        to: "/estoque/relatorios",
        label: "Relatórios",
        icon: BarChart3,
        testId: "submenu-estoque-relatorios",
      },
    ],
  },
  {
    key: "financeiro",
    label: "Financeiro",
    icon: DollarSign,
    testId: "menu-financeiro",
    items: [
      {
        to: "/financeiro/receitas-despesas",
        label: "Receitas e Despesas",
        icon: TrendingUp,
        testId: "submenu-financeiro-receitas-despesas",
      },
      {
        to: "/financeiro/contas-pagar",
        label: "Contas a Pagar",
        icon: ArrowDownCircle,
        testId: "submenu-financeiro-contas-pagar",
      },
      {
        to: "/financeiro/contas-receber",
        label: "Contas a Receber",
        icon: ArrowUpCircle,
        testId: "submenu-financeiro-contas-receber",
      },
      {
        to: "/financeiro/orcamentos",
        label: "Orçamentos",
        icon: Calculator,
        testId: "submenu-financeiro-orcamentos",
      },
      {
        to: "/financeiro/gerar-recibo-nfe",
        label: "Gerar Recibo/NF-e",
        icon: Receipt,
        testId: "submenu-financeiro-gerar-recibo-nfe",
      },
      {
        to: "/financeiro/relatorios",
        label: "Relatórios",
        icon: PieChart,
        testId: "submenu-financeiro-relatorios",
      },
    ],
  },
];

// ---------- Accordion subcomponent ----------

function Accordion({ accordion, expanded, isOpen, onToggle }) {
  const Icon = accordion.icon;

  return (
    <>
      {expanded && (
        <button
          type="button"
          data-testid={accordion.testId}
          onClick={onToggle}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all duration-200 text-surgical-slate hover:bg-surgical-blue/10 hover:text-surgical-blue sidebar-link"
        >
          <Icon size={20} className="shrink-0" aria-hidden="true" />
          <span className="flex-1 text-left truncate">{accordion.label}</span>
          <ChevronDown
            size={16}
            className={`shrink-0 transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      )}

      {expanded && isOpen && (
        <div className="space-y-1 overflow-hidden transition-all duration-300">
          {accordion.items.map((item) => {
            const SubIcon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                data-testid={item.testId}
                className={({ isActive }) =>
                  `flex items-center gap-3 pl-10 pr-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                    isActive
                      ? "bg-surgical-blue text-white font-medium shadow-sm"
                      : "text-surgical-slate hover:bg-surgical-blue/10 hover:text-surgical-blue"
                  }`
                }
              >
                {SubIcon && (
                  <SubIcon size={16} className="shrink-0" aria-hidden="true" />
                )}
                {item.label}
              </NavLink>
            );
          })}
        </div>
      )}

      {!expanded && (
        <button
          type="button"
          data-testid={accordion.testId}
          onClick={onToggle}
          className="flex items-center justify-center w-full px-3 py-2.5 rounded-lg text-sm transition-all duration-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        >
          <Icon size={20} className="shrink-0" aria-hidden="true" />
        </button>
      )}
    </>
  );
}

// ---------- Main Sidebar ----------

export default function Sidebar() {
  const [expanded, setExpanded] = useState(true);
  const [openMenus, setOpenMenus] = useState({});
  const location = useLocation();

  // Auto-open accordions when on their routes
  useEffect(() => {
    const next = { ...openMenus };
    for (const acc of ACCORDIONS) {
      if (location.pathname.startsWith(`/${acc.key}`)) {
        next[acc.key] = true;
      }
    }
    setOpenMenus(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const toggleSidebar = () => setExpanded((prev) => !prev);
  const toggleMenu = (key) =>
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <aside
      data-testid="sidebar"
      className={`flex flex-col bg-white border-r border-slate-200 h-screen transition-all duration-300 ease-in-out shrink-0 ${
        expanded ? "w-60" : "w-16"
      }`}
    >
      {/* Brand */}
      <div className="flex items-center h-14 px-3 border-b border-slate-100">
        {expanded ? (
          <span className="text-sm font-bold text-surgical-dark tracking-wide truncate">
            SoMed
          </span>
        ) : (
          <span className="text-sm font-bold text-surgical-dark mx-auto">
            S
          </span>
        )}
      </div>

      {/* Toggle */}
      <div className="flex items-center justify-end px-2 pt-3 pb-2">
        <button
          data-testid="sidebar-toggle"
          type="button"
          onClick={toggleSidebar}
          aria-label={
            expanded ? "Recolher menu lateral" : "Expandir menu lateral"
          }
          className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          {expanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav
        aria-label="Navegação principal"
        className="flex-1 px-2 space-y-1 overflow-y-auto"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              data-testid={item.testId}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-surgical-blue text-white font-medium shadow-sm"
                    : "text-surgical-slate hover:bg-surgical-blue/10 hover:text-surgical-blue"
                }`
              }
            >
              <Icon size={20} className="shrink-0" aria-hidden="true" />
              {expanded && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}

        {/* Accordion menus */}
        {ACCORDIONS.map((acc) => (
          <Accordion
            key={acc.key}
            accordion={acc}
            expanded={expanded}
            isOpen={!!openMenus[acc.key]}
            onToggle={() => toggleMenu(acc.key)}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="px-2 pb-3 border-t border-slate-100 pt-2">
        <div
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-400 ${
            expanded ? "" : "justify-center"
          }`}
        >
          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-semibold text-slate-500">
            M
          </div>
          {expanded && <span className="truncate">v1.0.0</span>}
        </div>
      </div>
    </aside>
  );
}
