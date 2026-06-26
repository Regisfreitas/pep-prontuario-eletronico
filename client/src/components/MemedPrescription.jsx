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
  const timeoutRef = useRef(null);

  const addLog = (msg) => {
    logRef.current = [
      ...logRef.current.slice(-30),
      { time: new Date().toLocaleTimeString(), msg },
    ];
    setState((s) => ({ ...s, log: logRef.current }));
  };

  const fail = (msg) => {
    addLog(`FALHA: ${msg}`);
    setState((s) => ({ ...s, phase: "error", error: msg }));
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  // ---------- Proactive init when MdHub is ready ----------
  const attemptInit = useCallback(async () => {
    if (initializedRef.current) return;
    if (!window.MdHub || !window.MdHub.command) return;

    const patient = patientRef.current;
    initializedRef.current = true;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    addLog("MdHub detectado — inicializando...");

    try {
      await window.MdHub.command.send("plataforma.sdk", "find", {
        resource: "opcoes-receituario/ativar/2",
        cache: false,
      });
      addLog("Layout controle especial ativado");

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
      addLog("Feature toggles configurados");

      if (patient) {
        await window.MdHub.command.send(
          "plataforma.prescricao",
          "setPaciente",
          {
            idExterno: patient.id,
            nome: patient.full_name,
            cpf: normalizeCpf(patient.document || ""),
            sexo:
              patient.gender === "Masculino"
                ? "Masculino"
                : patient.gender === "Feminino"
                  ? "Feminino"
                  : "",
            data_nascimento: formatDateToBr(patient.birth_date),
            telefone: patient.phone || "",
            email: patient.email || "",
          },
        );
        addLog(`Paciente configurado: ${patient.full_name}`);
      }

      window.MdHub.module.show("plataforma.prescricao");
      setState((s) => ({ ...s, phase: "ready" }));
      addLog("Módulo exibido");
    } catch (err) {
      fail(err.message);
    }
  }, []);

  // ---------- Lifecycle ----------
  useEffect(() => {
    let cancelled = false;
    let pollInterval;

    async function init() {
      addLog("Iniciando...");
      try {
        if (pacienteId) {
          try {
            patientRef.current = await fetchPatientById(pacienteId);
            addLog(`Paciente: ${patientRef.current?.full_name}`);
          } catch {
            addLog("Aviso: paciente não carregado");
          }
        }

        const { memed_token } = await fetchMemedToken(MEDICO_ID);
        if (cancelled) return;
        addLog(`Token obtido: ${memed_token.substring(0, 8)}...`);

        // Timeout safety
        timeoutRef.current = setTimeout(() => {
          if (!initializedRef.current)
            fail("Timeout: MdHub não inicializou em 30s");
        }, 30000);

        // Inject script
        const script = document.createElement("script");
        script.src = getMemedScriptUrl();
        script.setAttribute("data-token", memed_token);
        script.setAttribute("data-container", "prescricao-controlados");
        script.setAttribute("data-color", "#6D28D9");
        script.async = true;

        script.onload = () => {
          if (cancelled) return;
          addLog("Script carregado");
          setState((s) => ({ ...s, phase: "loaded" }));
          // Poll for MdHub readiness
          let attempts = 0;
          pollInterval = setInterval(() => {
            attempts++;
            if (!window.MdHub || !window.MdHub.command) return;
            clearInterval(pollInterval);
            attemptInit();
          }, 500);
        };

        script.onerror = () => {
          if (!cancelled) fail("Falha ao carregar script Memed");
        };
        document.body.appendChild(script);
        scriptRef.current = script;
      } catch (err) {
        if (!cancelled) fail(err.message);
      }
    }

    init();

    return () => {
      cancelled = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (pollInterval) clearInterval(pollInterval);
      try {
        if (window.MdHub?.module)
          window.MdHub.module.hide("plataforma.prescricao");
        if (window.MdHub?.command)
          window.MdHub.command.send("plataforma.sdk", "logout").catch(() => {});
      } catch {}
      if (scriptRef.current?.parentNode)
        document.body.removeChild(scriptRef.current);
      initializedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pacienteId]);

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
          <details className="mt-4 w-full max-w-lg text-left">
            <summary className="text-xs text-slate-400 cursor-pointer">
              Log de diagnóstico
            </summary>
            <div className="mt-2 p-3 bg-slate-50 rounded text-xs font-mono text-slate-600 max-h-48 overflow-y-auto whitespace-pre-wrap">
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
      {state.phase !== "loading" && (
        <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200 shrink-0">
          <span className="text-xs text-slate-500">
            {state.phase === "ready"
              ? "Memed ativo"
              : "Aguardando inicialização..."}
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
      <div
        className="flex-1 bg-white"
        style={{ minWidth: 820, minHeight: 700 }}
      >
        <div id="prescricao-controlados" className="w-full h-full" />
      </div>
      {state.phase === "loading" && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-white/95 z-10"
          data-testid="memed-loading"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin" />
            <p className="text-sm text-slate-500">
              Conectando à plataforma Memed...
            </p>
            {state.log.slice(-1).map((l, i) => (
              <p key={i} className="text-xs text-slate-400">
                [{l.time}] {l.msg}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
