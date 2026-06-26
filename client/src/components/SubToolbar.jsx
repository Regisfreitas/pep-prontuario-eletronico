const TOOLBAR_ACTIONS = [
  'Salvar Modelo',
  'Histórico',
  'Visualizar Impressão',
  'Personalizar',
];

export default function SubToolbar() {
  return (
    <div className="flex items-center gap-2 px-6 py-2.5 bg-slate-50 border-b border-slate-200">
      {TOOLBAR_ACTIONS.map((action) => (
        <button
          key={action}
          type="button"
          className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:border-brand-600 hover:text-brand-600 transition-colors"
        >
          {action}
        </button>
      ))}
    </div>
  );
}
