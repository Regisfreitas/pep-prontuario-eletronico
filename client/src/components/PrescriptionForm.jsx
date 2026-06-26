import { useState } from "react";

// ---------- Shared form fields ----------

const MEDICAMENTOS_SUGESTAO = [
  "Paracetamol 500mg",
  "Ibuprofeno 600mg",
  "Amoxicilina 500mg",
  "Omeprazol 20mg",
  "Losartana 50mg",
  "Metformina 850mg",
  "Dipirona 500mg",
  "Dexametasona 4mg",
];

function LinhaPrescricao({ index, linha, onChange, onRemover, mode }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
      <span className="text-xs font-medium text-slate-400 mt-3 min-w-[20px]">
        {index + 1}
      </span>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-[11px] font-medium text-slate-500 mb-1 block">
            Medicamento
          </label>
          <input
            type="text"
            value={linha.medicamento}
            onChange={(e) => onChange(index, "medicamento", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/30"
            placeholder="Nome do medicamento"
            list={`sugestoes-${mode}-${index}`}
            data-testid={`prescricao-medicamento-${mode}-${index}`}
          />
          <datalist id={`sugestoes-${mode}-${index}`}>
            {MEDICAMENTOS_SUGESTAO.map((med) => (
              <option key={med} value={med} />
            ))}
          </datalist>
        </div>
        <div>
          <label className="text-[11px] font-medium text-slate-500 mb-1 block">
            Dosagem
          </label>
          <input
            type="text"
            value={linha.dosagem}
            onChange={(e) => onChange(index, "dosagem", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/30"
            placeholder="Ex: 1 comprimido"
            data-testid={`prescricao-dosagem-${mode}-${index}`}
          />
        </div>
        <div>
          <label className="text-[11px] font-medium text-slate-500 mb-1 block">
            Posologia
          </label>
          <input
            type="text"
            value={linha.posologia}
            onChange={(e) => onChange(index, "posologia", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/30"
            placeholder="Ex: 8/8h por 7 dias"
            data-testid={`prescricao-posologia-${mode}-${index}`}
          />
        </div>
      </div>
      <button
        type="button"
        onClick={() => onRemover(index)}
        className="mt-6 p-1 text-slate-400 hover:text-red-500 transition-colors"
        aria-label="Remover medicamento"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ---------- Form component ----------

export default function PrescriptionForm({ mode, onChange }) {
  const [linhas, setLinhas] = useState([
    { medicamento: "", dosagem: "", posologia: "" },
  ]);

  const handleChange = (index, field, value) => {
    const next = [...linhas];
    next[index] = { ...next[index], [field]: value };
    setLinhas(next);
    if (onChange) onChange(mode, next);
  };

  const handleAdicionar = () => {
    setLinhas((prev) => [...prev, { medicamento: "", dosagem: "", posologia: "" }]);
  };

  const handleRemover = (index) => {
    if (linhas.length === 1) return;
    setLinhas((prev) => prev.filter((_, i) => i !== index));
  };

  const dataTestId =
    mode === "simple" ? "prescription-form-simple" : "prescription-form-controlled";

  return (
    <div className="space-y-4" data-testid={dataTestId}>
      {linhas.map((linha, i) => (
        <LinhaPrescricao
          key={i}
          index={i}
          linha={linha}
          mode={mode}
          onChange={handleChange}
          onRemover={handleRemover}
        />
      ))}

      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={handleAdicionar}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-600 bg-brand-50 border border-brand-200 rounded-lg hover:bg-brand-100 transition-colors"
          data-testid={`prescricao-add-${mode}`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Adicionar Medicamento
        </button>

        {mode === "controlled" && (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Portaria 344/98
          </span>
        )}
      </div>
    </div>
  );
}
