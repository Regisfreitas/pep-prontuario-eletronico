import { TABS } from "../constants/tabs";

export default function FinalizedView({
  atendimentoId,
  urls,
  signed,
  onNewSession,
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            Atendimento Finalizado
          </h1>
          <p className="text-slate-500 mt-2">
            Atendimento #{atendimentoId} — documentos gerados com sucesso
            {signed ? " e assinados digitalmente" : ""}
          </p>
        </div>

        <div className="space-y-2">
          {TABS.map((tab) => (
            <div
              key={tab.id}
              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100"
            >
              <span className="text-sm font-medium text-slate-700">
                {tab.shortLabel}
              </span>
              <a
                href={urls?.[tab.id]}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-brand-600 hover:underline truncate max-w-[60%]"
              >
                {urls?.[tab.id]}
              </a>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onNewSession}
          className="w-full mt-8 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors"
        >
          Novo Atendimento
        </button>
      </div>
    </div>
  );
}
