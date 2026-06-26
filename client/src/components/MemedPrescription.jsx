import { useCallback, useEffect, useRef, useState } from "react";
import { fetchPatientById } from "../api/patients";
import { fetchMemedToken, getMemedScriptUrl } from "../api/memed";

const MEDICO_ID = 1;

function normalizeCpf(value) {
  if (!value) return "";
  return value.replace(/\D/g, "");
}

function formatDateToBr(value) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

export default function MemedPrescription({ pacienteId }) {
  const [state, setState] = useState({
    phase: "loading",
    error: null,
    log: [],
  });
  const scriptRef = useRef(null);
  const initializedRef = useRef(false);
  const patientRef = useRef(null);
  const logRef = useRef([]);

  const addLog = (msg) => {
    logRef.current = [
      ...logRef.current.slice(-20),
      { time: new Date().toLocaleTimeString(), msg },
    ];
    setState((s) => ({ ...s, log: logRef.current }));
  };

  // ---------- Memed module init handler ----------
  const handleModuleInit = useCallback(async (event) => {
    if (event.detail?.module !== "plataforma.prescricao") return;
    if (initializedRef.current) return;
    initializedRef.current = true;
    addLog("Módulo Memed carregado");

    const patient = patientRef.current;
    if (!patient || !window.MdHub) {
      addLog("ERRO: dados do paciente não disponíveis");
      setState((s) => ({
        ...s,
        phase: "error",
        error: "Dados do paciente não disponíveis",
      }));
      return;
    }

    try {
      // 4.1 Ativar layout de receituário de controle especial
      addLog("Configurando receituário de controle especial...");
      await window.MdHub.command.send("plataforma.sdk", "find", {
        resource: "opcoes-receituario/ativar/2",
        cache: false,
      });

      // 4.2 Configurar feature toggles
      await window.MdHub.command.send(
        "plataforma.prescricao",
        "setFeatureToggle",
        {
          historyPrescription: false,
          optionsPrescription: false,
          removePrescription: false,
          buttonClose: false,
          forceSign: true,
          showHelpMenu: false,
          showProtocol: false,
          editIdentification: false,
          copyMedicalRecords: true,
          enableAlerts: true,
        },
      );

      // 4.3 Enviar dados do paciente
      addLog(`Enviando dados do paciente: ${patient.full_name}`);
      await window.MdHub.command.send("plataforma.prescricao", "setPaciente", {
        idExterno: patient.id,
        nome: patient.full_name,
        cpf: normalizeCpf(patient.document || ""),
        sexo: patient.gender || "Masculino",
        data_nascimento: formatDateToBr(patient.birth_date),
        telefone: patient.phone || "",
        email: patient.email || "",
      });

      // 4.5 Exibir módulo
      window.MdHub.module.show("plataforma.prescricao");
      addLog("Prescrição de controlados pronta");
      setState((s) => ({ ...s, phase: "ready" }));
    } catch (err) {
      addLog(`ERRO: ${err.message}`);
      setState((s) => ({ ...s, phase: "error", error: err.message }));
    }
  }, []);

  // ---------- Setup listener for events ----------
  useEffect(() => {
    const onHide = async () => {
      addLog("Módulo fechado — limpando sessão");
      try {
        if (window.MdHub) {
          await window.MdHub.command.send("plataforma.sdk", "logout");
        }
      } catch (e) {
        addLog(`Erro no logout: ${e.message}`);
      }
    };

    const onConclusion = (event) => {
      addLog("Prescrição concluída — dados capturados");
      console.log("Memed prescription:conclusion", event.detail);
      // Enviar dados para o backend
      if (event.detail) {
        fetch("/api/integrations/memed/conclusion", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prescription: event.detail,
            doctor_id: MEDICO_ID,
          }),
        }).catch(() => {});
      }
    };

    document.addEventListener("core:moduleHide", onHide);
    document.addEventListener("prescription:conclusion", onConclusion);

    return () => {
      document.removeEventListener("core:moduleHide", onHide);
      document.removeEventListener("prescription:conclusion", onConclusion);
    };
  }, []);

  // ---------- Load script + patient data ----------
  useEffect(() => {
    let cancelled = false;

    async function init() {
      addLog("Carregando módulo Memed...");

      try {
        // Fetch patient
        if (pacienteId) {
          try {
            const patient = await fetchPatientById(pacienteId);
            patientRef.current = patient;
          } catch {
            addLog("Aviso: dados do paciente não carregados do backend");
          }
        }

        // Fetch token
        const { memed_token } = await fetchMemedToken(MEDICO_ID);
        if (cancelled) return;
        addLog("Token Memed obtido");

        // Register module init listener
        document.addEventListener("core:moduleInit", handleModuleInit);

        // Inject script
        const script = document.createElement("script");
        script.src = getMemedScriptUrl();
        script.setAttribute("data-token", memed_token);
        script.setAttribute("data-container", "prescricao-controlados");
        script.setAttribute("data-color", "#6D28D9");
        script.async = true;

        script.onload = () => {
          if (!cancelled) {
            addLog("Script Memed carregado");
            setState((s) => ({ ...s, phase: "loaded" }));
          }
        };

        script.onerror = () => {
          if (!cancelled) {
            addLog("ERRO: falha ao carregar script Memed");
            setState((s) => ({
              ...s,
              phase: "error",
              error: "Falha ao carregar o módulo de prescrição Memed.",
            }));
          }
        };

        document.body.appendChild(script);
        scriptRef.current = script;
      } catch (err) {
        if (!cancelled) {
          addLog(`ERRO: ${err.message}`);
          setState((s) => ({ ...s, phase: "error", error: err.message }));
        }
      }
    }

    init();

    return () => {
      cancelled = true;
      document.removeEventListener("core:moduleInit", handleModuleInit);

      // Cleanup: try to hide module and logout
      try {
        if (window.MdHub?.module) {
          window.MdHub.module.hide("plataforma.prescricao");
        }
        if (window.MdHub?.command) {
          window.MdHub.command.send("plataforma.sdk", "logout").catch(() => {});
        }
      } catch {}

      if (scriptRef.current?.parentNode) {
        document.body.removeChild(scriptRef.current);
      }
      initializedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pacienteId]);

  // ---------- Close button handler ----------
  const handleClose = () => {
    try {
      window.MdHub?.module?.hide("plataforma.prescricao");
    } catch {}
  };

  // ---------- Render ----------
  if (state.phase === "error") {
    return (
      <div
        className="flex flex-col items-center justify-center h-full min-h-[400px] p-8"
        data-testid="memed-error"
        role="alert"
      >
        <div className="w-16 h-16 mb-4 rounded-full bg-red-100 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-base font-medium text-slate-800 mb-2">
          Prescrição temporariamente indisponível
        </p>
        <p className="text-sm text-slate-500 text-center max-w-md">
          {state.error}
        </p>
        {state.log.length > 0 && (
          <details className="mt-4 w-full max-w-md text-left">
            <summary className="text-xs text-slate-400 cursor-pointer">
              Log de carregamento
            </summary>
            <div className="mt-2 p-3 bg-slate-50 rounded text-xs font-mono text-slate-600 max-h-40 overflow-y-auto">
              {state.log.map((l, i) => (
                <div key={i}>
                  [{l.time}] {l.msg}
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full"
      role="region"
      aria-label="Prescrição de Controlados — Memed"
    >
      {/* Top bar with close button */}
      {(state.phase === "loaded" || state.phase === "ready") && (
        <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200 shrink-0">
          <span className="text-xs text-slate-500">
            {state.phase === "ready" ? "Memed ativo" : "Carregando módulo..."}
          </span>
          <button
            type="button"
            onClick={handleClose}
            data-testid="memed-btn-close"
            className="px-3 py-1 text-xs font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-white transition-colors"
          >
            Fechar prescrição
          </button>
        </div>
      )}

      {/* Memed container */}
      <div
        className="flex-1 bg-white"
        style={{ minWidth: 820, minHeight: 700 }}
      >
        <div id="prescricao-controlados" className="w-full h-full" />
      </div>

      {/* Loading overlay */}
      {state.phase === "loading" && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-white/90 z-10"
          data-testid="memed-loading"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin" />
            <p className="text-sm text-slate-500">
              Conectando ao módulo de prescrição...
            </p>
          </div>
        </div>
      )}

      {/* Log panel (collapsed) */}
      {state.log.length > 0 && state.phase !== "error" && (
        <details className="px-4 py-2 bg-slate-50 border-t border-slate-200 shrink-0">
          <summary className="text-xs text-slate-400 cursor-pointer">
            Log
          </summary>
          <div className="mt-2 p-2 bg-white rounded text-xs font-mono text-slate-600 max-h-32 overflow-y-auto">
            {state.log.map((l, i) => (
              <div key={i}>
                [{l.time}] {l.msg}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
