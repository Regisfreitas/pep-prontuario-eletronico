import { useCallback, useEffect, useRef, useState } from "react";
import { fetchPatientById } from "../api/patients";
import { fetchMemedToken, getMemedScriptUrl } from "../api/memed";

const MEDICO_ID = 1;

function normalizeCpf(v) {
  return v ? v.replace(/\D/g, "") : "";
}
function fmtBr(v) {
  if (!v) return "";
  const [y, m, d] = v.split("-");
  return y && m && d ? `${d}/${m}/${y}` : v;
}

export default function MemedPrescription({ pacienteId }) {
  const [s, setS] = useState({ phase: "loading", error: null, log: [] });
  const logRef = useRef([]);
  const addLog = (msg) => {
    logRef.current = [
      ...logRef.current.slice(-40),
      { t: new Date().toLocaleTimeString(), msg },
    ];
    setS((p) => ({ ...p, log: logRef.current }));
  };
  const fail = (msg) => {
    addLog("FALHA: " + msg);
    setS((p) => ({ ...p, phase: "error", error: msg }));
  };
  const initialized = useRef(false);
  const patient = useRef(null);
  const timeout = useRef(null);
  const script = useRef(null);
  const poll = useRef(null);

  const attempt = useCallback(async () => {
    if (initialized.current) return;
    initialized.current = true;
    if (timeout.current) clearTimeout(timeout.current);
    addLog("Inicializando...");
    try {
      const p = patient.current;
      if (p) {
        await window.MdHub.command.send(
          "plataforma.prescricao",
          "setPaciente",
          {
            idExterno: p.id,
            nome: p.full_name,
            cpf: normalizeCpf(p.document),
            sexo:
              p.gender === "Masculino"
                ? "Masculino"
                : p.gender === "Feminino"
                  ? "Feminino"
                  : "",
            data_nascimento: fmtBr(p.birth_date),
            telefone: p.phone || "",
            email: p.email || "",
          },
        );
        addLog("Paciente: " + p.full_name);
      }
      window.MdHub.module.show("plataforma.prescricao");
      setS((p) => ({ ...p, phase: "ready" }));
      addLog("Exibido ✅");
    } catch (e) {
      addLog("Erro: " + e.message);
      initialized.current = false;
    }
  }, []);

  useEffect(() => {
    let c = false;
    async function go() {
      addLog("Iniciando...");
      try {
        if (pacienteId) {
          try {
            patient.current = await fetchPatientById(pacienteId);
            addLog("Paciente: " + patient.current?.full_name);
          } catch {}
        }
        const { memed_token } = await fetchMemedToken(MEDICO_ID);
        if (c) return;
        addLog("Token: " + memed_token.substring(0, 8) + "...");

        timeout.current = setTimeout(() => {
          if (!initialized.current) fail("Timeout 30s — MdHub não inicializou");
        }, 30000);

        const el = document.createElement("script");
        el.src = getMemedScriptUrl();
        el.setAttribute("data-token", memed_token);
        el.setAttribute("data-container", "prescricao-controlados");
        el.setAttribute("data-color", "#6D28D9");
        el.async = true;
        el.onload = () => {
          if (c) return;
          addLog("Script carregado");
          setS((p) => ({ ...p, phase: "loaded" }));
          let n = 0;
          poll.current = setInterval(() => {
            n++;
            if (!window.MdHub) return;
            if (n <= 4)
              addLog(
                "MdHub keys: " +
                  (Object.keys(window.MdHub).join(",") || "vazio"),
              );
            if (!window.MdHub.command) return;
            clearInterval(poll.current);
            attempt();
          }, 500);
        };
        el.onerror = () => {
          if (!c) fail("Erro ao carregar script");
        };
        document.body.appendChild(el);
        script.current = el;
      } catch (e) {
        if (!c) fail(e.message);
      }
    }
    go();
    return () => {
      c = true;
      if (timeout.current) clearTimeout(timeout.current);
      if (poll.current) clearInterval(poll.current);
      try {
        window.MdHub?.module?.hide?.("plataforma.prescricao");
        window.MdHub?.command
          ?.send?.("plataforma.sdk", "logout")
          .catch(() => {});
      } catch {}
      if (script.current?.parentNode) document.body.removeChild(script.current);
      initialized.current = false;
    };
  }, [pacienteId]);

  const close = () => {
    try {
      window.MdHub?.module?.hide?.("plataforma.prescricao");
    } catch {}
  };

  if (s.phase === "error")
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
        <p className="text-sm text-slate-500 text-center max-w-md">{s.error}</p>
        <details className="mt-4 w-full max-w-lg text-left">
          <summary className="text-xs text-slate-400 cursor-pointer">
            Log
          </summary>
          <div className="mt-2 p-3 bg-slate-50 rounded text-xs font-mono text-slate-600 max-h-48 overflow-y-auto whitespace-pre-wrap">
            {s.log.map((l, i) => (
              <div key={i}>
                [{l.t}] {l.msg}
              </div>
            ))}
          </div>
        </details>
      </div>
    );

  return (
    <div
      className="flex flex-col h-full"
      role="region"
      aria-label="Prescrição de Controlados"
    >
      {s.phase !== "loading" && (
        <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200 shrink-0">
          <span className="text-xs text-slate-500">
            {s.phase === "ready" ? "Memed ativo" : "Aguardando..."}
          </span>
          <button
            onClick={close}
            data-testid="memed-btn-close"
            className="px-3 py-1 text-xs font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-white"
          >
            Fechar
          </button>
        </div>
      )}
      <div
        className="flex-1 bg-white"
        style={{ minWidth: 820, minHeight: 700 }}
      >
        <div id="prescricao-controlados" className="w-full h-full" />
      </div>
      {s.phase === "loading" && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-white/95 z-10"
          data-testid="memed-loading"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin" />
            <p className="text-sm text-slate-500">Conectando à Memed...</p>
            {s.log.slice(-1).map((l, i) => (
              <p key={i} className="text-xs text-slate-400">
                [{l.t}] {l.msg}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
