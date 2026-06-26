import { useState, useRef, useEffect } from "react";
import GoogleConnectButton from "./GoogleConnectButton";

export default function AgendaHeader({
  searchTerm,
  onSearchChange,
  onNewConsulta,
  onNewBloqueio,
  googleAuth,
  doctorName,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-start justify-between gap-4 mb-4">
        <h1 className="text-2xl font-bold text-slate-800">Agenda</h1>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px] max-w-md relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Buscar Paciente na Semana"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/30 focus:border-brand-600"
          />
        </div>

        <GoogleConnectButton
          connected={googleAuth?.connected}
          loading={googleAuth?.loading}
          disconnecting={googleAuth?.disconnecting}
          doctorName={doctorName}
          onConnect={googleAuth?.connect}
          onDisconnect={googleAuth?.disconnect}
        />

        <div className="relative flex" ref={dropdownRef}>
          <button
            type="button"
            onClick={onNewConsulta}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-l-lg transition-colors"
          >
            Novo Agendamento
          </button>
          <button
            type="button"
            onClick={() => setDropdownOpen((o) => !o)}
            className="px-2.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white border-l border-slate-700 rounded-r-lg transition-colors"
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
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-40 py-1">
              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  onNewBloqueio();
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                Bloquear Período
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
