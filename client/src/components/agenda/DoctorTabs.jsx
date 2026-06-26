export default function DoctorTabs({ medicos }) {
  const loggedDoctor = medicos[1] || "Dr. Marco Silva";

  return (
    <div className="flex items-center gap-1 px-6 py-2 bg-white border-b border-slate-200">
      <button
        type="button"
        className="shrink-0 px-4 py-2 text-xs font-bold uppercase tracking-wide rounded-md bg-brand-600 text-white transition-colors"
      >
        {loggedDoctor}
      </button>
    </div>
  );
}
