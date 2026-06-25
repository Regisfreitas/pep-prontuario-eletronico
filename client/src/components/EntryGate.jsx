import { PATIENT } from '../constants/tabs';

export default function EntryGate({ onStart, loading, error }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-medical-50 to-slate-100 p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-medical-800 px-8 py-6 text-white">
          <p className="text-sm font-medium text-blue-200 uppercase tracking-wider">
            Prontuário Eletrônico
          </p>
          <h1 className="text-2xl font-bold mt-1">Painel Clínico</h1>
        </div>

        <div className="p-8">
          <div className="flex items-center gap-4 mb-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-14 h-14 rounded-full bg-medical-600 flex items-center justify-center text-white text-xl font-bold">
              {PATIENT.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">{PATIENT.name}</h2>
              <p className="text-sm text-slate-500">
                {PATIENT.age} anos · {PATIENT.gender} · {PATIENT.record}
              </p>
            </div>
          </div>

          <p className="text-slate-600 text-sm mb-6 leading-relaxed">
            Inicie o atendimento para reservar um registro único no banco de dados.
            Todas as alterações serão salvas automaticamente como rascunho.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={onStart}
            disabled={loading}
            className="w-full py-3.5 px-6 bg-medical-600 hover:bg-medical-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors shadow-sm"
          >
            {loading ? 'Iniciando atendimento...' : 'Iniciar Atendimento'}
          </button>
        </div>
      </div>
    </div>
  );
}
