import { useEffect, useState } from "react";
import { fetchMemedToken } from "../api/memed";
import {
  showMemed,
  hideMemed,
  isMemedLoaded,
  isMemedLoading,
  getMemedError,
  onMemedState,
  preloadMemed,
  preloadAgain,
} from "../api/memedPreloader";

const MEDICO_ID = 1;

export default function MemedPrescription() {
  const [ready, setReady] = useState(isMemedLoaded());
  const [error, setError] = useState(getMemedError());
  const [loading, setLoading] = useState(
    !isMemedLoaded() && (isMemedLoading() || true),
  );

  // If preload failed or never started, try on-demand
  useEffect(() => {
    if (isMemedLoaded()) {
      showMemed();
      setReady(true);
      setLoading(false);
      return;
    }

    const unsub = onMemedState(({ loaded, error: err, loading: l }) => {
      if (err) {
        setError(err);
        setLoading(false);
        return;
      }
      if (loaded) {
        setReady(true);
        setLoading(false);
        setTimeout(() => showMemed(), 500);
      }
      setLoading(l);
    });

    // If never attempted or errored, try loading now
    if (getMemedError() || (!isMemedLoaded() && !isMemedLoading())) {
      setLoading(true);
      fetchMemedToken(MEDICO_ID)
        .then(({ memed_token }) => preloadMemed(memed_token))
        .catch((err) => {
          setError(err.message || "Token Memed indisponível");
          setLoading(false);
        });
    }

    return () => {
      hideMemed();
      unsub();
    };
  }, []);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    fetchMemedToken(MEDICO_ID)
      .then(({ memed_token }) => {
        preloadMemed(memed_token);
        setLoading(true);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  if (error)
    return (
      <div
        className="flex flex-col items-center justify-center h-full min-h-[400px] p-8"
        role="alert"
      >
        <p className="text-base font-medium text-slate-800 mb-1">
          Prescrição temporariamente indisponível
        </p>
        <p className="text-sm text-slate-500 text-center mb-4">{error}</p>
        <button
          onClick={handleRetry}
          className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          Tentar novamente
        </button>
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
      {(!ready || loading) && (
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
