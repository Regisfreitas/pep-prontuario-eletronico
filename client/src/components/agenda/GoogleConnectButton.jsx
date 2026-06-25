import { useState, useRef, useEffect } from 'react';

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export default function GoogleConnectButton({
  connected,
  loading,
  disconnecting,
  doctorName,
  onConnect,
  onDisconnect,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (loading) {
    return (
      <button
        type="button"
        disabled
        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-400 border border-slate-200 rounded-lg"
      >
        <GoogleIcon />
        Verificando...
      </button>
    );
  }

  if (connected) {
    return (
      <div className="relative flex" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
        >
          <GoogleIcon />
          <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          Google Agenda Sincronizado
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-slate-200 rounded-lg shadow-lg z-40 py-1">
            {doctorName && (
              <p className="px-4 py-2 text-xs text-slate-400 border-b border-slate-100">
                {doctorName}
              </p>
            )}
            <button
              type="button"
              disabled={disconnecting}
              onClick={() => {
                setMenuOpen(false);
                onDisconnect();
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              {disconnecting ? 'Desconectando...' : 'Desconectar'}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onConnect}
      className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-colors"
    >
      <GoogleIcon />
      Conectar Google Agenda
    </button>
  );
}
