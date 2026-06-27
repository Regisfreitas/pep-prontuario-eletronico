import { useEffect, useRef, useState } from "react";
import { fetchPatientById } from "../api/patients";
import { fetchMemedToken, getMemedScriptUrl } from "../api/memed";

const MEDICO_ID = 1;

export default function MemedPrescription({ pacienteId }) {
  const [phase, setPhase] = useState("loading");
  const [error, setError] = useState(null);
  const ready = useRef(false);

  useEffect(() => {
    let c = false;

    async function go() {
      try {
        if (pacienteId) {
          try {
            await fetchPatientById(pacienteId);
          } catch {}
        }

        const { memed_token } = await fetchMemedToken(MEDICO_ID);
        if (c) return;

        // Inject fresh script with cache-buster
        const script = document.createElement("script");
        script.src = getMemedScriptUrl() + "?_t=" + Date.now();
        script.setAttribute("data-token", memed_token);
        script.setAttribute("data-container", "prescricao-controlados");
        script.setAttribute("data-color", "#6D28D9");
        script.async = true;

        script.onload = () => {
          if (c) return;
          // Check for MdHub readiness
          const iv = setInterval(() => {
            if (!window.MdHub?.command) return;
            clearInterval(iv);
            setPhase("ready");
          }, 300);
          setTimeout(() => {
            clearInterval(iv);
            setPhase("ready");
          }, 8000);
          setTimeout(() => {
            if (!ready.current) {
              clearInterval(iv);
              setError("Timeout ao carregar módulo");
            }
          }, 30000);
        };

        script.onerror = () => {
          if (!c) setError("Falha ao carregar script");
        };
        document.body.appendChild(script);
      } catch (e) {
        if (!c) setError(e.message);
      }
    }

    go();

    return () => {
      c = true;
      // Do NOT destroy MdHub — the SDK manages its own lifecycle
    };
  }, [pacienteId]);

  if (error)
    return (
      <div
        className="flex items-center justify-center h-full min-h-[400px] p-8"
        role="alert"
      >
        <div className="text-center">
          <p className="text-base font-medium text-slate-800 mb-2">
            Prescrição temporariamente indisponível
          </p>
          <p className="text-sm text-slate-500">{error}</p>
        </div>
      </div>
    );

  return (
    <div
      className="flex flex-col h-full"
      role="region"
      aria-label="Prescrição de Controlados"
    >
      <div
        className="flex-1 bg-white"
        style={{ minWidth: 820, minHeight: 700 }}
      >
        <div id="prescricao-controlados" className="w-full h-full" />
      </div>
      {phase === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/95 z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin" />
            <p className="text-sm text-slate-500">Conectando à Memed...</p>
          </div>
        </div>
      )}
    </div>
  );
}
