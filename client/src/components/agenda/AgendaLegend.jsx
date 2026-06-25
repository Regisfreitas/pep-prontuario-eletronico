const LEGEND = [
  { color: 'bg-red-500', label: 'Calorimetria' },
  { color: 'bg-emerald-500', label: 'Consulta' },
  { color: 'bg-blue-500', label: 'Primeira Consulta' },
  { color: 'bg-amber-500', label: 'Retorno' },
  { color: 'bg-purple-500', label: 'Teleconsulta' },
];

export default function AgendaLegend() {
  return (
    <footer className="px-6 py-3 bg-white border-t border-slate-200">
      <div className="flex items-center gap-6 flex-wrap">
        {LEGEND.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${item.color}`} />
            <span className="text-xs text-slate-600">{item.label}</span>
          </div>
        ))}
      </div>
    </footer>
  );
}
