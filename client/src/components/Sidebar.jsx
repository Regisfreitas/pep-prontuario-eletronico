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

const SUB_ITEMS = [
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
];

export default function Sidebar() {
  const [expanded, setExpanded] = useState(true);
  const [perfilOpen, setPerfilOpen] = useState(false);
  const location = useLocation();

  // Auto-open perfil accordion when on a /perfil route
  useEffect(() => {
    if (location.pathname.startsWith("/perfil")) {
      setPerfilOpen(true);
    }
  }, [location.pathname]);

  const toggleSidebar = () => setExpanded((prev) => !prev);
  const togglePerfil = () => setPerfilOpen((prev) => !prev);

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
          <span className="text-sm font-bold text-medical-800 tracking-wide truncate">
            PEP SoMed
          </span>
        ) : (
          <span className="text-sm font-bold text-medical-800 mx-auto">P</span>
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
                    ? "bg-medical-600 text-white font-medium shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              <Icon size={20} className="shrink-0" aria-hidden="true" />
              {expanded && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}

        {/* Perfil — Accordion trigger */}
        {expanded && (
          <button
            type="button"
            data-testid="nav-link-perfil"
            onClick={togglePerfil}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all duration-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            <UserCog size={20} className="shrink-0" aria-hidden="true" />
            <span className="flex-1 text-left truncate">Perfil</span>
            <ChevronDown
              size={16}
              className={`shrink-0 transition-transform duration-300 ${
                perfilOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        )}

        {/* Submenus — with collapse animation */}
        {expanded && perfilOpen && (
          <div className="space-y-1 overflow-hidden transition-all duration-300">
            {SUB_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  data-testid={item.testId}
                  className={({ isActive }) =>
                    `flex items-center gap-3 pl-10 pr-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                      isActive
                        ? "bg-medical-50 text-medical-700 font-medium"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                    }`
                  }
                >
                  {Icon && (
                    <Icon size={16} className="shrink-0" aria-hidden="true" />
                  )}
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        )}

        {/* Collapsed state — just an icon button */}
        {!expanded && (
          <button
            type="button"
            data-testid="nav-link-perfil"
            onClick={togglePerfil}
            className="flex items-center justify-center w-full px-3 py-2.5 rounded-lg text-sm transition-all duration-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            <UserCog size={20} className="shrink-0" aria-hidden="true" />
          </button>
        )}
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
