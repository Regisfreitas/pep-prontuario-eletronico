import { useState } from "react";

export default function HeaderRelatorios({ titulo, onExportarTabela, onSolicitarRelatorio }) {
  const [pdfToast, setPdfToast] = useState(false);

  const handleExportarPDF = () => {
    setPdfToast(true);
    setTimeout(() => setPdfToast(false), 3000);
  };

  return (
    <div className="px-8 py-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
      <h1 className="text-xl font-bold text-slate-800">{titulo}</h1>

      <div className="flex items-center gap-3">
        <button
          data-testid="btn-exportar-pdf"
          onClick={handleExportarPDF}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Exportar PDF
        </button>

        <button
          data-testid="btn-exportar-tabela"
          onClick={onExportarTabela}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M4 8V6a2 2 0 012-2h12a2 2 0 012 2v2M4 12h16" />
          </svg>
          Exportar Tabela
        </button>

        <button
          data-testid="btn-solicitar-relatorio"
          onClick={onSolicitarRelatorio}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-brand-600 border border-brand-200 rounded-lg hover:bg-brand-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Precisa de um relatório específico?
        </button>
      </div>

      {pdfToast && (
        <div
          data-testid="toast-exportar-pdf"
          className="fixed bottom-6 right-6 bg-slate-800 text-white text-sm px-5 py-3 rounded-lg shadow-lg z-50"
        >
          Funcionalidade em breve
        </div>
      )}
    </div>
  );
}
