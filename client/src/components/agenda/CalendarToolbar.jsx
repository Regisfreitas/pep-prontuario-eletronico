const VIEWS = [
  { id: "month", label: "Mês" },
  { id: "week", label: "Semana" },
  { id: "day", label: "Dia" },
];

export default function CalendarToolbar({
  dateLabel,
  view,
  onViewChange,
  onNavigate,
  onToday,
}) {
  return (
    <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200 flex-wrap gap-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          data-testid="btn-today"
          onClick={onToday}
          className="px-3 py-1.5 text-sm font-medium text-slate-700 border border-slate-200 rounded-md hover:bg-slate-50"
        >
          Hoje
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onNavigate(-1)}
          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <span className="text-sm font-semibold text-slate-800 min-w-[200px] text-center capitalize">
          {dateLabel}
        </span>
        <button
          type="button"
          onClick={() => onNavigate(1)}
          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      <div className="flex items-center border border-slate-200 rounded-md overflow-hidden">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => onViewChange(v.id)}
            className={`px-4 py-1.5 text-sm font-medium transition-colors ${
              view === v.id
                ? "bg-medical-600 text-white"
                : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>
    </div>
  );
}
