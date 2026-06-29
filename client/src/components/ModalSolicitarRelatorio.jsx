export default function ModalSolicitarRelatorio({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6" data-testid="modal-solicitar-relatorio" role="dialog" aria-modal="true" aria-label="Solicitar relatório">
        <h2 className="text-lg font-bold text-slate-800 mb-3">Solicitar Relatório</h2>
        <p className="text-sm text-slate-600 leading-relaxed mb-6">
          Entre em contato com nosso suporte para solicitar relatórios personalizados.
          <br /><br />
          <strong>E-mail:</strong>{" "}
          <a href="mailto:suporte@somed.com.br" className="text-brand-600 hover:underline">suporte@somed.com.br</a>
        </p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
