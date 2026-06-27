import { useCallback, useEffect, useRef, useState } from "react";
import { fetchPatientById } from "../api/patients";
import { fetchMemedToken, getMemedScriptUrl } from "../api/memed";

const MEDICO_ID = 1;
const N = (v) => (v || "").replace(/\D/g, "");
const F = (v) => {
  if (!v) return "";
  const [y, m, d] = v.split("-");
  return y && m && d ? `${d}/${m}/${y}` : v;
};

export default function MemedPrescription({ pacienteId }) {
  const [s, setS] = useState({ phase: "loading", error: null, log: [] });
  const L = useRef([]);
  const log = (m) => {
    L.current = [
      ...L.current.slice(-40),
      { t: new Date().toLocaleTimeString(), msg: m },
    ];
    setS((p) => ({ ...p, log: L.current }));
  };
  const err = (m) => {
    log("FALHA: " + m);
    setS((p) => ({ ...p, phase: "error", error: m }));
  };
  const ready = useRef(false);
  const pat = useRef(null);
  const to = useRef(null);
  const el = useRef(null);
  const iv = useRef(null);

  const init = useCallback(async () => {
    if (ready.current) return;
    ready.current = true;
    if (to.current) clearTimeout(to.current);
    try {
      if (pat.current) {
        await window.MdHub.command.send(
          "plataforma.prescricao",
          "setPaciente",
          {
            idExterno: pat.current.id,
            nome: pat.current.full_name,
            cpf: N(pat.current.document || ""),
            data_nascimento: F(pat.current.birth_date),
            sexo:
              pat.current.gender === "Masculino"
                ? "Masculino"
                : pat.current.gender === "Feminino"
                  ? "Feminino"
                  : "",
            telefone: pat.current.phone || "",
            email: pat.current.email || "",
          },
        );
        log("Paciente: " + pat.current.full_name);
      }
      window.MdHub.module.show("plataforma.prescricao");
      setS((p) => ({ ...p, phase: "ready" }));
    } catch (e) {
      ready.current = false;
      log("Erro: " + e.message);
    }
  }, []);

  useEffect(() => {
    let c = false;

    // CLEANUP STALE STATE before mounting
    if (window.MdHub?.module)
      try {
        window.MdHub.module.hide("plataforma.prescricao");
      } catch {}
    if (window.MdHub?.command)
      try {
        window.MdHub.command.send("plataforma.sdk", "logout").catch(() => {});
      } catch {}
    delete window.MdHub;

    async function go() {
      try {
        if (pacienteId) {
          try {
            pat.current = await fetchPatientById(pacienteId);
            log("Paciente: " + pat.current?.full_name);
          } catch {
            log("Paciente offline");
          }
        }
        const { memed_token } = await fetchMemedToken(MEDICO_ID);
        if (c) return;

        to.current = setTimeout(() => {
          if (!ready.current) err("Timeout 30s");
        }, 30000);

        const u = getMemedScriptUrl() + "?v=" + Date.now(); // cache buster
        const e = document.createElement("script");
        e.src = u;
        e.setAttribute("data-token", memed_token);
        e.setAttribute("data-container", "prescricao-controlados");
        e.setAttribute("data-color", "#6D28D9");
        e.async = true;
        e.onload = () => {
          if (c) return;
          log("Script ok");
          setS((p) => ({ ...p, phase: "loaded" }));
          let n = 0;
          iv.current = setInterval(() => {
            if (!window.MdHub) return;
            if (++n <= 3) log("MdHub: " + Object.keys(window.MdHub).join(","));
            if (!window.MdHub.command) return;
            clearInterval(iv.current);
            init();
          }, 400);
        };
        e.onerror = () => {
          if (!c) err("Script falhou");
        };
        document.body.appendChild(e);
        el.current = e;
      } catch (e) {
        if (!c) err(e.message);
      }
    }
    go();

    return () => {
      c = true;
      if (to.current) clearTimeout(to.current);
      if (iv.current) clearInterval(iv.current);
      // Cleanup: hide + logout + remove MdHub + remove script
      try {
        window.MdHub?.module?.hide?.("plataforma.prescricao");
      } catch {}
      try {
        window.MdHub?.command
          ?.send?.("plataforma.sdk", "logout")
          .catch(() => {});
      } catch {}
      delete window.MdHub;
      if (el.current?.parentNode) el.current.parentNode.removeChild(el.current);
      ready.current = false;
    };
  }, [pacienteId]);

  const cls = () => {
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
            onClick={cls}
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
