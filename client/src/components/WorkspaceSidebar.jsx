import { TABS } from '../constants/tabs';

export default function Sidebar({ activeTab, onTabChange }) {
  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200 sticky top-[65px] h-[calc(100vh-65px)] overflow-y-auto">
      <div className="p-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">
          Módulos do Atendimento
        </p>
        <nav className="space-y-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-brand-600 text-white font-medium shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {tab.shortLabel}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
