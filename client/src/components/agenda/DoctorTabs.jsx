export default function DoctorTabs({ medicos, activeDoctorId, onSelect }) {
  const tabs = [
    { id: null, label: 'TODOS' },
    ...Object.entries(medicos).map(([id, nome]) => ({
      id: Number(id),
      label: nome,
    })),
  ];

  return (
    <div className="flex items-center gap-1 px-6 py-2 bg-white border-b border-slate-200 overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = activeDoctorId === tab.id;
        return (
          <button
            key={tab.label}
            type="button"
            onClick={() => onSelect(tab.id)}
            className={`shrink-0 px-4 py-2 text-xs font-bold uppercase tracking-wide rounded-t-md border-b-2 transition-colors ${
              isActive
                ? 'bg-[#c4a035] text-white border-[#a8862a]'
                : 'bg-[#d4b44a] text-white/90 border-transparent hover:bg-[#c4a035]'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
