import { PATIENT } from '../constants/tabs';

const QUICK_LINKS = ['Documentos', 'Exames', 'Formulários', 'Anotações'];

export default function Header({ onFinalizar, finalizing, saveStatus }) {
  const statusText =
    saveStatus === 'saving'
      ? 'Sincronizando alterações...'
      : saveStatus === 'saved'
        ? 'Alterações salvas'
        : saveStatus === 'error'
          ? 'Erro ao sincronizar'
          : null;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-bold">
            DA
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-800">{PATIENT.name}</h1>
            <p className="text-xs text-slate-500">
              {PATIENT.age} anos · Nasc. {PATIENT.birthDate} · {PATIENT.record}
            </p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {QUICK_LINKS.map((link) => (
            <button
              key={link}
              type="button"
              className="px-3 py-1.5 text-sm text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
            >
              {link}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {statusText && (
            <span
              className={`text-xs font-medium hidden sm:inline ${
                saveStatus === 'error' ? 'text-red-600' : 'text-slate-500'
              } ${saveStatus === 'saving' ? 'animate-pulse' : ''}`}
            >
              {statusText}
            </span>
          )}
          <button
            type="button"
            onClick={onFinalizar}
            disabled={finalizing}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            {finalizing ? 'Finalizando...' : 'Finalizar'}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
