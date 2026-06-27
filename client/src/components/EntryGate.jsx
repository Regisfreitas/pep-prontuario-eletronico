import { useEffect, useRef, useState } from "react";
import { fetchSuggestedPatient, searchPatients } from "../api/patients";

function getInitials(name) {
  return (name || "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatPacId(id) {
  if (!id) return "";
  const short = typeof id === "string" ? id.split("-").pop() : String(id);
  return `PAC-${short.slice(0, 6).toUpperCase()}`;
}

export default function EntryGate({ onStart, loading, error }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState(null);
  const [suggestedLoaded, setSuggestedLoaded] = useState(false);
  const debounceRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Load suggested patient on mount
  useEffect(() => {
    fetchSuggestedPatient()
      .then((patient) => {
        setSelected(patient);
        setSuggestedLoaded(true);
      })
      .catch(() => {
        setSuggestedLoaded(true);
      });
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Debounced search
  const handleSearch = (value) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 2) {
      setResults([]);
      return;
    }

    setSearching(true);
    debounceRef.current = setTimeout(() => {
      searchPatients(value.trim())
        .then((data) => setResults(data.patients || []))
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 300);
  };

  const handleSelect = (patient) => {
    setSelected(patient);
    setOpen(false);
    setSearch("");
    setResults([]);
  };

  const handleStart = () => {
    if (!selected) return;
    onStart(selected.id);
  };

  // Build display info from selected patient
  const displayName = selected?.full_name || "Nenhum paciente selecionado";
  const displayAge = selected?.age ?? "—";
  const displayId = selected?.id ? formatPacId(selected.id) : "";
  const initials = selected?.full_name ? getInitials(selected.full_name) : "?";

  return (
    <div className="h-full flex items-center justify-center bg-gradient-to-br from-brand-50 to-slate-100 p-8">
      <div className="w-full h-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col">
        <div className="bg-brand-800 px-8 py-6 text-white">
          <p className="text-sm font-medium text-blue-200 uppercase tracking-wider">
            Prontuário Eletrônico
          </p>
          <h1 className="text-2xl font-bold mt-1">Painel Clínico</h1>
        </div>

        <div className="p-8 flex flex-col flex-1">
          {/* Patient Selector */}
          <div className="relative mb-6" ref={dropdownRef}>
            <button
              type="button"
              data-testid="patient-selector-input"
              onClick={() => setOpen((o) => !o)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                open
                  ? "border-brand-600 ring-2 ring-brand-600/20 bg-white"
                  : "border-slate-100 bg-slate-50 hover:border-slate-200"
              }`}
            >
              <div className="w-14 h-14 rounded-full bg-brand-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-slate-800 truncate">
                  {displayName}
                </h2>
                <p className="text-sm text-slate-500">
                  {displayAge} anos{displayId ? ` · ${displayId}` : ""}
                </p>
              </div>
              <svg
                className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                  open ? "rotate-180" : ""
                }`}
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

            {/* Dropdown */}
            {open && (
              <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                <div className="p-3 border-b border-slate-100">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Buscar paciente por nome..."
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/30 focus:border-brand-600"
                  />
                </div>

                <div className="max-h-60 overflow-y-auto">
                  {searching && (
                    <div className="flex items-center justify-center py-4">
                      <div className="w-5 h-5 border-2 border-brand-100 border-t-brand-600 rounded-full animate-spin" />
                    </div>
                  )}

                  {!searching &&
                    search.trim().length >= 2 &&
                    results.length === 0 && (
                      <div className="text-center py-6 text-sm text-slate-500">
                        Nenhum paciente encontrado
                      </div>
                    )}

                  {!searching &&
                    results.map((patient) => (
                      <button
                        key={patient.id}
                        type="button"
                        data-testid={`patient-option-${patient.id}`}
                        onClick={() => handleSelect(patient)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-brand-50 ${
                          selected?.id === patient.id
                            ? "bg-brand-50 border-l-2 border-brand-600"
                            : ""
                        }`}
                      >
                        <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-sm font-bold text-brand-700 shrink-0">
                          {getInitials(patient.full_name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">
                            {patient.full_name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {patient.age} anos
                            {patient.id ? ` · ${formatPacId(patient.id)}` : ""}
                          </p>
                        </div>
                      </button>
                    ))}

                  {/* Show suggested when no search */}
                  {search.trim().length < 2 && selected && (
                    <div className="px-4 py-2">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        Paciente sugerido
                      </p>
                      <button
                        type="button"
                        onClick={() => handleSelect(selected)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-brand-50 text-left transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-brand-200 flex items-center justify-center text-xs font-bold text-brand-700 shrink-0">
                          {getInitials(selected.full_name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">
                            {selected.full_name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {selected.age} anos · {formatPacId(selected.id)}
                          </p>
                        </div>
                      </button>
                    </div>
                  )}

                  {!suggestedLoaded && search.trim().length < 2 && (
                    <div className="flex items-center justify-center py-4">
                      <div className="w-5 h-5 border-2 border-brand-100 border-t-brand-600 rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <p className="text-slate-600 text-sm mb-6 leading-relaxed">
            Inicie o atendimento para reservar um registro único no banco de
            dados. Todas as alterações serão salvas automaticamente como
            rascunho.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="button"
            data-testid="btn-start-atendimento"
            onClick={handleStart}
            disabled={loading || !selected}
            className="w-full py-3.5 px-6 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors shadow-sm mt-auto"
          >
            {loading
              ? "Iniciando atendimento..."
              : selected
                ? `Atender ${selected.full_name.split(" ")[0]}`
                : "Selecione um paciente"}
          </button>
        </div>
      </div>
    </div>
  );
}
