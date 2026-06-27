import { useEffect, useState } from "react";
import {
  showMemed,
  hideMemed,
  isMemedLoaded,
  onMemedState,
} from "../api/memedPreloader";

export default function MemedPrescription() {
  const [ready, setReady] = useState(isMemedLoaded());
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isMemedLoaded()) {
      showMemed();
      setReady(true);
      return;
    }

    const unsub = onMemedState(({ loaded, error: err }) => {
      if (err) {
        setError(err);
        return;
      }
      if (loaded) {
        setReady(true);
        setTimeout(() => showMemed(), 500);
      }
    });

    return () => {
      hideMemed();
      unsub();
    };
  }, []);

  if (error)
    return (
      <div
        className="flex items-center justify-center h-full min-h-[400px] p-8"
        role="alert"
      >
        <p className="text-base font-medium text-slate-800 mb-2">
          Prescrição temporariamente indisponível
        </p>
        <p className="text-sm text-slate-500">{error}</p>
      </div>
    );

  return (
    <div
      className="flex flex-col h-full"
      role="region"
      aria-label="Prescricao de Controlados"
    >
      <div
        className="flex-1 bg-white"
        style={{ minWidth: 820, minHeight: 700 }}
      >
        <div id="prescricao-controlados" className="w-full h-full" />
      </div>
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/95 z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin" />
            <p className="text-sm text-slate-500">Carregando prescrição...</p>
          </div>
        </div>
      )}
    </div>
  );
}
